
-- Add agent invitation tracking
ALTER TABLE profiles ADD COLUMN invitation_status TEXT DEFAULT 'pending';
ALTER TABLE profiles ADD COLUMN invitation_token TEXT;
ALTER TABLE profiles ADD COLUMN invited_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN invited_by UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Create index for invitation tokens
CREATE INDEX idx_profiles_invitation_token ON profiles(invitation_token) WHERE invitation_token IS NOT NULL;

-- Update the user role enum to ensure we have proper agent role
-- (This may already exist, but ensuring it's there)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('agent', 'coordinator');
    END IF;
END $$;

-- Create agent invitations audit table for tracking
CREATE TABLE agent_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invited_by UUID NOT NULL REFERENCES profiles(id),
  agent_id UUID NOT NULL REFERENCES profiles(id),
  email TEXT NOT NULL,
  invitation_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'sent',
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on agent_invitations
ALTER TABLE agent_invitations ENABLE ROW LEVEL SECURITY;

-- Policy for coordinators to manage invitations
CREATE POLICY "Coordinators can manage agent invitations" 
  ON agent_invitations 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'coordinator'
    )
  );

-- Policy for agents to view their own invitations
CREATE POLICY "Agents can view their own invitations" 
  ON agent_invitations 
  FOR SELECT 
  USING (agent_id = auth.uid());
