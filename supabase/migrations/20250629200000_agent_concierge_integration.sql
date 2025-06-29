-- Agent Concierge Integration Migration
-- Date: December 29, 2024
-- Purpose: Add Agent Concierge workflow tables and enhance existing automation

-- =============================================================================
-- 1. AGENT VENDORS TABLE
-- =============================================================================
-- Store agent's preferred vendors for automated coordination
CREATE TABLE IF NOT EXISTS public.agent_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vendor_type VARCHAR(50) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    notes TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_vendor_type CHECK (vendor_type IN (
        'lender', 'settlement', 'home_inspection', 'termite_inspection',
        'photography', 'staging', 'cleaning', 'lawn_care', 'title_company',
        'appraiser', 'surveyor', 'insurance', 'locksmith', 'handyman'
    )),
    CONSTRAINT unique_primary_vendor UNIQUE(agent_id, vendor_type, is_primary)
);

-- Indexes for performance
CREATE INDEX idx_agent_vendors_agent_type ON public.agent_vendors(agent_id, vendor_type);
CREATE INDEX idx_agent_vendors_primary ON public.agent_vendors(agent_id, is_primary) WHERE is_primary = true;

-- Enable RLS
ALTER TABLE public.agent_vendors ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Agents can only manage their own vendors
CREATE POLICY "Agents can manage their own vendors" ON public.agent_vendors
    FOR ALL USING (agent_id = auth.uid());

-- =============================================================================
-- 2. AGENT BRANDING TABLE
-- =============================================================================
-- Store agent personalization and branding preferences
CREATE TABLE IF NOT EXISTS public.agent_branding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Sign & Marketing
    has_branded_sign BOOLEAN DEFAULT FALSE,
    sign_notes TEXT,
    review_link TEXT,
    has_canva_template BOOLEAN DEFAULT FALSE,
    canva_template_url TEXT,
    social_media_permission BOOLEAN DEFAULT FALSE,
    
    -- Personalization
    favorite_color VARCHAR(50),
    drinks_coffee BOOLEAN DEFAULT NULL,
    drinks_alcohol BOOLEAN DEFAULT NULL,
    birthday DATE,
    
    -- Communication Preferences
    preferred_communication_time VARCHAR(50), -- 'morning', 'afternoon', 'evening'
    communication_style VARCHAR(50), -- 'formal', 'casual', 'detailed', 'brief'
    
    -- Custom branding assets
    logo_url TEXT,
    business_card_template_url TEXT,
    email_signature TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(agent_id),
    CONSTRAINT valid_communication_time CHECK (preferred_communication_time IN ('morning', 'afternoon', 'evening', 'anytime')),
    CONSTRAINT valid_communication_style CHECK (communication_style IN ('formal', 'casual', 'detailed', 'brief'))
);

-- Enable RLS
ALTER TABLE public.agent_branding ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Agents can only manage their own branding
CREATE POLICY "Agents can manage their own branding" ON public.agent_branding
    FOR ALL USING (agent_id = auth.uid());

