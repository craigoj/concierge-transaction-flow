# 🗄️ Agent Concierge Integration: Database Schema Design

**Project:** Concierge Transaction Flow - Agent Concierge Integration  
**Date:** December 29, 2024  
**Database:** Supabase PostgreSQL  
**Integration Focus:** Agent intake forms, offer drafting, vendor management

---

## 📋 Current Database Foundation

### Existing Core Tables (Already Built)
```sql
-- Core business entities
✅ profiles (id, first_name, last_name, role, email, phone_number, etc.)
✅ transactions (id, agent_id, property_address, service_tier, status, etc.)
✅ clients (id, transaction_id, full_name, type[buyer/seller], contact info)
✅ tasks (id, transaction_id, title, is_completed, priority, etc.)
✅ documents (id, transaction_id, file_name, e_sign_status, etc.)

-- Automation & Communication
✅ email_templates (id, name, subject, body_html, category, created_by)
✅ automation_rules (id, trigger_event, trigger_condition, template_id)
✅ workflow_executions (id, rule_id, transaction_id, status, metadata)
✅ communications (id, transaction_id, sender_id, recipient_id, content)

-- Service Tier Support
✅ service_tier_type ENUM: [buyer_core, buyer_elite, white_glove_buyer, 
                           listing_core, listing_elite, white_glove_listing]
```

### Existing RLS Security Pattern
```sql
-- Agent-scoped access via agent_id foreign key relationship
✅ Agents see only their own transactions and related data
✅ Coordinators have broader access for management
✅ auth.uid() = agent_id pattern established throughout
```

---

## 🆕 New Tables Required for Agent Concierge Integration

### 1. Agent Vendors Table
**Purpose:** Store agent's preferred vendors for automated coordination

```sql
CREATE TABLE agent_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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
    CONSTRAINT unique_primary_vendor UNIQUE(agent_id, vendor_type, is_primary),
    CONSTRAINT valid_vendor_type CHECK (vendor_type IN (
        'lender', 'settlement', 'home_inspection', 'termite_inspection',
        'photography', 'staging', 'cleaning', 'lawn_care', 'title_company',
        'appraiser', 'surveyor', 'insurance', 'locksmith', 'handyman'
    ))
);

-- Indexes for performance
CREATE INDEX idx_agent_vendors_agent_type ON agent_vendors(agent_id, vendor_type);
CREATE INDEX idx_agent_vendors_primary ON agent_vendors(agent_id, is_primary) WHERE is_primary = true;

-- RLS Policy
ALTER TABLE agent_vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents can manage their own vendors" ON agent_vendors
    FOR ALL USING (agent_id = auth.uid());
```

### 2. Agent Branding Table
**Purpose:** Store agent personalization and branding preferences

```sql
CREATE TABLE agent_branding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
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
    UNIQUE(agent_id)
);

-- RLS Policy
ALTER TABLE agent_branding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents can manage their own branding" ON agent_branding
    FOR ALL USING (agent_id = auth.uid());
```

### 3. Offer Requests Table
**Purpose:** Digitize the offer drafting request form workflow

```sql
CREATE TABLE offer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES profiles(id),
    
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
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'drafted', 'reviewed', 'approved', 'sent'
    drafted_by UUID REFERENCES profiles(id),
    reviewed_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Document References
    generated_documents JSONB, -- Array of document IDs created from this request
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_offer_status CHECK (status IN ('pending', 'drafted', 'reviewed', 'approved', 'sent', 'cancelled'))
);

-- Indexes
CREATE INDEX idx_offer_requests_agent ON offer_requests(agent_id);
CREATE INDEX idx_offer_requests_status ON offer_requests(status);
CREATE INDEX idx_offer_requests_transaction ON offer_requests(transaction_id);

-- RLS Policy
ALTER TABLE offer_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents can manage their own offer requests" ON offer_requests
    FOR ALL USING (agent_id = auth.uid());
```

### 4. Transaction Service Details Table
**Purpose:** Extended service tier tracking and feature management

```sql
CREATE TABLE transaction_service_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    
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
    UNIQUE(transaction_id)
);

-- RLS Policy follows transaction access
ALTER TABLE transaction_service_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service details follow transaction access" ON transaction_service_details
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM transactions 
            WHERE transactions.id = transaction_service_details.transaction_id 
            AND transactions.agent_id = auth.uid()
        )
    );
```

### 5. Agent Intake Sessions Table
**Purpose:** Track agent onboarding and intake form completion

```sql
CREATE TABLE agent_intake_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Session Tracking
    session_type VARCHAR(50) NOT NULL, -- 'initial', 'update', 'review'
    status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
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
    reviewed_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    approval_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agent_intake_agent ON agent_intake_sessions(agent_id);
CREATE INDEX idx_agent_intake_status ON agent_intake_sessions(status);

-- RLS Policy
ALTER TABLE agent_intake_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents can view their own intake sessions" ON agent_intake_sessions
    FOR ALL USING (agent_id = auth.uid());
```

