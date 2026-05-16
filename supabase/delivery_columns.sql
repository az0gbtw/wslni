-- Run this in your Supabase SQL Editor after orders.sql
-- Adds delivery columns and order-deliverables storage bucket

-- ─── New columns on orders ──────────────────────────────────────────────────

alter table public.orders
  add column if not exists deliverable_url      text,
  add column if not exists deliverable_filename text,
  add column if not exists completion_note      text;

-- Include 'terminé' in the status constraint (drop + recreate)
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders
  add constraint orders_status_check
  check (status in ('en_attente', 'en_cours', 'livré', 'annulé', 'terminé'));

-- ─── Update policies (freelancer can update, client can confirm) ─────────────

drop policy if exists "Les freelances peuvent mettre à jour leurs commandes" on public.orders;
create policy "Les freelances peuvent mettre à jour leurs commandes"
  on public.orders for update
  using (auth.uid() = freelancer_id);

drop policy if exists "Les clients peuvent mettre à jour leurs commandes" on public.orders;
create policy "Les clients peuvent mettre à jour leurs commandes"
  on public.orders for update
  using (auth.uid() = client_id);

-- ─── Storage bucket ─────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
  values ('order-deliverables', 'order-deliverables', true)
  on conflict (id) do nothing;

-- Authenticated users can upload (path: orders/<orderId>/<filename>)
drop policy if exists "Freelancers upload deliverables" on storage.objects;
create policy "Freelancers upload deliverables"
  on storage.objects for insert
  with check (
    bucket_id = 'order-deliverables' and
    auth.uid() is not null
  );

drop policy if exists "Freelancers update deliverables" on storage.objects;
create policy "Freelancers update deliverables"
  on storage.objects for update
  using (
    bucket_id = 'order-deliverables' and
    auth.uid() is not null
  );
