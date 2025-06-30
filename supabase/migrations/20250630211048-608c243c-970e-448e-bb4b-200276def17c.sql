
-- Add new columns to profiles table for enhanced admin control
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS manual_setup boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS setup_method text DEFAULT 'email_invitation',
ADD COLUMN IF NOT EXISTS admin_activated boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_method text DEFAULT 'standard';

-- Add new status options to agent_invitations table
ALTER TABLE public.agent_invitations 
ADD COLUMN IF NOT EXISTS creation_method text DEFAULT 'email_invitation',
ADD COLUMN IF NOT EXISTS setup_link_token text,
ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS admin_notes text;

-- Create index for setup link tokens
CREATE INDEX IF NOT EXISTS idx_agent_invitations_setup_link_token 
ON public.agent_invitations(setup_link_token) WHERE setup_link_token IS NOT NULL;

-- Create function for manual agent creation
CREATE OR REPLACE FUNCTION public.create_manual_agent(
  p_email text,
  p_first_name text,
  p_last_name text,
  p_phone text DEFAULT NULL,
  p_brokerage text DEFAULT NULL,
  p_password text DEFAULT NULL,
  p_created_by uuid DEFAULT auth.uid()
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  temp_password text;
  result json;
BEGIN
  -- Generate temporary password if none provided
  IF p_password IS NULL THEN
    temp_password := encode(gen_random_bytes(12), 'base64');
  ELSE
    temp_password := p_password;
  END IF;

  -- Create user with admin privileges (bypassing email confirmation)
  SELECT id INTO new_user_id FROM auth.users WHERE email = p_email;
  
  IF new_user_id IS NULL THEN
    -- User doesn't exist, create new one
    INSERT INTO auth.users (
      email,
      email_confirmed_at,
      raw_user_meta_data
    ) VALUES (
      p_email,
      now(), -- Immediately confirm email for manual creation
      json_build_object(
        'first_name', p_first_name,
        'last_name', p_last_name,
        'phone', p_phone,
        'brokerage', p_brokerage,
        'role', 'agent'
      )
    ) RETURNING id INTO new_user_id;
  END IF;

  -- Update or create profile
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    phone_number,
    brokerage,
    role,
    manual_setup,
    setup_method,
    admin_activated,
    onboarding_method,
    invitation_status,
    invited_by,
    invited_at
  ) VALUES (
    new_user_id,
    p_email,
    p_first_name,
    p_last_name,
    p_phone,
    p_brokerage,
    'agent',
    true,
    'manual_creation',
    true,
    'assisted_setup',
    'completed',
    p_created_by,
    now()
  ) ON CONFLICT (id) DO UPDATE SET
    manual_setup = true,
    setup_method = 'manual_creation',
    admin_activated = true,
    onboarding_method = 'assisted_setup',
    invitation_status = 'completed',
    invited_by = p_created_by,
    invited_at = now();

  -- Create invitation record
  INSERT INTO public.agent_invitations (
    invited_by,
    agent_id,
    email,
    status,
    creation_method,
    invited_at,
    accepted_at
  ) VALUES (
    p_created_by,
    new_user_id,
    p_email,
    'accepted',
    'manual_creation',
    now(),
    now()
  );

  result := json_build_object(
    'success', true,
    'agent_id', new_user_id,
    'email', p_email,
    'temporary_password', temp_password,
    'message', 'Agent created manually and activated'
  );

  RETURN result;
END;
$$;

-- Create function to generate setup links
CREATE OR REPLACE FUNCTION public.generate_agent_setup_link(
  p_agent_id uuid,
  p_expires_hours integer DEFAULT 24
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  setup_token text;
BEGIN
  -- Generate unique setup token
  setup_token := encode(gen_random_bytes(32), 'base64url');
  
  -- Update agent invitation with setup link
  UPDATE public.agent_invitations 
  SET 
    setup_link_token = setup_token,
    expires_at = now() + (p_expires_hours || ' hours')::interval,
    status = 'link_generated'
  WHERE agent_id = p_agent_id;
  
  RETURN setup_token;
END;
$$;

-- Create function for bulk agent status updates
CREATE OR REPLACE FUNCTION public.bulk_update_agent_status(
  p_agent_ids uuid[],
  p_new_status text,
  p_updated_by uuid DEFAULT auth.uid()
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE public.profiles 
  SET 
    invitation_status = p_new_status,
    updated_at = now(),
    admin_activated = CASE WHEN p_new_status = 'completed' THEN true ELSE admin_activated END
  WHERE 
    id = ANY(p_agent_ids)
    AND role = 'agent';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  -- Log the bulk operation
  INSERT INTO public.activity_logs (
    user_id,
    action,
    description,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    p_updated_by,
    'bulk_agent_status_update',
    'Bulk updated ' || updated_count || ' agents to ' || p_new_status,
    'profile',
    gen_random_uuid(),
    jsonb_build_object(
      'agent_ids', p_agent_ids,
      'new_status', p_new_status,
      'updated_count', updated_count
    )
  );
  
  RETURN updated_count;
END;
$$;
