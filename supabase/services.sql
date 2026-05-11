-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- Requires schema.sql to have been run first (uses handle_updated_at function)

-- ─── Services table ────────────────────────────────────────────────────────────

create table if not exists public.services (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  title         text not null,
  description   text not null,
  category      text not null,
  price         numeric(10, 2) not null check (price > 0),
  delivery_days integer not null check (delivery_days > 0),
  status        text not null default 'published'
                  check (status in ('published', 'draft', 'archived')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.services enable row level security;

create policy "Les services publiés sont visibles par tous"
  on public.services for select
  using (status = 'published');

create policy "Les utilisateurs peuvent créer leurs propres services"
  on public.services for insert
  with check (auth.uid() = user_id);

create policy "Les utilisateurs peuvent modifier leurs propres services"
  on public.services for update
  using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent supprimer leurs propres services"
  on public.services for delete
  using (auth.uid() = user_id);

-- Reuses handle_updated_at() defined in schema.sql
create trigger on_services_updated
  before update on public.services
  for each row execute function handle_updated_at();
