# 🚀 Agent Concierge Phase 1 - Lovable Transfer Guide

**Transfer Date**: December 29, 2024  
**Status**: Ready for Implementation  
**Components**: Database + TypeScript + React Components

---

## 📋 Pre-Transfer Checklist

### **Verify Lovable Environment**
- [ ] Lovable project has Supabase integration configured
- [ ] Database permissions allow schema modifications
- [ ] Development environment is accessible
- [ ] Backup current state (if needed)

### **Component Inventory**
- [ ] All 4 React components are ready for transfer
- [ ] TypeScript types file is complete
- [ ] Database migration SQL is tested
- [ ] Documentation is up to date

---

## 🗄️ **Step 1: Database Migration**

### **Migration File to Transfer**
```
File: /supabase/migrations/20250629200000_agent_concierge_integration.sql
Size: ~8KB
Tables: 5 new tables + enhancements to 3 existing tables
```

### **Apply Database Changes in Lovable**

#### **Option A: Direct SQL Execution (Recommended)**
1. **Access Lovable's Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and execute the migration SQL** (see full SQL below)
4. **Verify all tables created successfully**

#### **Option B: Migration File Upload**
1. **Upload migration file** to Lovable's migration directory
2. **Run migration command** through Lovable's interface
3. **Verify successful application**

