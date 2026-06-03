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
-- Path convention: {service_id}/{timestamp}-{random}.{ext}
-- foldername(name)[1] = service_id UUID.

-- Portfolio files are shown publicly on service detail pages.
CREATE POLICY "service_portfolios_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'service-portfolios');

-- Only the owner of the service may upload portfolio files.
-- Without the services join, any authenticated user could upload into any
-- service's folder — including a competitor's service page.
CREATE POLICY "service_portfolios_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'service-portfolios'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.services
      WHERE id::text = (storage.foldername(name))[1]
        AND user_id  = auth.uid()
    )
  );

-- Only the service owner may delete their own portfolio files.
-- Prevents any authenticated user from sabotaging another freelancer's portfolio.
CREATE POLICY "service_portfolios_auth_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'service-portfolios'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.services
      WHERE id::text = (storage.foldername(name))[1]
        AND user_id  = auth.uid()
    )
  );
