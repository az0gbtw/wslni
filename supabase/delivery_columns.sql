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

-- USING guards which rows can be touched; WITH CHECK prevents a freelancer from
-- changing freelancer_id to hijack another freelancer's payment or metrics.
drop policy if exists "Les freelances peuvent mettre à jour leurs commandes" on public.orders;
create policy "Les freelances peuvent mettre à jour leurs commandes"
  on public.orders for update
  using     (auth.uid() = freelancer_id)
  with check (auth.uid() = freelancer_id);

-- Mirrors the freelancer policy: client cannot reassign client_id after creation.
drop policy if exists "Les clients peuvent mettre à jour leurs commandes" on public.orders;
create policy "Les clients peuvent mettre à jour leurs commandes"
  on public.orders for update
  using     (auth.uid() = client_id)
  with check (auth.uid() = client_id);

-- ─── Storage bucket ─────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
  values ('order-deliverables', 'order-deliverables', true)
  on conflict (id) do nothing;

-- Path convention: orders/{order_id}/{filename}
-- foldername(name)[1] = 'orders', foldername(name)[2] = order_id UUID.

-- Only the order client or freelancer can download a deliverable.  The bucket is
-- technically public, but the storage API still enforces RLS — a missing SELECT
-- policy would prevent any programmatic download via the Supabase client.
drop policy if exists "Order parties can view deliverables" on storage.objects;
create policy "Order parties can view deliverables"
  on storage.objects for select
  using (
    bucket_id = 'order-deliverables'
    and exists (
      select 1 from public.orders
      where id::text = (storage.foldername(name))[2]
        and (client_id = auth.uid() or freelancer_id = auth.uid())
    )
  );

-- Only the assigned freelancer may upload a deliverable for a given order.
-- Without the orders join any authenticated user could write to any order path.
drop policy if exists "Freelancers upload deliverables" on storage.objects;
create policy "Freelancers upload deliverables"
  on storage.objects for insert
  with check (
    bucket_id = 'order-deliverables'
    and exists (
      select 1 from public.orders
      where id::text = (storage.foldername(name))[2]
        and freelancer_id = auth.uid()
    )
  );

-- Freelancers can replace a deliverable (e.g. revision upload).
drop policy if exists "Freelancers update deliverables" on storage.objects;
create policy "Freelancers update deliverables"
  on storage.objects for update
  using (
    bucket_id = 'order-deliverables'
    and exists (
      select 1 from public.orders
      where id::text = (storage.foldername(name))[2]
        and freelancer_id = auth.uid()
    )
  );

-- Freelancers can remove a deliverable before re-uploading a revised version.
drop policy if exists "Freelancers delete deliverables" on storage.objects;
create policy "Freelancers delete deliverables"
  on storage.objects for delete
  using (
    bucket_id = 'order-deliverables'
    and exists (
      select 1 from public.orders
      where id::text = (storage.foldername(name))[2]
        and freelancer_id = auth.uid()
    )
  );
