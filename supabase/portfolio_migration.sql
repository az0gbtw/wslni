-- 1. Add portfolio_items column to services
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS portfolio_items JSONB DEFAULT '[]'::jsonb;

-- 2. Create the service-portfolios storage bucket (public, 5 MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-portfolios',
  'service-portfolios',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif','application/pdf']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Storage RLS policies
CREATE POLICY "service_portfolios_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'service-portfolios');

CREATE POLICY "service_portfolios_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'service-portfolios' AND auth.role() = 'authenticated');

CREATE POLICY "service_portfolios_auth_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'service-portfolios' AND auth.role() = 'authenticated');
