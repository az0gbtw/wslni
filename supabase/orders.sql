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

-- Les clients peuvent voir leurs propres commandes
create policy "Les clients peuvent voir leurs commandes"
  on public.orders for select
  using (auth.uid() = client_id);

-- Les freelances peuvent voir les commandes reçues sur leurs services
create policy "Les freelances peuvent voir les commandes reçues"
  on public.orders for select
  using (auth.uid() = freelancer_id);

-- Les clients peuvent créer des commandes (uniquement pour eux-mêmes)
create policy "Les clients peuvent créer des commandes"
  on public.orders for insert
  with check (auth.uid() = client_id);

-- Reuses handle_updated_at() defined in schema.sql
create trigger on_orders_updated
  before update on public.orders
  for each row execute function handle_updated_at();
