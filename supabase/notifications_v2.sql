-- ─── Notifications v2 migration ──────────────────────────────────────────────
-- Run this after notifications.sql to upgrade to granular order status types.
--
-- Changes:
--   1. Expands the type check constraint to include order_accepted,
--      order_delivered, order_completed (keeps existing types intact).
--   2. Replaces notify_order_status() with a granular version that fires
--      per-status type and notifies the correct recipient:
--        en_cours  → order_accepted  → client
--        livré     → order_delivered → client
--        terminé   → order_completed → freelancer
-- Note: INSERT into notifications is only done by SECURITY DEFINER triggers and
-- the service-role client (lib/notifications.ts); both bypass RLS automatically.


-- ─── 1. Update check constraint ──────────────────────────────────────────────

alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (type in (
    'new_message',
    'new_order',
    'order_accepted',
    'order_delivered',
    'order_completed',
    'order_status',
    'new_review'
  ));


-- ─── 2. Replace notify_order_status trigger ──────────────────────────────────

create or replace function public.notify_order_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type      text;
  v_title     text;
  v_body      text;
  v_recipient uuid;
begin
  if old.status is not distinct from new.status then
    return new;
  end if;

  case new.status
    when 'en_cours' then
      v_type      := 'order_accepted';
      v_title     := 'Commande acceptée';
      v_body      := 'Votre commande « ' || new.service_title || ' » a été acceptée par le freelance';
      v_recipient := new.client_id;
    when 'livré' then
      v_type      := 'order_delivered';
      v_title     := 'Livraison reçue';
      v_body      := 'Votre commande « ' || new.service_title || ' » a été livrée. Confirmez la réception.';
      v_recipient := new.client_id;
    when 'terminé' then
      v_type      := 'order_completed';
      v_title     := 'Commande terminée';
      v_body      := 'La commande « ' || new.service_title || ' » a été confirmée. Paiement libéré.';
      v_recipient := new.freelancer_id;
    else
      return new;
  end case;

  insert into public.notifications (user_id, type, title, body, link)
  values (v_recipient, v_type, v_title, v_body, '/dashboard');

  return new;
end;
$$;

-- Trigger already exists — recreating the function is enough since the trigger
-- still references it. No need to drop/recreate the trigger itself.
