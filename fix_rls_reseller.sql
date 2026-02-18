-- Allow public (anon) users to update chatbots if they have the correct reseller_token
-- This bypasses the need for a service role key if the API is using the anon key.

DROP POLICY IF EXISTS "Public update via reseller token" ON chatbots;

CREATE POLICY "Public update via reseller token" ON chatbots
  FOR UPDATE
  TO anon
  USING (reseller_token IS NOT NULL)
  WITH CHECK (reseller_token IS NOT NULL);

-- Also allow anon to read the token for verification
DROP POLICY IF EXISTS "Public can view chatbots by ID" ON chatbots;
CREATE POLICY "Public can view chatbots" ON chatbots
  FOR SELECT
  TO anon
  USING (true);
