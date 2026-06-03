-- Add missing columns to the services table.
-- Run this in the Supabase SQL Editor BEFORE deploying the updated app.

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS images        JSONB   NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS pricing_tiers JSONB,
  ADD COLUMN IF NOT EXISTS category_group TEXT,
  ADD COLUMN IF NOT EXISTS requirements  JSONB   NOT NULL DEFAULT '[]'::jsonb;

-- ─── Storage bucket ────────────────────────────────────────────────────────────
-- Create the service-images bucket (public read).
-- If your Supabase plan requires it, create the bucket via the dashboard instead.

INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true)
ON CONFLICT (id) DO NOTHING;

-- Service images appear on public listing and detail pages — no auth required.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'service-images: public read'
  ) THEN
    CREATE POLICY "service-images: public read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'service-images');
  END IF;
END $$;

-- Path convention: {user_id}/{timestamp}-{random}.{ext}
-- Scoping to the first folder segment prevents a user from uploading into
-- another user's folder and having images appear under the wrong service.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'service-images: owner insert'
  ) THEN
    CREATE POLICY "service-images: owner insert"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'service-images'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;

-- Allows removing old images when a service is updated or deleted.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'service-images: owner delete'
  ) THEN
    CREATE POLICY "service-images: owner delete"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'service-images'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;
