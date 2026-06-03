CREATE TABLE profile_views (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewer_id   UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX profile_views_profile_id_idx ON profile_views (profile_id);
CREATE INDEX profile_views_viewed_at_idx  ON profile_views (viewed_at);

ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Anonymous visitors (viewer_id IS NULL) and authenticated users may record a view,
-- but an authenticated user cannot set viewer_id to a different user's ID.
-- Without this constraint a logged-in user could fabricate view counts attributed
-- to arbitrary other users, corrupting analytics for profile owners.
CREATE POLICY "Anyone can record a profile view"
  ON profile_views
  FOR INSERT
  WITH CHECK (viewer_id IS NULL OR viewer_id = auth.uid());

-- Only the profile owner can read their own view stats — no cross-user leakage
-- of who viewed whose profile.
CREATE POLICY "Profile owners can read their own views"
  ON profile_views
  FOR SELECT
  USING (profile_id = auth.uid());
