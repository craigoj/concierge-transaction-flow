
-- Comprehensive fix for admin account activation
-- This migration ensures the admin account is properly activated

-- First, let's check and update the specific user ID
UPDATE public.profiles 
SET 
  admin_activated = true,
  invitation_status = 'completed',
  updated_at = now()
WHERE id = '600147f7-a780-434a-9bce-43273ab42ae5';

-- Update by email as well to catch any variations
UPDATE public.profiles 
SET 
  admin_activated = true,
  invitation_status = 'completed',
  updated_at = now()
WHERE email = 'admin@demo.com' AND role = 'coordinator';

-- Update agent_invitations for the specific user ID
UPDATE public.agent_invitations 
SET 
  status = 'accepted',
  accepted_at = now(),
  expires_at = null
WHERE agent_id = '600147f7-a780-434a-9bce-43273ab42ae5';

-- Update agent_invitations by email
UPDATE public.agent_invitations 
SET 
  status = 'accepted',
  accepted_at = now(),
  expires_at = null
WHERE email = 'admin@demo.com';

-- Ensure there's a valid agent_invitations record if none exists
INSERT INTO public.agent_invitations (
  invited_by,
  agent_id,
  email,
  status,
  creation_method,
  invited_at,
  accepted_at,
  invitation_token
) 
SELECT 
  '600147f7-a780-434a-9bce-43273ab42ae5',
  '600147f7-a780-434a-9bce-43273ab42ae5',
  'admin@demo.com',
  'accepted',
  'manual_creation',
  now(),
  now(),
  'admin-setup-' || gen_random_uuid()::text
WHERE NOT EXISTS (
  SELECT 1 FROM public.agent_invitations 
  WHERE agent_id = '600147f7-a780-434a-9bce-43273ab42ae5'
);

-- Final verification: Ensure the profile exists and is properly configured
INSERT INTO public.profiles (
  id,
  email,
  first_name,
  last_name,
  role,
  admin_activated,
  invitation_status,
  invited_by,
  invited_at
) 
SELECT 
  '600147f7-a780-434a-9bce-43273ab42ae5',
  'admin@demo.com',
  'Admin',
  'User',
  'coordinator',
  true,
  'completed',
  '600147f7-a780-434a-9bce-43273ab42ae5',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = '600147f7-a780-434a-9bce-43273ab42ae5'
);