### **Database Migration SQL**
```sql
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
    
    -- Sign Preferences
    has_branded_sign BOOLEAN DEFAULT FALSE,
    sign_notes TEXT,
    
    -- Review & Marketing
    review_link TEXT NOT NULL,
    has_canva_template BOOLEAN DEFAULT FALSE,
    canva_template_url TEXT,
    social_media_permission BOOLEAN DEFAULT FALSE,
    
    -- Personal Preferences
    favorite_color VARCHAR(7), -- Hex color code
    drinks_coffee BOOLEAN,
    drinks_alcohol BOOLEAN,
    birthday DATE,
    
    -- Communication Preferences
    preferred_communication_time VARCHAR(20) CHECK (preferred_communication_time IN ('morning', 'afternoon', 'evening', 'anytime')),
    communication_style VARCHAR(20) CHECK (communication_style IN ('formal', 'casual', 'detailed', 'brief')),
    
    -- Email Customization
    email_signature TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT one_branding_per_agent UNIQUE(agent_id)
);

-- Enable RLS
ALTER TABLE public.agent_branding ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Agents can only manage their own branding
CREATE POLICY "Agents can manage their own branding" ON public.agent_branding
    FOR ALL USING (agent_id = auth.uid());

-- =============================================================================
-- 3. OFFER REQUESTS TABLE
-- =============================================================================
-- Digital offer drafting request workflow
CREATE TABLE IF NOT EXISTS public.offer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    
    -- Property Information
    property_address TEXT NOT NULL,
    listing_price DECIMAL(12,2),
    offer_price DECIMAL(12,2) NOT NULL,
    
    -- Offer Terms
    financing_type VARCHAR(50) NOT NULL CHECK (financing_type IN ('conventional', 'fha', 'va', 'cash', 'other')),
    down_payment_percentage DECIMAL(5,2),
    closing_date DATE,
    inspection_period_days INTEGER DEFAULT 10,
    appraisal_contingency BOOLEAN DEFAULT TRUE,
    financing_contingency BOOLEAN DEFAULT TRUE,
    
    -- Additional Terms
    earnest_money_amount DECIMAL(12,2),
    personal_property_included TEXT,
    special_terms TEXT,
    
    -- Workflow Status
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'requires_changes', 'completed', 'cancelled')),
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.profiles(id),
    
    -- Document Generation
    document_generated BOOLEAN DEFAULT FALSE,
    document_path TEXT,
    generated_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_offer_requests_agent ON public.offer_requests(agent_id);
CREATE INDEX idx_offer_requests_transaction ON public.offer_requests(transaction_id);
CREATE INDEX idx_offer_requests_status ON public.offer_requests(status);

-- Enable RLS
ALTER TABLE public.offer_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Agents can manage their own offer requests" ON public.offer_requests
    FOR ALL USING (agent_id = auth.uid());

CREATE POLICY "Coordinators can view all offer requests" ON public.offer_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'coordinator')
        )
    );

-- =============================================================================
-- 4. TRANSACTION SERVICE DETAILS TABLE
-- =============================================================================
-- Extended service tier tracking and features
CREATE TABLE IF NOT EXISTS public.transaction_service_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    
    -- Service Tier Features
    tier_features JSONB, -- Store dynamic tier-specific features
    upgrade_history JSONB, -- Track tier changes over time
    
    -- Vendor Assignments
    assigned_vendors JSONB, -- Store vendor assignments by type
    vendor_coordination_notes TEXT,
    
    -- Specialized Services
    white_glove_concierge_assigned BOOLEAN DEFAULT FALSE,
    concierge_notes TEXT,
    priority_level VARCHAR(20) DEFAULT 'standard' CHECK (priority_level IN ('standard', 'priority', 'urgent')),
    
    -- Performance Tracking
    service_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estimated_completion_date DATE,
    actual_completion_date DATE,
    client_satisfaction_score INTEGER CHECK (client_satisfaction_score BETWEEN 1 AND 10),
    
    -- Billing and Pricing
    base_service_fee DECIMAL(10,2),
    additional_services_fee DECIMAL(10,2),
    total_service_fee DECIMAL(10,2),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT one_service_detail_per_transaction UNIQUE(transaction_id)
);

-- Enable RLS
ALTER TABLE public.transaction_service_details ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Access based on transaction permissions
CREATE POLICY "Access via transaction permissions" ON public.transaction_service_details
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.transactions 
            WHERE id = transaction_service_details.transaction_id 
            AND agent_id = auth.uid()
        )
    );

-- =============================================================================
-- 5. AGENT INTAKE SESSIONS TABLE
-- =============================================================================
-- Track agent onboarding form completion and session management
CREATE TABLE IF NOT EXISTS public.agent_intake_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Session Management
    session_type VARCHAR(20) DEFAULT 'initial' CHECK (session_type IN ('initial', 'update', 'annual_review')),
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned', 'expired')),
    
    -- Progress Tracking
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
    current_step INTEGER DEFAULT 1,
    
    -- Session Data (for auto-save and restore)
    vendor_data JSONB, -- Temporary vendor form data
    branding_data JSONB, -- Temporary branding form data
    
    -- Session Metadata
    ip_address INET,
    user_agent TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agent_intake_sessions_agent ON public.agent_intake_sessions(agent_id);
CREATE INDEX idx_agent_intake_sessions_status ON public.agent_intake_sessions(status);
CREATE INDEX idx_agent_intake_sessions_expires ON public.agent_intake_sessions(expires_at);

-- Enable RLS
ALTER TABLE public.agent_intake_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Agents can only access their own sessions
CREATE POLICY "Agents can manage their own intake sessions" ON public.agent_intake_sessions
    FOR ALL USING (agent_id = auth.uid());

-- =============================================================================
-- 6. ENHANCE EXISTING TABLES
-- =============================================================================

-- Add service tier filtering to automation_rules
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'automation_rules' 
                   AND column_name = 'service_tier_filter') THEN
        ALTER TABLE public.automation_rules 
        ADD COLUMN service_tier_filter service_tier_type[];
    END IF;
END $$;

-- Add vendor context to workflow_executions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workflow_executions' 
                   AND column_name = 'vendor_context') THEN
        ALTER TABLE public.workflow_executions 
        ADD COLUMN vendor_context JSONB;
    END IF;
END $$;

-- =============================================================================
-- 7. BUSINESS LOGIC FUNCTIONS
-- =============================================================================

-- Function to get agent's primary vendor by type
CREATE OR REPLACE FUNCTION get_agent_primary_vendor(p_agent_id UUID, p_vendor_type TEXT)
RETURNS public.agent_vendors AS $$
DECLARE
    vendor_record public.agent_vendors;
BEGIN
    SELECT * INTO vendor_record
    FROM public.agent_vendors
    WHERE agent_id = p_agent_id 
    AND vendor_type = p_vendor_type 
    AND is_primary = true 
    AND is_active = true
    LIMIT 1;
    
    RETURN vendor_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate service tier features
CREATE OR REPLACE FUNCTION get_service_tier_features(p_service_tier service_tier_type)
RETURNS JSONB AS $$
BEGIN
    RETURN CASE p_service_tier
        WHEN 'buyer_core' THEN '{"max_vendors": 3, "automation_level": "basic", "priority_support": false}'::jsonb
        WHEN 'buyer_elite' THEN '{"max_vendors": 8, "automation_level": "advanced", "priority_support": true}'::jsonb
        WHEN 'white_glove_buyer' THEN '{"max_vendors": 15, "automation_level": "premium", "priority_support": true, "concierge": true}'::jsonb
        WHEN 'listing_core' THEN '{"max_vendors": 5, "automation_level": "basic", "marketing_tier": "standard"}'::jsonb
        WHEN 'listing_elite' THEN '{"max_vendors": 10, "automation_level": "advanced", "marketing_tier": "premium"}'::jsonb
        WHEN 'white_glove_listing' THEN '{"max_vendors": 20, "automation_level": "premium", "marketing_tier": "luxury", "concierge": true}'::jsonb
        ELSE '{}'::jsonb
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to trigger offer request automation
CREATE OR REPLACE FUNCTION trigger_offer_request_automation()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert automation trigger when offer request is submitted
    IF NEW.status = 'submitted' AND OLD.status = 'draft' THEN
        INSERT INTO public.workflow_executions (
            automation_rule_id,
            transaction_id,
            trigger_data,
            execution_status,
            service_tier
        ) 
        SELECT 
            ar.id,
            NEW.transaction_id,
            jsonb_build_object(
                'offer_request_id', NEW.id,
                'agent_id', NEW.agent_id,
                'offer_price', NEW.offer_price
            ),
            'pending',
            t.service_tier
        FROM public.automation_rules ar
        LEFT JOIN public.transactions t ON t.id = NEW.transaction_id
        WHERE ar.trigger_event = 'offer_request_submitted'
        AND ar.is_active = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for offer request automation
DROP TRIGGER IF EXISTS trigger_offer_request_automation ON public.offer_requests;
CREATE TRIGGER trigger_offer_request_automation
    AFTER UPDATE ON public.offer_requests
    FOR EACH ROW
    EXECUTE FUNCTION trigger_offer_request_automation();
```

