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

-- Drop and recreate all service policies so the conditions are always current.
DROP POLICY IF EXISTS "Services are publicly viewable"    ON public.services;
DROP POLICY IF EXISTS "Users can insert their own services" ON public.services;
DROP POLICY IF EXISTS "Users can update their own services" ON public.services;
DROP POLICY IF EXISTS "Users can delete their own services" ON public.services;

-- Visitors see only published services; owners also see their drafts/archived
-- services so the freelancer dashboard can list and edit them.
CREATE POLICY "Services are publicly viewable"
  ON public.services FOR SELECT
  USING (status = 'published' OR auth.uid() = user_id);

-- user_id must equal the inserting user — prevents creating services on behalf of others.
CREATE POLICY "Users can insert their own services"
  ON public.services FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- USING restricts which rows can be updated; WITH CHECK prevents the owner field
-- from being swapped to a different user during the update.
CREATE POLICY "Users can update their own services"
  ON public.services FOR UPDATE
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Cascades to service-images and portfolio_items via application code.
CREATE POLICY "Users can delete their own services"
  ON public.services FOR DELETE
  USING (auth.uid() = user_id);

-- Reuses handle_updated_at() defined in schema.sql
create trigger on_services_updated
  before update on public.services
  for each row execute function handle_updated_at();
