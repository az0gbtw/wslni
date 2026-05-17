-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
--
-- This trigger auto-creates a profiles row whenever a new user signs up
-- in auth.users so the application always has a matching profile record.

-- 1. Function called by the trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer                  -- runs as DB owner, bypasses RLS
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',   -- populated when passed during signUp()
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;   -- safe to re-run; won't overwrite existing rows
  return new;
end;
$$;

-- 2. Trigger that fires after every new row in auth.users
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