---

## 📁 **Step 2: TypeScript Types Integration**

### **File to Transfer**
```
Source: /src/integrations/supabase/agent-concierge-types.ts
Destination: Lovable project /src/integrations/supabase/ directory
```

### **Integration Steps**
1. **Copy the complete agent-concierge-types.ts file** to Lovable
2. **Update main types.ts file** to import agent concierge types
3. **Verify TypeScript compilation** in Lovable environment

### **Main Types File Update**
Add this import to `/src/integrations/supabase/types.ts`:
```typescript
// Import Agent Concierge types
export * from './agent-concierge-types'
```

---

## 🧩 **Step 3: React Component Transfer**

### **Components to Transfer**

#### **1. Main Form Component**
```
Source: /src/components/forms/AgentIntakeForm.tsx
Size: ~500 lines
Dependencies: React Hook Form, Zod, Supabase client
```

#### **2. Form Step Components**
```
Source: /src/components/forms/intake-steps/
├── VendorPreferencesStep.tsx (480+ lines)
├── BrandingPreferencesStep.tsx (555+ lines)
└── ReviewAndSubmitStep.tsx (480+ lines)
```

### **Transfer Process**

#### **Step 3.1: Create Directory Structure**
```bash
# In Lovable project
mkdir -p src/components/forms/intake-steps
```

#### **Step 3.2: Copy Component Files**
1. **Copy AgentIntakeForm.tsx** to `/src/components/forms/`
2. **Copy all intake-steps components** to `/src/components/forms/intake-steps/`
3. **Verify all imports resolve correctly**