-- =============================================================================
-- 3. OFFER REQUESTS TABLE
-- =============================================================================
-- Digitize the offer drafting request form workflow
CREATE TABLE IF NOT EXISTS public.offer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.profiles(id),
    
    -- Property Information
    property_address TEXT NOT NULL,
    property_city VARCHAR(100),
    property_state VARCHAR(50),
    property_zip VARCHAR(10),
    
    -- Buyer Information
    buyer_names TEXT NOT NULL,
    buyer_contacts JSONB NOT NULL, -- {phones: ["555-1234"], emails: ["buyer@email.com"]}
    
    -- Financial Details
    purchase_price DECIMAL(12,2) NOT NULL,
    loan_type VARCHAR(100) NOT NULL,
    lending_company VARCHAR(255) NOT NULL,
    emd_amount DECIMAL(10,2) NOT NULL,
    exchange_fee DECIMAL(10,2) NOT NULL,
    
    -- Settlement Information
    settlement_company VARCHAR(255) NOT NULL,
    closing_cost_assistance TEXT,
    projected_closing_date DATE NOT NULL,
    
    -- Inspection Details
    wdi_inspection_details JSONB NOT NULL, -- {period: "X days", provider: "buyer|seller", notes: "..."}
    fica_details JSONB NOT NULL, -- {required: boolean, inspection_period: "X days"}
    
    -- Additional Terms
    extras TEXT,
    lead_eifs_survey TEXT,
    occupancy_notes TEXT,
    
    -- Special Conditions
    financing_contingency_days INTEGER,
    inspection_contingency_days INTEGER,
    appraisal_contingency_days INTEGER,
    settlement_date_contingency_days INTEGER,
    
    -- Workflow Status
    status VARCHAR(20) DEFAULT 'pending',
    drafted_by UUID REFERENCES public.profiles(id),
    reviewed_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Document References
    generated_documents JSONB, -- Array of document IDs created from this request
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_offer_status CHECK (status IN ('pending', 'drafted', 'reviewed', 'approved', 'sent', 'cancelled')),
    CONSTRAINT valid_purchase_price CHECK (purchase_price > 0),
    CONSTRAINT valid_emd_amount CHECK (emd_amount >= 0),
    CONSTRAINT valid_exchange_fee CHECK (exchange_fee >= 0),
    CONSTRAINT future_closing_date CHECK (projected_closing_date >= CURRENT_DATE)
);

-- Indexes for performance
CREATE INDEX idx_offer_requests_agent ON public.offer_requests(agent_id);
CREATE INDEX idx_offer_requests_status ON public.offer_requests(status);
CREATE INDEX idx_offer_requests_transaction ON public.offer_requests(transaction_id);
CREATE INDEX idx_offer_requests_created_at ON public.offer_requests(created_at);

-- Enable RLS
ALTER TABLE public.offer_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Agents can manage their own offer requests
CREATE POLICY "Agents can manage their own offer requests" ON public.offer_requests
    FOR ALL USING (agent_id = auth.uid());

-- =============================================================================
-- 4. TRANSACTION SERVICE DETAILS TABLE
-- =============================================================================
-- Extended service tier tracking and feature management
CREATE TABLE IF NOT EXISTS public.transaction_service_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    
    -- Service Tier Features (extends existing service_tier column)
    selected_features JSONB, -- Features enabled for this specific transaction
    upgrade_history JSONB[], -- Track tier changes with timestamps and reasons
    feature_customizations JSONB, -- Agent-specific customizations per transaction
    
    -- Service Delivery Tracking
    service_milestones JSONB, -- Key service delivery checkpoints
    milestone_completions JSONB, -- Completion timestamps and notes
    client_satisfaction_score INTEGER CHECK (client_satisfaction_score >= 1 AND client_satisfaction_score <= 5),
    
    -- Pricing & Billing
    base_service_fee DECIMAL(8,2),
    additional_fees JSONB, -- Add-on services and costs
    discount_applied DECIMAL(8,2) DEFAULT 0,
    total_service_cost DECIMAL(8,2),
    
    -- Performance Metrics
    response_time_hours DECIMAL(5,2), -- Average response time to client
    issue_resolution_hours DECIMAL(5,2), -- Average time to resolve issues
    automation_success_rate DECIMAL(3,2), -- Percentage of successful automations
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(transaction_id),
    CONSTRAINT valid_satisfaction_score CHECK (client_satisfaction_score IS NULL OR (client_satisfaction_score >= 1 AND client_satisfaction_score <= 5))
);

-- Enable RLS - follows transaction access
ALTER TABLE public.transaction_service_details ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Service details follow transaction access
CREATE POLICY "Service details follow transaction access" ON public.transaction_service_details
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.transactions 
            WHERE transactions.id = transaction_service_details.transaction_id 
            AND transactions.agent_id = auth.uid()
        )
    );

