
-- Fix admin account activation status
UPDATE public.profiles 
SET 
  admin_activated = true,
  invitation_status = 'completed',
  updated_at = now()
WHERE email = 'admin@demo.com' AND role = 'coordinator';

-- Also update any corresponding agent_invitations record
UPDATE public.agent_invitations 
SET 
  status = 'accepted',
  accepted_at = now()
WHERE email = 'admin@demo.com';
