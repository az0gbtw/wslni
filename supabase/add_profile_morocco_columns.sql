-- Add Morocco-specific columns to profiles
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS languages text[];
