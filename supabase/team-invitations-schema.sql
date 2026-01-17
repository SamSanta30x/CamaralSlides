-- Create team_invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  invited_email TEXT NOT NULL,
  invited_by_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_by_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Member' CHECK (role IN ('Admin', 'Member')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  invitation_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(organization_id, invited_email)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_org ON team_invitations(organization_id);

-- Enable Row Level Security
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view invitations sent to their email
CREATE POLICY "Users can view invitations sent to them"
  ON team_invitations
  FOR SELECT
  USING (invited_email = auth.jwt()->>'email');

-- Policy: Users can view invitations they sent
CREATE POLICY "Users can view invitations they sent"
  ON team_invitations
  FOR SELECT
  USING (invited_by_id = auth.uid());

-- Policy: Organization owners can create invitations
CREATE POLICY "Organization owners can create invitations"
  ON team_invitations
  FOR INSERT
  WITH CHECK (invited_by_id = auth.uid());

-- Policy: Organization owners can update their invitations
CREATE POLICY "Organization owners can update invitations"
  ON team_invitations
  FOR UPDATE
  USING (invited_by_id = auth.uid());

-- Policy: Invited users can update invitation status (accept/reject)
CREATE POLICY "Invited users can update invitation status"
  ON team_invitations
  FOR UPDATE
  USING (invited_email = auth.jwt()->>'email');

-- Function to automatically expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE team_invitations
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$;

-- Create organizations table to store organization metadata
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  is_organization BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own organization
CREATE POLICY "Users can view their own organization"
  ON organizations
  FOR SELECT
  USING (owner_id = auth.uid());

-- Policy: Users can create their own organization
CREATE POLICY "Users can create their own organization"
  ON organizations
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Policy: Users can update their own organization
CREATE POLICY "Users can update their own organization"
  ON organizations
  FOR UPDATE
  USING (owner_id = auth.uid());

-- Create team_members table to store team member relationships
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'Member' CHECK (role IN ('Owner', 'Admin', 'Member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Policy: Team members can view other members in their organization
CREATE POLICY "Team members can view organization members"
  ON team_members
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Policy: Organization owners can manage team members
CREATE POLICY "Organization owners can manage team members"
  ON team_members
  FOR ALL
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );
