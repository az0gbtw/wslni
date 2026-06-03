-- Favorites table
create table if not exists public.favorites (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favorites_user_service_unique unique (user_id, service_id)
);

alter table public.favorites enable row level security;

-- Favorites are personal — users cannot see or enumerate other users' saved services.
create policy "Users can view their own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

-- Prevents inserting a favorite attributed to a different user.
-- The UNIQUE (user_id, service_id) constraint prevents duplicate saves.
create policy "Users can insert their own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

-- Allows users to un-save a service.  UPDATE is intentionally absent — the only
-- mutable action on a favorite is removal.
create policy "Users can delete their own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);
