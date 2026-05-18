-- CIN Verification System
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- ─── Add columns to profiles ──────────────────────────────────────────────────

alter table public.profiles
  add column if not exists cin_status text not null default 'none',
  add column if not exists cin_uploaded_at timestamptz,
  add column if not exists role text not null default 'user';

-- ─── cin-uploads private Storage bucket ──────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('cin-uploads', 'cin-uploads', false)
on conflict (id) do nothing;

-- Freelancers can upload their own CIN (path: {user_id}/cin.jpg)
create policy "Freelancers can upload their own CIN"
  on storage.objects for insert
  with check (
    bucket_id = 'cin-uploads'
    and auth.role() = 'authenticated'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Freelancers can update their own CIN"
  on storage.objects for update
  using (
    bucket_id = 'cin-uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- No public SELECT — admin reads via service role / signed URLs only