#### **Step 3.3: Update Routing**
Add route to Lovable's main App.tsx:
```typescript
// Add import
import AgentIntakeForm from '@/components/forms/AgentIntakeForm'

// Add route (inside <Routes>)
<Route path="/agent-intake" element={
  <AuthGuard>
    <AgentIntakeForm />
  </AuthGuard>
} />
```

---

## 🔗 **Step 4: Integration & Testing**

### **4.1 Dependency Verification**
Ensure these packages are installed in Lovable:
- `react-hook-form` (^7.53.0)
- `@hookform/resolvers` (^3.9.0)
- `zod` (^3.23.8)

### **4.2 Build Test**
1. **Run build command** in Lovable
2. **Check for TypeScript errors**
3. **Verify all imports resolve**

### **4.3 Functional Testing**
1. **Navigate to `/agent-intake`** route
2. **Test form step navigation**
3. **Verify vendor management functionality**
4. **Test branding preferences**
5. **Confirm data submission to database**

### **4.4 Database Verification**
1. **Check all tables created** in Supabase dashboard
2. **Verify RLS policies active**
3. **Test data insertion** via form submission
4. **Confirm foreign key relationships**

---

## ✅ **Step 5: Validation Checklist**

### **Database**
- [ ] All 5 new tables created successfully
- [ ] RLS policies applied and functioning
- [ ] Business logic functions working
- [ ] Indexes created for performance
- [ ] Foreign key constraints validated

### **TypeScript**
- [ ] Agent concierge types imported successfully
- [ ] No compilation errors
- [ ] Intellisense working in Lovable IDE
- [ ] All component props properly typed

### **Components**
- [ ] Agent Intake Form accessible via routing
- [ ] All form steps navigate correctly
- [ ] Vendor management functional
- [ ] Branding preferences save properly
- [ ] Form validation working as expected
- [ ] Responsive design intact
- [ ] Auto-save functionality operational

### **Integration**
- [ ] Form submits data to correct database tables
- [ ] Session management working
- [ ] Error handling functional
- [ ] Success flow redirects properly

---

## 🚨 **Rollback Plan**

If issues occur during transfer:

### **Database Rollback**
```sql
-- Remove Agent Concierge tables
DROP TABLE IF EXISTS public.agent_intake_sessions CASCADE;
DROP TABLE IF EXISTS public.transaction_service_details CASCADE;
DROP TABLE IF EXISTS public.offer_requests CASCADE;
DROP TABLE IF EXISTS public.agent_branding CASCADE;
DROP TABLE IF EXISTS public.agent_vendors CASCADE;

-- Remove added columns
ALTER TABLE public.automation_rules DROP COLUMN IF EXISTS service_tier_filter;
ALTER TABLE public.workflow_executions DROP COLUMN IF EXISTS vendor_context;

-- Remove functions
DROP FUNCTION IF EXISTS get_agent_primary_vendor(UUID, TEXT);
DROP FUNCTION IF EXISTS get_service_tier_features(service_tier_type);
DROP FUNCTION IF EXISTS trigger_offer_request_automation();
```

### **Code Rollback**
1. **Remove Agent Intake route** from App.tsx
2. **Delete copied component files**
3. **Remove agent-concierge-types import** from main types
4. **Restart Lovable development server**

---

## 📞 **Support & Next Steps**

### **After Successful Transfer**
1. **Document Lovable-specific configurations**
2. **Set up monitoring and analytics**
3. **Plan user acceptance testing**
4. **Begin Phase 2 development (Offer Drafting)**

### **Troubleshooting**
- **Database Issues**: Check Supabase logs and RLS policy configurations
- **TypeScript Errors**: Verify all imports and type definitions
- **Component Issues**: Check React dev tools and browser console
- **Build Failures**: Review dependency versions and compatibility

---

**🎯 Success Criteria**: Agent Intake Form fully functional in Lovable with live database integration and all Phase 1 features operational.

This guide ensures a smooth, systematic transfer of Agent Concierge Phase 1 from Claude Code to Lovable production environment.