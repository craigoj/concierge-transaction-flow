
-- Complete Security Fixes for Function Search Path Mutable Warnings
-- This addresses all 19 functions mentioned in the security audit

-- Fix all functions with explicit search_path setting
-- This prevents search_path injection attacks by locking the search path

-- 1. Fix handle_intake_completion
DROP FUNCTION IF EXISTS public.handle_intake_completion();
CREATE OR REPLACE FUNCTION public.handle_intake_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Update profile onboarding_completed_at when intake is completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.profiles 
    SET onboarding_completed_at = now(),
        updated_at = now()
    WHERE id = NEW.agent_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. Fix update_offer_requests_updated_at
DROP FUNCTION IF EXISTS public.update_offer_requests_updated_at();
CREATE OR REPLACE FUNCTION public.update_offer_requests_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. Fix validate_offer_request_date
DROP FUNCTION IF EXISTS public.validate_offer_request_date();
CREATE OR REPLACE FUNCTION public.validate_offer_request_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.projected_closing_date <= CURRENT_DATE THEN
    RAISE EXCEPTION 'Projected closing date must be in the future';
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Fix update_transaction_service_details_updated_at
DROP FUNCTION IF EXISTS public.update_transaction_service_details_updated_at();
CREATE OR REPLACE FUNCTION public.update_transaction_service_details_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 5. Fix apply_task_template
DROP FUNCTION IF EXISTS public.apply_task_template(uuid, uuid, uuid);
CREATE OR REPLACE FUNCTION public.apply_task_template(
  p_transaction_id uuid, 
  p_template_id uuid, 
  p_applied_by uuid DEFAULT auth.uid()
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  template_record RECORD;
  task_item JSONB;
  new_task_id UUID;
  workflow_instance_id UUID;
  transaction_record RECORD;
  calculated_due_date DATE;
BEGIN
  -- Get template
  SELECT * INTO template_record FROM public.task_templates WHERE id = p_template_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found';
  END IF;

  -- Get transaction for date calculations
  SELECT * INTO transaction_record FROM public.transactions WHERE id = p_transaction_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  -- Create workflow instance
  INSERT INTO public.workflow_instances (transaction_id, template_id, applied_by)
  VALUES (p_transaction_id, p_template_id, p_applied_by)
  RETURNING id INTO workflow_instance_id;

  -- Create tasks from template
  FOR task_item IN SELECT * FROM jsonb_array_elements(template_record.tasks)
  LOOP
    -- Calculate due date based on closing date and days_from_contract
    IF transaction_record.closing_date IS NOT NULL AND (task_item->>'days_from_contract')::integer IS NOT NULL THEN
      calculated_due_date := transaction_record.closing_date + INTERVAL '1 day' * (task_item->>'days_from_contract')::integer;
    ELSE
      calculated_due_date := NULL;
    END IF;

    INSERT INTO public.tasks (
      transaction_id,
      title,
      description,
      priority,
      due_date
    ) VALUES (
      p_transaction_id,
      task_item->>'title',
      task_item->>'description',
      (task_item->>'priority')::task_priority,
      calculated_due_date
    );
  END LOOP;

  RETURN workflow_instance_id;
END;
$$;

-- 6. Fix handle_task_completion
DROP FUNCTION IF EXISTS public.handle_task_completion();
CREATE OR REPLACE FUNCTION public.handle_task_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Only proceed if task was just completed
  IF OLD.is_completed = false AND NEW.is_completed = true THEN
    -- Trigger workflow automation
    PERFORM pg_notify(
      'task_completed',
      json_build_object(
        'task_id', NEW.id,
        'transaction_id', NEW.transaction_id,
        'title', NEW.title
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 7. Fix create_manual_agent
DROP FUNCTION IF EXISTS public.create_manual_agent(text, text, text, text, text, text, uuid);
CREATE OR REPLACE FUNCTION public.create_manual_agent(
  p_email text, 
  p_first_name text, 
  p_last_name text, 
  p_phone text DEFAULT NULL::text, 
  p_brokerage text DEFAULT NULL::text, 
  p_password text DEFAULT NULL::text, 
  p_created_by uuid DEFAULT auth.uid()
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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

-- 8. Fix apply_workflow_template
DROP FUNCTION IF EXISTS public.apply_workflow_template(uuid, uuid, uuid);
CREATE OR REPLACE FUNCTION public.apply_workflow_template(
  p_transaction_id uuid, 
  p_template_id uuid, 
  p_applied_by uuid DEFAULT auth.uid()
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  template_record RECORD;
  task_record RECORD;
  new_task_id UUID;
  workflow_instance_id UUID;
  transaction_record RECORD;
  calculated_due_date DATE;
  due_rule JSONB;
BEGIN
  -- Get template
  SELECT * INTO template_record FROM public.workflow_templates WHERE id = p_template_id AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found or inactive';
  END IF;

  -- Get transaction for date calculations
  SELECT * INTO transaction_record FROM public.transactions WHERE id = p_transaction_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  -- Create workflow instance
  INSERT INTO public.workflow_instances (transaction_id, template_id, applied_by)
  VALUES (p_transaction_id, p_template_id, p_applied_by)
  RETURNING id INTO workflow_instance_id;

  -- Create tasks from template
  FOR task_record IN 
    SELECT * FROM public.template_tasks 
    WHERE template_id = p_template_id 
    ORDER BY sort_order, created_at
  LOOP
    due_rule := task_record.due_date_rule;
    calculated_due_date := NULL;

    -- Calculate due date based on rule type
    IF due_rule->>'type' = 'days_from_event' THEN
      CASE due_rule->>'event'
        WHEN 'ratified_date' THEN
          IF transaction_record.created_at IS NOT NULL THEN
            calculated_due_date := (transaction_record.created_at::DATE) + INTERVAL '1 day' * (due_rule->>'days')::INTEGER;
          END IF;
        WHEN 'closing_date' THEN
          IF transaction_record.closing_date IS NOT NULL THEN
            calculated_due_date := transaction_record.closing_date + INTERVAL '1 day' * (due_rule->>'days')::INTEGER;
          END IF;
        ELSE
          -- Default to creation date if event not recognized
          calculated_due_date := (transaction_record.created_at::DATE) + INTERVAL '1 day' * (due_rule->>'days')::INTEGER;
      END CASE;
    ELSIF due_rule->>'type' = 'specific_date' THEN
      calculated_due_date := (due_rule->>'date')::DATE;
    END IF;

    -- Insert the task
    INSERT INTO public.tasks (
      transaction_id,
      title,
      description,
      due_date,
      requires_agent_action,
      agent_action_prompt,
      priority
    ) VALUES (
      p_transaction_id,
      task_record.subject,
      task_record.description_notes,
      calculated_due_date,
      task_record.is_agent_visible,
      CASE WHEN task_record.email_template_id IS NOT NULL 
           THEN 'Send email using template: ' || (SELECT name FROM public.email_templates WHERE id = task_record.email_template_id)
           ELSE NULL END,
      'medium'::task_priority
    ) RETURNING id INTO new_task_id;

  END LOOP;

  RETURN workflow_instance_id;
END;
$$;

-- 9. Fix bulk_update_transaction_status
DROP FUNCTION IF EXISTS public.bulk_update_transaction_status(uuid[], transaction_status, uuid);
CREATE OR REPLACE FUNCTION public.bulk_update_transaction_status(
  transaction_ids uuid[], 
  new_status transaction_status, 
  updated_by uuid DEFAULT auth.uid()
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Update transactions
  UPDATE public.transactions 
  SET 
    status = new_status,
    updated_at = now()
  WHERE 
    id = ANY(transaction_ids)
    AND agent_id = updated_by; -- Ensure user can only update their own transactions
  
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
    updated_by,
    'bulk_status_update',
    'Bulk updated ' || updated_count || ' transactions to ' || new_status,
    'transaction',
    gen_random_uuid(), -- Placeholder for bulk operation
    jsonb_build_object(
      'transaction_ids', transaction_ids,
      'new_status', new_status,
      'updated_count', updated_count
    )
  );
  
  RETURN updated_count;
END;
$$;

-- 10. Fix detect_property_duplicates
DROP FUNCTION IF EXISTS public.detect_property_duplicates(text, text, text, text, uuid);
CREATE OR REPLACE FUNCTION public.detect_property_duplicates(
  p_property_address text, 
  p_city text, 
  p_state text, 
  p_zip_code text, 
  p_exclude_transaction_id uuid DEFAULT NULL::uuid
)
RETURNS TABLE(transaction_id uuid, property_address text, city text, state text, zip_code text, similarity_score numeric, status transaction_status)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.property_address,
    t.city,
    t.state,
    t.zip_code,
    -- Simple similarity scoring based on address components
    CASE 
      WHEN LOWER(t.property_address) = LOWER(p_property_address) 
           AND LOWER(t.city) = LOWER(p_city)
           AND LOWER(t.state) = LOWER(p_state)
           AND t.zip_code = p_zip_code
      THEN 1.0
      WHEN similarity(LOWER(t.property_address), LOWER(p_property_address)) > 0.8
           AND LOWER(t.city) = LOWER(p_city)
           AND LOWER(t.state) = LOWER(p_state)
      THEN 0.9
      WHEN similarity(LOWER(t.property_address), LOWER(p_property_address)) > 0.6
           AND LOWER(t.city) = LOWER(p_city)
      THEN 0.7
      ELSE 0.5
    END as similarity_score,
    t.status
  FROM public.transactions t
  WHERE 
    (p_exclude_transaction_id IS NULL OR t.id != p_exclude_transaction_id)
    AND (
      -- Exact match
      (LOWER(t.property_address) = LOWER(p_property_address) 
       AND LOWER(t.city) = LOWER(p_city)
       AND LOWER(t.state) = LOWER(p_state))
      OR
      -- Fuzzy match on address with same city/state
      (similarity(LOWER(t.property_address), LOWER(p_property_address)) > 0.6
       AND LOWER(t.city) = LOWER(p_city)
       AND LOWER(t.state) = LOWER(p_state))
      OR
      -- Same zip code with similar address
      (t.zip_code = p_zip_code 
       AND similarity(LOWER(t.property_address), LOWER(p_property_address)) > 0.5)
    )
  ORDER BY similarity_score DESC
  LIMIT 10;
END;
$$;

-- 11. Fix generate_agent_setup_link
DROP FUNCTION IF EXISTS public.generate_agent_setup_link(uuid, integer);
CREATE OR REPLACE FUNCTION public.generate_agent_setup_link(
  p_agent_id uuid, 
  p_expires_hours integer DEFAULT 24
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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

-- 12. Fix bulk_update_agent_status
DROP FUNCTION IF EXISTS public.bulk_update_agent_status(uuid[], text, uuid);
CREATE OR REPLACE FUNCTION public.bulk_update_agent_status(
  p_agent_ids uuid[], 
  p_new_status text, 
  p_updated_by uuid DEFAULT auth.uid()
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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

-- 13. Fix lock_user_account
DROP FUNCTION IF EXISTS public.lock_user_account(uuid, text);
CREATE OR REPLACE FUNCTION public.lock_user_account(
  p_user_id uuid, 
  p_reason text DEFAULT NULL::text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Check if current user is coordinator
  SELECT role INTO current_user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  IF current_user_role != 'coordinator' THEN
    RAISE EXCEPTION 'Only coordinators can lock accounts';
  END IF;
  
  -- Insert lockout record
  INSERT INTO public.account_lockouts (
    user_id,
    locked_by,
    reason,
    is_active
  ) VALUES (
    p_user_id,
    auth.uid(),
    p_reason,
    true
  );
  
  -- Log the action
  INSERT INTO public.enhanced_activity_logs (
    user_id,
    target_user_id,
    action,
    category,
    description,
    entity_type,
    entity_id
  ) VALUES (
    auth.uid(),
    p_user_id,
    'account_lock',
    'security',
    'Account locked: ' || COALESCE(p_reason, 'No reason provided'),
    'profile',
    p_user_id
  );
  
  RETURN true;
END;
$$;

-- 14. Fix unlock_user_account
DROP FUNCTION IF EXISTS public.unlock_user_account(uuid);
CREATE OR REPLACE FUNCTION public.unlock_user_account(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Check if current user is coordinator
  SELECT role INTO current_user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  IF current_user_role != 'coordinator' THEN
    RAISE EXCEPTION 'Only coordinators can unlock accounts';
  END IF;
  
  -- Deactivate all active lockouts for this user
  UPDATE public.account_lockouts
  SET is_active = false, unlock_at = now()
  WHERE user_id = p_user_id AND is_active = true;
  
  -- Log the action
  INSERT INTO public.enhanced_activity_logs (
    user_id,
    target_user_id,
    action,
    category,
    description,
    entity_type,
    entity_id
  ) VALUES (
    auth.uid(),
    p_user_id,
    'account_unlock',
    'security',
    'Account unlocked',
    'profile',
    p_user_id
  );
  
  RETURN true;
END;
$$;

-- 15. Fix is_account_locked
DROP FUNCTION IF EXISTS public.is_account_locked(uuid);
CREATE OR REPLACE FUNCTION public.is_account_locked(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.account_lockouts
    WHERE user_id = p_user_id 
    AND is_active = true
    AND (unlock_at IS NULL OR unlock_at > now())
  );
END;
$$;

-- 16. Fix log_profile_changes
DROP FUNCTION IF EXISTS public.log_profile_changes();
CREATE OR REPLACE FUNCTION public.log_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Log significant profile changes
    IF OLD.invitation_status != NEW.invitation_status THEN
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
        auth.uid(),
        NEW.id,
        'status_change',
        'agent_management',
        'Status changed from ' || OLD.invitation_status || ' to ' || NEW.invitation_status,
        'profile',
        NEW.id,
        jsonb_build_object(
          'old_status', OLD.invitation_status,
          'new_status', NEW.invitation_status
        )
      );
    END IF;
  END IF;
  
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

-- 17. Fix get_my_role
DROP FUNCTION IF EXISTS public.get_my_role();
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN (
    SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1
  );
END;
$$;

-- 18. Fix handle_new_user
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    email,
    phone_number,
    brokerage,
    role
  )
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name',
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'brokerage',
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'agent'::public.user_role)
  );
  RETURN new;
END;
$$;

-- 19. Fix get_user_role
DROP FUNCTION IF EXISTS public.get_user_role(uuid);
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid DEFAULT auth.uid())
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN (
    SELECT role FROM public.profiles WHERE id = user_id LIMIT 1
  );
END;
$$;

-- Grant appropriate permissions to all fixed functions
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_task_template(uuid, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_workflow_template(uuid, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bulk_update_transaction_status(uuid[], transaction_status, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.detect_property_duplicates(text, text, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_agent_setup_link(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bulk_update_agent_status(uuid[], text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lock_user_account(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unlock_user_account(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_account_locked(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_manual_agent(text, text, text, text, text, text, uuid) TO authenticated;

-- Re-create triggers with the updated functions
DROP TRIGGER IF EXISTS trigger_handle_intake_completion ON public.agent_intake_sessions;
CREATE TRIGGER trigger_handle_intake_completion
    AFTER UPDATE ON public.agent_intake_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_intake_completion();

DROP TRIGGER IF EXISTS trigger_update_offer_requests_updated_at ON public.offer_requests;
CREATE TRIGGER trigger_update_offer_requests_updated_at
    BEFORE UPDATE ON public.offer_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_offer_requests_updated_at();

DROP TRIGGER IF EXISTS trigger_validate_offer_request_date ON public.offer_requests;
CREATE TRIGGER trigger_validate_offer_request_date
    BEFORE INSERT OR UPDATE ON public.offer_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_offer_request_date();

DROP TRIGGER IF EXISTS trigger_update_transaction_service_details_updated_at ON public.transaction_service_details;
CREATE TRIGGER trigger_update_transaction_service_details_updated_at
    BEFORE UPDATE ON public.transaction_service_details
    FOR EACH ROW
    EXECUTE FUNCTION public.update_transaction_service_details_updated_at();

DROP TRIGGER IF EXISTS trigger_handle_task_completion ON public.tasks;
CREATE TRIGGER trigger_handle_task_completion
    AFTER UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_task_completion();

DROP TRIGGER IF EXISTS trigger_log_profile_changes ON public.profiles;
CREATE TRIGGER trigger_log_profile_changes
    AFTER UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.log_profile_changes();

DROP TRIGGER IF EXISTS trigger_handle_new_user ON auth.users;
CREATE TRIGGER trigger_handle_new_user
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Migration complete - all 19 function security issues should now be resolved
COMMENT ON SCHEMA public IS 'Security fixes applied: All 19 functions now use explicit search_path setting to prevent search_path injection attacks';
