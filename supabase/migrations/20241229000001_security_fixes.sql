-- Security Fixes Migration
-- Date: December 29, 2024
-- Purpose: Fix Supabase security linting warnings
-- Issue: Function search_path mutable warnings

-- =============================================================================
-- FIX 1: FUNCTION SEARCH PATH SECURITY
-- =============================================================================
-- All functions need explicit search_path setting to prevent search_path injection

-- Fix: get_agent_primary_vendor function
DROP FUNCTION IF EXISTS public.get_agent_primary_vendor(UUID, TEXT);
CREATE OR REPLACE FUNCTION public.get_agent_primary_vendor(
    p_agent_id UUID,
    p_vendor_type TEXT
) RETURNS UUID AS $$
DECLARE
    vendor_id UUID;
BEGIN
    SELECT id INTO vendor_id
    FROM public.agent_vendors
    WHERE agent_id = p_agent_id 
    AND vendor_type = p_vendor_type 
    AND is_primary = true 
    AND is_active = true
    LIMIT 1;
    
    RETURN vendor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix: get_service_tier_features function  
DROP FUNCTION IF EXISTS public.get_service_tier_features(TEXT);
CREATE OR REPLACE FUNCTION public.get_service_tier_features(
    p_service_tier TEXT
) RETURNS JSONB AS $$
BEGIN
    RETURN CASE p_service_tier
        WHEN 'buyer_core' THEN '["basic_coordination", "document_management", "email_communication"]'::jsonb
        WHEN 'buyer_elite' THEN '["basic_coordination", "document_management", "email_communication", "welcome_guides", "premium_support"]'::jsonb
        WHEN 'white_glove_buyer' THEN '["basic_coordination", "document_management", "email_communication", "welcome_guides", "premium_support", "concierge_service", "celebration"]'::jsonb
        WHEN 'listing_core' THEN '["basic_coordination", "document_management", "email_communication", "mls_listing"]'::jsonb
        WHEN 'listing_elite' THEN '["basic_coordination", "document_management", "email_communication", "mls_listing", "professional_photography", "social_media"]'::jsonb
        WHEN 'white_glove_listing' THEN '["basic_coordination", "document_management", "email_communication", "mls_listing", "professional_photography", "social_media", "staging", "lockbox_management"]'::jsonb
        ELSE '["basic_coordination"]'::jsonb
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- Fix: trigger_offer_request_automation function
DROP FUNCTION IF EXISTS public.trigger_offer_request_automation();
CREATE OR REPLACE FUNCTION public.trigger_offer_request_automation()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert workflow execution for offer request processing
    INSERT INTO public.workflow_executions (
        automation_rule_id,
        transaction_id,
        execution_status,
        trigger_data,
        service_tier,
        client_context
    )
    SELECT 
        ar.id,
        NEW.transaction_id,
        'pending',
        jsonb_build_object(
            'offer_request_id', NEW.id,
            'trigger_type', 'offer_request_submitted',
            'property_address', NEW.property_address
        ),
        t.service_tier,
        jsonb_build_object(
            'buyer_names', NEW.buyer_names,
            'buyer_contacts', NEW.buyer_contacts
        )
    FROM public.automation_rules ar
    LEFT JOIN public.transactions t ON t.id = NEW.transaction_id
    WHERE ar.trigger_event = 'offer_request_submitted'
    AND ar.is_active = true
    AND (ar.service_tier_filter IS NULL OR ar.service_tier_filter = t.service_tier::text);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix: handle_intake_completion function (if exists)
DROP FUNCTION IF EXISTS public.handle_intake_completion();
CREATE OR REPLACE FUNCTION public.handle_intake_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Update profile onboarding completion timestamp
    UPDATE public.profiles 
    SET onboarding_completed_at = NOW()
    WHERE id = NEW.agent_id AND NEW.status = 'completed';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix: update_offer_requests_updated_at function
DROP FUNCTION IF EXISTS public.update_offer_requests_updated_at();
CREATE OR REPLACE FUNCTION public.update_offer_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Fix: validate_offer_request_date function
DROP FUNCTION IF EXISTS public.validate_offer_request_date();
CREATE OR REPLACE FUNCTION public.validate_offer_request_date()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure projected closing date is in the future
    IF NEW.projected_closing_date <= CURRENT_DATE THEN
        RAISE EXCEPTION 'Projected closing date must be in the future';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Fix: update_transaction_service_details_updated_at function