---

## 🔄 Enhanced Existing Tables

### Extend automation_rules table
```sql
-- Add service tier and vendor coordination support
ALTER TABLE automation_rules ADD COLUMN IF NOT EXISTS service_tier_filter VARCHAR(50);
ALTER TABLE automation_rules ADD COLUMN IF NOT EXISTS vendor_type VARCHAR(50);
ALTER TABLE automation_rules ADD COLUMN IF NOT EXISTS automation_category VARCHAR(50) DEFAULT 'general';

-- Update constraint to include new trigger events
ALTER TABLE automation_rules DROP CONSTRAINT IF EXISTS automation_rules_trigger_event_check;
ALTER TABLE automation_rules ADD CONSTRAINT automation_rules_trigger_event_check 
    CHECK (trigger_event IN (
        'task_completed', 'status_changed', 'document_signed', 'document_uploaded',
        'offer_request_submitted', 'offer_approved', 'vendor_assigned', 'service_tier_selected'
    ));
```

### Extend workflow_executions table
```sql
-- Add service tier and vendor context
ALTER TABLE workflow_executions ADD COLUMN IF NOT EXISTS service_tier VARCHAR(50);
ALTER TABLE workflow_executions ADD COLUMN IF NOT EXISTS vendor_context JSONB;
ALTER TABLE workflow_executions ADD COLUMN IF NOT EXISTS client_context JSONB;
```

### Extend email_templates table
```sql
-- Add service tier and template type categorization
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS service_tier_filter VARCHAR(50);
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS template_type VARCHAR(50) DEFAULT 'general';
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS is_agent_customizable BOOLEAN DEFAULT FALSE;

-- Update categories to include new types
-- 'welcome', 'updates', 'marketing', 'notifications', 'vendor_coordination', 'offer_management'
```

---

## 🔐 Security & RLS Policies Summary

All new tables follow the established security pattern:

```sql
-- Agent-scoped access (standard pattern)
CREATE POLICY "policy_name" ON table_name
    FOR ALL USING (agent_id = auth.uid());

-- Transaction-linked access (for transaction-related tables)
CREATE POLICY "policy_name" ON table_name
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM transactions 
            WHERE transactions.id = table_name.transaction_id 
            AND transactions.agent_id = auth.uid()
        )
    );

-- Coordinator access (for management tables)
CREATE POLICY "coordinators_can_access" ON table_name
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'coordinator'
        )
    );
```

---

## 📊 TypeScript Interface Updates

Based on the new schema, these TypeScript interfaces will be auto-generated:

```typescript
// New table types will be added to Database interface
export interface Database {
  public: {
    Tables: {
      // ... existing tables ...
      agent_vendors: {
        Row: {
          id: string
          agent_id: string
          vendor_type: string
          company_name: string
          contact_name: string | null
          email: string | null
          phone: string | null
          address: string | null
          notes: string | null
          is_primary: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: { /* ... */ }
        Update: { /* ... */ }
        Relationships: [
          {
            foreignKeyName: "agent_vendors_agent_id_fkey"
            columns: ["agent_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      // ... other new tables follow same pattern
    }
  }
}

// Helper types for forms
export type AgentVendor = Database['public']['Tables']['agent_vendors']['Row']
export type AgentBranding = Database['public']['Tables']['agent_branding']['Row']
export type OfferRequest = Database['public']['Tables']['offer_requests']['Row']
```

---

## 🎯 Integration Benefits

### For Lovable.dev Development:
1. **Clear TypeScript types** for all form fields and data structures
2. **Established RLS patterns** for secure agent-scoped access
3. **Real-time subscriptions** already configured for live updates
4. **Consistent naming conventions** following existing patterns
5. **Foreign key relationships** clearly defined for form validation

### For Business Logic:
1. **Service tier automation** building on existing service_tier_type enum
2. **Vendor coordination** with automated assignment and communication
3. **Offer workflow** digitizing the current PDF-based process
4. **Agent personalization** enabling customized service delivery
5. **Performance tracking** for service tier effectiveness

### For Future Scaling:
1. **Modular design** allows incremental feature additions
2. **JSONB flexibility** for evolving business requirements
3. **Audit trail** through timestamps and status tracking
4. **Integration ready** for external APIs and services

---

## 🚀 Next Steps for Implementation

1. **Create migration script** with all new tables and constraints
2. **Generate TypeScript types** using Supabase CLI
3. **Design Lovable.dev forms** with exact field specifications
4. **Implement automation workflows** using existing patterns
5. **Test RLS policies** with multi-agent scenarios

This schema design provides a solid foundation for the Agent Concierge integration while maintaining consistency with your existing system architecture.