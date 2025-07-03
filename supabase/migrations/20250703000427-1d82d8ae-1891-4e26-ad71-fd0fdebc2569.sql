
-- Fix admin account activation for the specific user ID
UPDATE public.profiles 
SET 
  admin_activated = true,
  invitation_status = 'completed',
  updated_at = now()
WHERE id = '600147f7-a780-434a-9bce-43273ab42ae5';

-- Also update any corresponding agent_invitations record for this user
UPDATE public.agent_invitations 
SET 
  status = 'accepted',
  accepted_at = now()
WHERE agent_id = '600147f7-a780-434a-9bce-43273ab42ae5';

-- Double-check: Also update by email if the user exists
UPDATE public.profiles 
SET 
  admin_activated = true,
  invitation_status = 'completed',
  updated_at = now()
WHERE email = 'admin@demo.com' AND role = 'coordinator';

-- And update agent_invitations by email as well
UPDATE public.agent_invitations 
SET 
  status = 'accepted',
  accepted_at = now()
WHERE email = 'admin@demo.com';