-- =============================================================================
-- 5. AGENT INTAKE SESSIONS TABLE
-- =============================================================================
-- Track agent onboarding and intake form completion
CREATE TABLE IF NOT EXISTS public.agent_intake_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Session Tracking
    session_type VARCHAR(50) NOT NULL DEFAULT 'initial',
    status VARCHAR(50) DEFAULT 'in_progress',
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    
    -- Form Data (for partial saves)
    vendor_data JSONB, -- Temporarily store vendor form data
    branding_data JSONB, -- Temporarily store branding form data
    preferences_data JSONB, -- Other preference data
    
    -- Session Metadata
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    
    -- Review & Approval
    reviewed_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    approval_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_session_type CHECK (session_type IN ('initial', 'update', 'review')),
    CONSTRAINT valid_session_status CHECK (status IN ('in_progress', 'completed', 'abandoned'))
);

-- Indexes for performance
CREATE INDEX idx_agent_intake_agent ON public.agent_intake_sessions(agent_id);
CREATE INDEX idx_agent_intake_status ON public.agent_intake_sessions(status);
CREATE INDEX idx_agent_intake_session_type ON public.agent_intake_sessions(session_type);

-- Enable RLS
ALTER TABLE public.agent_intake_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Agents can view their own intake sessions
CREATE POLICY "Agents can view their own intake sessions" ON public.agent_intake_sessions
    FOR ALL USING (agent_id = auth.uid());

-- =============================================================================
-- 6. ENHANCE EXISTING TABLES
-- =============================================================================

-- Extend automation_rules table for Agent Concierge workflows
ALTER TABLE public.automation_rules ADD COLUMN IF NOT EXISTS service_tier_filter VARCHAR(50);
ALTER TABLE public.automation_rules ADD COLUMN IF NOT EXISTS vendor_type VARCHAR(50);
ALTER TABLE public.automation_rules ADD COLUMN IF NOT EXISTS automation_category VARCHAR(50) DEFAULT 'general';

-- Update trigger event constraint to include new events
ALTER TABLE public.automation_rules DROP CONSTRAINT IF EXISTS automation_rules_trigger_event_check;
ALTER TABLE public.automation_rules ADD CONSTRAINT automation_rules_trigger_event_check 
    CHECK (trigger_event IN (
        'task_completed', 'status_changed', 'document_signed', 'document_uploaded',
        'offer_request_submitted', 'offer_approved', 'vendor_assigned', 'service_tier_selected'
    ));

-- Extend workflow_executions table with Agent Concierge context
ALTER TABLE public.workflow_executions ADD COLUMN IF NOT EXISTS service_tier VARCHAR(50);
ALTER TABLE public.workflow_executions ADD COLUMN IF NOT EXISTS vendor_context JSONB;
ALTER TABLE public.workflow_executions ADD COLUMN IF NOT EXISTS client_context JSONB;

-- Extend email_templates table for service tier and template categorization
ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS service_tier_filter VARCHAR(50);
ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS template_type VARCHAR(50) DEFAULT 'general';
ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS is_agent_customizable BOOLEAN DEFAULT FALSE;

-- =============================================================================
-- 7. REALTIME SUBSCRIPTIONS
-- =============================================================================

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_vendors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_branding;
ALTER PUBLICATION supabase_realtime ADD TABLE public.offer_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transaction_service_details;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_intake_sessions;

-- =============================================================================
-- 8. FUNCTIONS FOR BUSINESS LOGIC
-- =============================================================================

