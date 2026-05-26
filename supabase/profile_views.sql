CREATE TABLE profile_views (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewer_id   UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX profile_views_profile_id_idx ON profile_views (profile_id);
CREATE INDEX profile_views_viewed_at_idx  ON profile_views (viewed_at);

ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can record a profile view
CREATE POLICY "Anyone can record a profile view"
  ON profile_views
  FOR INSERT
  WITH CHECK (true);

-- Only the profile owner can read their own view stats
CREATE POLICY "Profile owners can read their own views"
  ON profile_views
  FOR SELECT
  USING (profile_id = auth.uid());
