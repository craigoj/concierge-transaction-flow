
-- Fix the create_manual_agent function to handle activity logging properly
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

  -- Check if user already exists
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
    accepted_at,
    invitation_token
  ) VALUES (
    p_created_by,
    new_user_id,
    p_email,
    'accepted',
    'manual_creation',
    now(),
    now(),
    'manual-' || new_user_id::text
  );

  -- Log the activity properly with valid user_id
  INSERT INTO public.enhanced_activity_logs (
    user_id,
    target_user_id,
    action,
    category,
    description,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    p_created_by, -- The coordinator creating the agent
    new_user_id,  -- The agent being created
    'manual_agent_creation',
    'agent_management',
    'Manually created agent: ' || p_first_name || ' ' || p_last_name,
    'profile',
    new_user_id,
    jsonb_build_object(
      'email', p_email,
      'setup_method', 'manual_creation'
    )
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
