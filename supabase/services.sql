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

-- Published services are visible to everyone
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'services'
      AND policyname = 'Services are publicly viewable'
  ) THEN
    CREATE POLICY "Services are publicly viewable"
      ON public.services FOR SELECT
      USING (status = 'published');
  END IF;
END $$;

-- Owners can insert, update, delete their own services
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'services'
      AND policyname = 'Users can insert their own services'
  ) THEN
    CREATE POLICY "Users can insert their own services"
      ON public.services FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'services'
      AND policyname = 'Users can update their own services'
  ) THEN
    CREATE POLICY "Users can update their own services"
      ON public.services FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'services'
      AND policyname = 'Users can delete their own services'
  ) THEN
    CREATE POLICY "Users can delete their own services"
      ON public.services FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Reuses handle_updated_at() defined in schema.sql
create trigger on_services_updated
  before update on public.services
  for each row execute function handle_updated_at();
