-- ─── Notifications ─────────────────────────────────────────────────────────
-- Run after schema.sql, services.sql, orders.sql, messages.sql, reviews.sql

create table if not exists public.notifications (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  type       text        not null check (type in ('new_message','new_order','order_status','new_review')),
  title      text        not null,
  body       text,
  link       text,
  is_read    boolean     not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "Voir ses propres notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Marquer ses notifications comme lues"
  on public.notifications for update
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Realtime
alter publication supabase_realtime add table public.notifications;


-- ─── Trigger: nouveau message → notifie le destinataire ─────────────────────

create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recipient uuid;
  v_preview   text;
begin
  select
    case
      when c.participant1_id = new.sender_id then c.participant2_id
      else c.participant1_id
    end
  into v_recipient
  from public.conversations c
  where c.id = new.conversation_id;

  if v_recipient is null then
    return new;
  end if;

  v_preview := left(new.content, 80);
  if char_length(new.content) > 80 then
    v_preview := v_preview || '…';
  end if;

  insert into public.notifications (user_id, type, title, body, link)
  values (v_recipient, 'new_message', 'Nouveau message', v_preview, '/messages');

  return new;
end;
$$;

drop trigger if exists on_new_message on public.messages;
create trigger on_new_message
  after insert on public.messages
  for each row execute function public.notify_new_message();


-- ─── Trigger: nouvelle commande → notifie le freelance ──────────────────────

create or replace function public.notify_new_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, body, link)
  values (
    new.freelancer_id,
    'new_order',
    'Nouvelle commande',
    'Vous avez reçu une commande pour « ' || new.service_title || ' »',
    '/dashboard'
  );
  return new;
end;
$$;

drop trigger if exists on_new_order on public.orders;
create trigger on_new_order
  after insert on public.orders
  for each row execute function public.notify_new_order();


-- ─── Trigger: statut de commande modifié → notifie le client ────────────────

create or replace function public.notify_order_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_label text;
begin
  if old.status is not distinct from new.status then
    return new;
  end if;

  v_label := case new.status
    when 'en_cours' then 'En cours'
    when 'livré'    then 'Livré ✓'
    when 'annulé'   then 'Annulé'
    else new.status
  end;

  insert into public.notifications (user_id, type, title, body, link)
  values (
    new.client_id,
    'order_status',
    'Commande mise à jour',
    'Votre commande « ' || new.service_title || ' » est maintenant : ' || v_label,
    '/dashboard'
  );
  return new;
end;
$$;

drop trigger if exists on_order_status_changed on public.orders;
create trigger on_order_status_changed
  after update on public.orders
  for each row execute function public.notify_order_status();


-- ─── Trigger: nouvel avis → notifie le freelance ────────────────────────────

create or replace function public.notify_new_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_body text;
begin
  v_body := 'Vous avez reçu un avis ' || new.rating || '/5';
  if new.comment is not null and trim(new.comment) <> '' then
    v_body := v_body || ' : « ' || left(trim(new.comment), 60) || ' »';
  end if;

  insert into public.notifications (user_id, type, title, body, link)
  values (new.freelancer_id, 'new_review', 'Nouvel avis reçu', v_body, '/profil');

  return new;
end;
$$;

drop trigger if exists on_new_review on public.reviews;
create trigger on_new_review
  after insert on public.reviews
  for each row execute function public.notify_new_review();