DROP FUNCTION IF EXISTS public.update_transaction_service_details_updated_at();
CREATE OR REPLACE FUNCTION public.update_transaction_service_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Fix: apply_task_template function
DROP FUNCTION IF EXISTS public.apply_task_template(UUID, TEXT);
CREATE OR REPLACE FUNCTION public.apply_task_template(
    p_transaction_id UUID,
    p_service_tier TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Apply task templates based on service tier
    INSERT INTO public.tasks (transaction_id, title, description, priority, due_date)
    SELECT 
        p_transaction_id,
        CASE p_service_tier
            WHEN 'buyer_core' THEN 'Schedule Home Inspection'
            WHEN 'buyer_elite' THEN 'Coordinate Premium Inspection Services'
            WHEN 'white_glove_buyer' THEN 'Arrange Concierge Inspection Experience'
            ELSE 'General Task'
        END,
        'Automatically generated task based on service tier',
        'medium',
        CURRENT_DATE + INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix: handle_task_completion function
DROP FUNCTION IF EXISTS public.handle_task_completion();
CREATE OR REPLACE FUNCTION public.handle_task_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Trigger automation when task is completed
    IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
        INSERT INTO public.workflow_executions (
            transaction_id,
            execution_status,
            trigger_data
        )
        SELECT 
            NEW.transaction_id,
            'pending',
            jsonb_build_object(
                'task_id', NEW.id,
                'task_title', NEW.title,
                'trigger_type', 'task_completed'
            );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix: apply_workflow_template function
DROP FUNCTION IF EXISTS public.apply_workflow_template(UUID, TEXT);
CREATE OR REPLACE FUNCTION public.apply_workflow_template(
    p_transaction_id UUID,
    p_template_name TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Apply workflow template to transaction
    INSERT INTO public.workflow_executions (
        transaction_id,
        execution_status,
        trigger_data
    )
    VALUES (
        p_transaction_id,
        'pending',
        jsonb_build_object(
            'template_name', p_template_name,
            'trigger_type', 'workflow_template_applied'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix: get_my_role function
DROP FUNCTION IF EXISTS public.get_my_role();
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM public.profiles 
        WHERE id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix: handle_new_user function
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (
        NEW.id,
        NEW.email,
        'agent'  -- Default role
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix: get_user_role function
DROP FUNCTION IF EXISTS public.get_user_role(UUID);
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM public.profiles 
        WHERE id = p_user_id
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================================================
-- CREATE MISSING TRIGGERS (if needed)
-- =============================================================================

-- Ensure updated_at triggers exist (only if tables exist)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'offer_requests' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS trigger_update_offer_requests_updated_at ON public.offer_requests;
    END IF;
END $$;
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'offer_requests' AND table_schema = 'public') THEN
        CREATE TRIGGER trigger_update_offer_requests_updated_at
            BEFORE UPDATE ON public.offer_requests
            FOR EACH ROW
            EXECUTE FUNCTION public.update_offer_requests_updated_at();
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transaction_service_details' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS trigger_update_transaction_service_details_updated_at ON public.transaction_service_details;
    END IF;
END $$;
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transaction_service_details' AND table_schema = 'public') THEN
        CREATE TRIGGER trigger_update_transaction_service_details_updated_at
            BEFORE UPDATE ON public.transaction_service_details
            FOR EACH ROW
            EXECUTE FUNCTION public.update_transaction_service_details_updated_at();
    END IF;
END $$;

-- Ensure validation triggers exist
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'offer_requests' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS trigger_validate_offer_request_date ON public.offer_requests;
    END IF;
END $$;
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'offer_requests' AND table_schema = 'public') THEN
        CREATE TRIGGER trigger_validate_offer_request_date
            BEFORE INSERT OR UPDATE ON public.offer_requests
            FOR EACH ROW
            EXECUTE FUNCTION public.validate_offer_request_date();
    END IF;
END $$;

-- Ensure completion triggers exist
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_intake_sessions' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS trigger_handle_intake_completion ON public.agent_intake_sessions;
        CREATE TRIGGER trigger_handle_intake_completion
            AFTER UPDATE ON public.agent_intake_sessions
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_intake_completion();
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS trigger_handle_task_completion ON public.tasks;
        CREATE TRIGGER trigger_handle_task_completion
            AFTER UPDATE ON public.tasks
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_task_completion();
    END IF;
END $$;

-- Ensure new user trigger exists
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'auth') THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- =============================================================================
-- SECURITY IMPROVEMENTS
-- =============================================================================

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION public.get_agent_primary_vendor(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_service_tier_features(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_task_template(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_workflow_template(UUID, TEXT) TO authenticated;

-- =============================================================================
-- MIGRATION COMPLETE - SECURITY FIXES APPLIED
-- =============================================================================

COMMENT ON SCHEMA public IS 'Security fixes applied: All functions now use explicit search_path setting';