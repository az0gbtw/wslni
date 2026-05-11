-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql

-- ─── Profiles table ───────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id             uuid references auth.users(id) on delete cascade primary key,
  full_name      text,
  job_title      text,
  bio            text,
  skills         text[]     not null default '{}',
  hourly_rate    numeric(10, 2),
  portfolio_links text[]    not null default '{}',
  avatar_url     text,
  updated_at     timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are publicly viewable"
  on public.profiles for select
  using (true);

create policy "Users can create their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-update updated_at on every write
create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute function handle_updated_at();

-- ─── Storage: avatars bucket ──────────────────────────────────────────────────
-- You can also create this bucket in the Supabase Dashboard → Storage → New bucket
-- Name: avatars, Public: true

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Users can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
