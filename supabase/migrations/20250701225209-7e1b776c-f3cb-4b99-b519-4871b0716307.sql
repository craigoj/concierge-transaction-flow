
-- Comprehensive security fix migration for all functions with search_path issues
-- This migration drops and recreates all SECURITY DEFINER functions with proper search_path settings

-- Drop existing functions that need security fixes
DROP FUNCTION IF EXISTS public.get_agent_primary_vendor(uuid, text);
DROP FUNCTION IF EXISTS public.get_service_tier_features(text);
DROP FUNCTION IF EXISTS public.trigger_offer_request_automation();

-- Recreate get_agent_primary_vendor with proper security
CREATE OR REPLACE FUNCTION public.get_agent_primary_vendor(p_agent_id uuid, p_vendor_type text)
RETURNS TABLE(
  id uuid,
  company_name text,
  contact_name text,
  email text,
  phone text,
  address text,
  notes text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    av.id,
    av.company_name,
    av.contact_name,
    av.email,
    av.phone,
    av.address,
    av.notes
  FROM public.agent_vendors av
  WHERE av.agent_id = p_agent_id 
    AND av.vendor_type = p_vendor_type 
    AND av.is_primary = true
  LIMIT 1;
END;
$$;

-- Recreate get_service_tier_features with proper security
CREATE OR REPLACE FUNCTION public.get_service_tier_features(p_service_tier text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  features jsonb;
BEGIN
  -- Define features for each service tier
  CASE p_service_tier
    WHEN 'buyer_core' THEN
      features := jsonb_build_array(
        'Basic transaction coordination',
        'Document management',
        'Email communication',
        'Timeline tracking'
      );
    WHEN 'buyer_elite' THEN
      features := jsonb_build_array(
        'Basic transaction coordination',
        'Document management', 
        'Email communication',
        'Timeline tracking',
        'Premium marketing materials',
        'Professional photography coordination',
        'Branded social media posts'
      );
    WHEN 'white_glove_buyer' THEN
      features := jsonb_build_array(
        'All Elite features',
        'Dedicated concierge service',
        'Lockbox management',
        'Welcome home celebrations',
        'Handwritten follow-up cards',
        'Priority support'
      );
    WHEN 'listing_core' THEN
      features := jsonb_build_array(
        'Basic listing coordination',
        'Document management',
        'Email communication',
        'Timeline tracking'
      );
    WHEN 'listing_elite' THEN
      features := jsonb_build_array(
        'Basic listing coordination',
        'Document management',
        'Email communication', 
        'Timeline tracking',
        'Premium marketing materials',
        'Professional photography coordination',
        'Branded social media posts'
      );
    WHEN 'white_glove_listing' THEN
      features := jsonb_build_array(
        'All Elite features',
        'Dedicated concierge service',
        'Lockbox management', 
        'Welcome home celebrations',
        'Handwritten follow-up cards',
        'Priority support'
      );
    ELSE
      features := jsonb_build_array('Basic service');
  END CASE;
  
  RETURN features;
END;
$$;

-- Recreate trigger_offer_request_automation with proper security
CREATE OR REPLACE FUNCTION public.trigger_offer_request_automation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Only trigger automation when offer request is submitted (status changes to 'submitted')
  IF NEW.status = 'submitted' AND OLD.status != 'submitted' THEN
    -- Trigger automation workflow
    PERFORM pg_notify(
      'offer_request_submitted',
      json_build_object(
        'offer_request_id', NEW.id,
        'agent_id', NEW.agent_id,
        'property_address', NEW.property_address,
        'purchase_price', NEW.purchase_price
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Ensure all existing functions have proper search_path (re-create them)
-- Update handle_intake_completion function
DROP FUNCTION IF EXISTS public.handle_intake_completion();
CREATE OR REPLACE FUNCTION public.handle_intake_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Update profile onboarding_completed_at when intake is completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.profiles 
    SET onboarding_completed_at = now(),
        updated_at = now()
    WHERE id = NEW.agent_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update update_offer_requests_updated_at function
DROP FUNCTION IF EXISTS public.update_offer_requests_updated_at();
CREATE OR REPLACE FUNCTION public.update_offer_requests_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update validate_offer_request_date function
DROP FUNCTION IF EXISTS public.validate_offer_request_date();
CREATE OR REPLACE FUNCTION public.validate_offer_request_date()
RETURNS trigger
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

-- Update update_transaction_service_details_updated_at function
DROP FUNCTION IF EXISTS public.update_transaction_service_details_updated_at();
CREATE OR REPLACE FUNCTION public.update_transaction_service_details_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update apply_task_template function
DROP FUNCTION IF EXISTS public.apply_task_template(uuid, uuid, uuid);
CREATE OR REPLACE FUNCTION public.apply_task_template(p_transaction_id uuid, p_template_id uuid, p_applied_by uuid DEFAULT auth.uid())
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

-- Update handle_task_completion function
DROP FUNCTION IF EXISTS public.handle_task_completion();
CREATE OR REPLACE FUNCTION public.handle_task_completion()
RETURNS trigger
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

-- Update apply_workflow_template function
DROP FUNCTION IF EXISTS public.apply_workflow_template(uuid, uuid, uuid);
CREATE OR REPLACE FUNCTION public.apply_workflow_template(p_transaction_id uuid, p_template_id uuid, p_applied_by uuid DEFAULT auth.uid())
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

-- Update get_my_role function
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

-- Update handle_new_user function
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
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

-- Update get_user_role function
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

-- Recreate triggers that were dropped with the functions
DROP TRIGGER IF EXISTS trigger_offer_request_automation ON public.offer_requests;
CREATE TRIGGER trigger_offer_request_automation
  AFTER UPDATE ON public.offer_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_offer_request_automation();

DROP TRIGGER IF EXISTS handle_intake_completion_trigger ON public.agent_intake_sessions;
CREATE TRIGGER handle_intake_completion_trigger
  AFTER UPDATE ON public.agent_intake_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_intake_completion();

DROP TRIGGER IF EXISTS update_offer_requests_updated_at_trigger ON public.offer_requests;
CREATE TRIGGER update_offer_requests_updated_at_trigger
  BEFORE UPDATE ON public.offer_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_offer_requests_updated_at();

DROP TRIGGER IF EXISTS validate_offer_request_date_trigger ON public.offer_requests;
CREATE TRIGGER validate_offer_request_date_trigger
  BEFORE INSERT OR UPDATE ON public.offer_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_offer_request_date();

DROP TRIGGER IF EXISTS update_transaction_service_details_updated_at_trigger ON public.transaction_service_details;
CREATE TRIGGER update_transaction_service_details_updated_at_trigger
  BEFORE UPDATE ON public.transaction_service_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_transaction_service_details_updated_at();

DROP TRIGGER IF EXISTS handle_task_completion_trigger ON public.tasks;
CREATE TRIGGER handle_task_completion_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_task_completion();

DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;
CREATE TRIGGER handle_new_user_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