-- Function to get agent's primary vendor by type
CREATE OR REPLACE FUNCTION get_agent_primary_vendor(
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate service tier features
CREATE OR REPLACE FUNCTION get_service_tier_features(
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
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to trigger offer request automation
CREATE OR REPLACE FUNCTION trigger_offer_request_automation()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert workflow execution for offer request processing
    INSERT INTO public.workflow_executions (
        rule_id,
        transaction_id,
        status,
        metadata,
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
    AND (ar.service_tier_filter IS NULL OR ar.service_tier_filter = t.service_tier);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for offer request automation
DROP TRIGGER IF EXISTS trigger_offer_request_automation_trigger ON public.offer_requests;
CREATE TRIGGER trigger_offer_request_automation_trigger
    AFTER INSERT ON public.offer_requests
    FOR EACH ROW
    EXECUTE FUNCTION trigger_offer_request_automation();

-- =============================================================================
-- 9. INDEXES FOR PERFORMANCE
-- =============================================================================

-- Additional indexes for foreign key relationships
CREATE INDEX IF NOT EXISTS idx_transactions_service_tier ON public.transactions(service_tier);
CREATE INDEX IF NOT EXISTS idx_automation_rules_service_tier ON public.automation_rules(service_tier_filter);
CREATE INDEX IF NOT EXISTS idx_automation_rules_vendor_type ON public.automation_rules(vendor_type);
CREATE INDEX IF NOT EXISTS idx_email_templates_service_tier ON public.email_templates(service_tier_filter);

-- =============================================================================
-- 10. SAMPLE DATA FOR DEVELOPMENT
-- =============================================================================

-- Insert sample automation rules for Agent Concierge workflows
INSERT INTO public.automation_rules (id, name, trigger_event, trigger_condition, template_id, is_active, created_by, automation_category) VALUES
-- Get first coordinator for sample data
('agent-offer-submitted-rule', 'Offer Request Submitted', 'offer_request_submitted', 
 '{"auto_draft": true}'::jsonb, 
 (SELECT id FROM public.email_templates WHERE name LIKE '%offer%' LIMIT 1),
 true, 
 (SELECT id FROM public.profiles WHERE role = 'coordinator' LIMIT 1),
 'offer_management'),

('agent-vendor-assigned-rule', 'Vendor Assignment Notification', 'vendor_assigned',
 '{"notify_vendor": true}'::jsonb,
 (SELECT id FROM public.email_templates LIMIT 1),
 true,
 (SELECT id FROM public.profiles WHERE role = 'coordinator' LIMIT 1),
 'vendor_coordination')
ON CONFLICT (id) DO NOTHING;

-- Add sample email templates for Agent Concierge
INSERT INTO public.email_templates (id, name, subject, body_html, category, template_type, service_tier_filter, created_by) VALUES
('agent-intake-welcome', 'Agent Intake Welcome', 'Welcome to Agent Concierge Services', 
 '<h2>Welcome to Agent Concierge!</h2><p>Thank you for completing your agent intake. We''re excited to provide you with personalized service coordination.</p>',
 'welcome', 'agent_onboarding', NULL,
 (SELECT id FROM public.profiles WHERE role = 'coordinator' LIMIT 1)),

('offer-request-received', 'Offer Request Received', 'Your Offer Request is Being Processed', 
 '<h2>Offer Request Received</h2><p>We''ve received your offer request for {{property_address}} and are now drafting your documents.</p>',
 'notifications', 'offer_management', NULL,
 (SELECT id FROM public.profiles WHERE role = 'coordinator' LIMIT 1)),

('vendor-coordination-email', 'Vendor Coordination Request', 'New Transaction Coordination Request', 
 '<h2>New Coordination Request</h2><p>You''ve been assigned to coordinate services for {{property_address}}. Please contact {{agent_name}} at {{agent_email}}.</p>',
 'vendor_coordination', 'vendor_management', NULL,
 (SELECT id FROM public.profiles WHERE role = 'coordinator' LIMIT 1))
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Update migration tracking
COMMENT ON TABLE public.agent_vendors IS 'Agent Concierge: Store agent preferred vendors for automated coordination';
COMMENT ON TABLE public.agent_branding IS 'Agent Concierge: Store agent personalization and branding preferences';
COMMENT ON TABLE public.offer_requests IS 'Agent Concierge: Digital offer drafting request workflow';
COMMENT ON TABLE public.transaction_service_details IS 'Agent Concierge: Extended service tier tracking and features';
COMMENT ON TABLE public.agent_intake_sessions IS 'Agent Concierge: Track agent onboarding form completion';