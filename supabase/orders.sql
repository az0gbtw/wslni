-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- Requires schema.sql and services.sql to have been run first

-- ─── Orders table ──────────────────────────────────────────────────────────────

create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  service_id     uuid references public.services(id) on delete cascade not null,
  client_id      uuid references auth.users(id) on delete cascade not null,
  freelancer_id  uuid references auth.users(id) on delete cascade not null,
  service_title  text not null,
  price          numeric(10, 2) not null check (price > 0),
  status         text not null default 'en_attente'
                   check (status in ('en_attente', 'en_cours', 'livré', 'annulé')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint pas_auto_commande check (client_id != freelancer_id)
);

alter table public.orders enable row level security;

-- Each party only sees their own side of the marketplace.
create policy "Les clients peuvent voir leurs commandes"
  on public.orders for select
  using (auth.uid() = client_id);

-- Freelancers need to read orders to manage delivery and status updates.
create policy "Les freelances peuvent voir les commandes reçues"
  on public.orders for select
  using (auth.uid() = freelancer_id);

-- client_id must equal the inserting user, AND freelancer_id must be the actual
-- owner of the service — prevents a client from fabricating orders that attribute
-- revenue or work to an arbitrary user.
create policy "Les clients peuvent créer des commandes"
  on public.orders for insert
  with check (
    auth.uid() = client_id
    AND EXISTS (
      SELECT 1 FROM public.services
      WHERE id       = service_id
        AND user_id  = freelancer_id
        AND status   = 'published'
    )
  );

-- Reuses handle_updated_at() defined in schema.sql
create trigger on_orders_updated
  before update on public.orders
  for each row execute function handle_updated_at();
