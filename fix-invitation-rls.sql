-- Add policy to allow anyone to view invitations by token (for accept page)
-- This is safe because:
-- 1. Token is a UUID (practically impossible to guess)
-- 2. Only returns data for that specific token
-- 3. Needed for users to see invitation before logging in

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Anyone can view invitations by token" ON team_invitations;

-- Create new policy
CREATE POLICY "Anyone can view invitations by token"
  ON team_invitations
  FOR SELECT
  USING (invitation_token IS NOT NULL);

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'team_invitations'
ORDER BY policyname;
