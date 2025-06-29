# 🗄️ Concierge Transaction Flow - Database Schema Documentation

**Project:** Concierge Transaction Flow  
**Platform:** Lovable.dev + Supabase PostgreSQL  
**Schema Version:** 2.0 (Agent Concierge Integration)  
**Last Updated:** December 29, 2024  
**Migration Files:** 
- `20250601000000_init_base_schema.sql` (Base Schema)
- `20250629200000_agent_concierge_integration.sql` (Agent Concierge Features)

---

## 📊 Schema Overview

The Concierge Transaction Flow database is designed as a comprehensive real estate transaction management system with sophisticated automation, agent-specific customization, and service tier differentiation. The schema supports:

- **Multi-tier Service System** (Core, Elite, White Glove)
- **Agent Concierge Workflows** with vendor preferences and branding
- **Automated Workflow Engine** with rule-based triggers
- **Real-time Collaboration** via Supabase realtime
- **Secure Data Access** through Row Level Security (RLS)

---

## 🔄 Entity Relationship Overview

```
Core Entities:
profiles ──┐
           ├── transactions ──┬── tasks
           ├── clients ────────┤
           └── agent_vendors   ├── documents
                              ├── offer_requests
                              └── transaction_service_details

Automation System:
automation_rules ──► workflow_executions
email_templates ──► workflow_executions

Agent Customization:
agent_branding
agent_intake_sessions
```

---

## 📋 Core Tables

### 1. **profiles** - User Management
*Foundation table for all user types*

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, references auth.users |
| `email` | TEXT | Unique email address |
| `full_name` | TEXT | User's display name |
| `role` | TEXT | 'admin', 'coordinator', 'agent' |
| `phone` | TEXT | Contact phone number |
| `avatar_url` | TEXT | Profile image URL |
| `onboarding_completed_at` | TIMESTAMP | Agent onboarding completion |

**Key Features:**
- ✅ **RLS Enabled**: Users can only view/edit their own profile
- ✅ **Role-Based Access**: Supports admin, coordinator, agent roles
- ✅ **Supabase Auth Integration**: Direct reference to auth.users

### 2. **clients** - Client Management
*Store buyer and seller information*

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `first_name` | TEXT | Client first name |
| `last_name` | TEXT | Client last name |
| `email` | TEXT | Unique email address |
| `phone` | TEXT | Contact phone number |
| `address` | TEXT | Client address |
| `notes` | TEXT | Agent notes about client |
| `created_by` | UUID | References profiles(id) |

**Key Features:**
- ✅ **Agent Access**: All agents can view all clients
- ✅ **Full-Text Search**: Optimized for name and email searches
- ✅ **Audit Trail**: Tracks who created each client

### 3. **transactions** - Transaction Management
*Core transaction lifecycle tracking*

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `client_id` | UUID | References clients(id) |
| `agent_id` | UUID | References profiles(id) |
| `property_address` | TEXT | Property being transacted |
| `transaction_type` | TEXT | 'buying' or 'selling' |
| `service_tier` | service_tier_type | Service level (enum) |
| `status` | transaction_status | Current status (enum) |
| `purchase_price` | DECIMAL(12,2) | Property price |
| `commission_rate` | DECIMAL(5,4) | Agent commission rate |
| `commission_amount` | DECIMAL(12,2) | Calculated commission |
| `closing_date` | DATE | Expected closing date |

**Service Tiers:**
- `buyer_core`, `buyer_elite`, `white_glove_buyer`
- `listing_core`, `listing_elite`, `white_glove_listing`

**Status Flow:**
- `pending` → `active` → `under_contract` → `closing` → `completed`

**Key Features:**
- ✅ **Agent Isolation**: Agents only see their assigned transactions
- ✅ **Service Differentiation**: Tier-based feature access
- ✅ **Status Workflow**: Controlled status progression

---

## 🎯 Agent Concierge Tables

### 4. **agent_vendors** - Vendor Preferences
*Agent's preferred vendors for automated coordination*

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `agent_id` | UUID | References profiles(id) |
| `vendor_type` | VARCHAR(50) | Type of vendor (enum constraint) |
| `company_name` | VARCHAR(255) | Vendor company name |
| `contact_name` | VARCHAR(255) | Primary contact person |
| `email` | VARCHAR(255) | Contact email |
| `phone` | VARCHAR(20) | Contact phone |
| `address` | TEXT | Vendor address |
| `notes` | TEXT | Agent notes about vendor |
| `is_primary` | BOOLEAN | Primary vendor for this type |
| `is_active` | BOOLEAN | Currently active vendor |

**Supported Vendor Types:**
- `lender`, `settlement`, `home_inspection`, `termite_inspection`
- `photography`, `staging`, `cleaning`, `lawn_care`, `title_company`
- `appraiser`, `surveyor`, `insurance`, `locksmith`, `handyman`

**Key Features:**
- ✅ **Primary Vendor Enforcement**: Only one primary per vendor type
- ✅ **Agent Isolation**: Agents only manage their own vendors
- ✅ **Automation Ready**: Used by workflow engine for vendor assignment

### 5. **agent_branding** - Personalization Preferences
*Agent personalization and branding settings*

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `agent_id` | UUID | References profiles(id), UNIQUE |
| `has_branded_sign` | BOOLEAN | Agent has branded yard sign |
| `sign_notes` | TEXT | Notes about signage |
| `review_link` | TEXT | Agent's review link URL |
| `has_canva_template` | BOOLEAN | Has Canva template |
| `canva_template_url` | TEXT | Canva template URL |
| `social_media_permission` | BOOLEAN | Permission for social posts |
| `favorite_color` | VARCHAR(50) | For personalization |
| `drinks_coffee` | BOOLEAN | For welcome gifts |
| `drinks_alcohol` | BOOLEAN | For celebration gifts |
| `birthday` | DATE | For special occasions |
| `preferred_communication_time` | VARCHAR(50) | 'morning', 'afternoon', 'evening' |
| `communication_style` | VARCHAR(50) | 'formal', 'casual', 'detailed', 'brief' |
| `logo_url` | TEXT | Agent logo URL |
| `business_card_template_url` | TEXT | Business card template |
| `email_signature` | TEXT | Custom email signature |

**Key Features:**
- ✅ **One Per Agent**: Unique constraint on agent_id
- ✅ **Personalization Engine**: Drives customized service delivery
- ✅ **Marketing Integration**: Supports branded materials

### 6. **offer_requests** - Digital Offer Management
*Digitized offer drafting request form*

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `transaction_id` | UUID | References transactions(id) |
| `agent_id` | UUID | References profiles(id) |
| **Property Information** |
| `property_address` | TEXT | Property address |
| `property_city` | VARCHAR(100) | Property city |
| `property_state` | VARCHAR(50) | Property state |
| `property_zip` | VARCHAR(10) | Property ZIP code |
| **Buyer Information** |
| `buyer_names` | TEXT | Buyer name(s) |
| `buyer_contacts` | JSONB | `{phones: [], emails: []}` |
| **Financial Details** |
| `purchase_price` | DECIMAL(12,2) | Offer amount |
| `loan_type` | VARCHAR(100) | Loan type |
| `lending_company` | VARCHAR(255) | Lender name |
| `emd_amount` | DECIMAL(10,2) | Earnest money deposit |
| `exchange_fee` | DECIMAL(10,2) | Exchange fee amount |
| **Settlement Information** |
| `settlement_company` | VARCHAR(255) | Settlement company |
| `closing_cost_assistance` | TEXT | Closing cost details |
| `projected_closing_date` | DATE | Target closing date |
| **Inspection Details** |
| `wdi_inspection_details` | JSONB | `{period, provider, notes}` |
| `fica_details` | JSONB | `{required, inspection_period}` |
| **Additional Terms** |
| `extras` | TEXT | Additional terms |
| `lead_eifs_survey` | TEXT | Environmental survey notes |
| `occupancy_notes` | TEXT | Occupancy details |
| **Contingencies** |
| `financing_contingency_days` | INTEGER | Financing contingency period |
| `inspection_contingency_days` | INTEGER | Inspection contingency period |
| `appraisal_contingency_days` | INTEGER | Appraisal contingency period |
| `settlement_date_contingency_days` | INTEGER | Settlement contingency period |
| **Workflow Status** |
| `status` | VARCHAR(20) | 'pending', 'drafted', 'reviewed', 'approved', 'sent', 'cancelled' |
| `drafted_by` | UUID | Who drafted the offer |
| `reviewed_by` | UUID | Who reviewed the offer |
| `approved_at` | TIMESTAMP | Approval timestamp |
| `sent_at` | TIMESTAMP | Send timestamp |
| `generated_documents` | JSONB | Array of created document IDs |

**Key Features:**
- ✅ **Complete Offer Data**: Captures all offer details from PDF form
- ✅ **Workflow Tracking**: Status progression with approval chain
- ✅ **JSON Storage**: Flexible storage for complex data structures
- ✅ **Validation**: Business rules for prices, dates, and requirements
- ✅ **Document Integration**: Links to generated documents

### 7. **transaction_service_details** - Enhanced Service Tracking
*Extended service tier features and performance tracking*

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `transaction_id` | UUID | References transactions(id), UNIQUE |
| **Service Features** |
| `selected_features` | JSONB | Features enabled for transaction |
| `upgrade_history` | JSONB[] | Tier change tracking |
| `feature_customizations` | JSONB | Agent-specific customizations |
| **Service Delivery** |
| `service_milestones` | JSONB | Key service checkpoints |
| `milestone_completions` | JSONB | Completion tracking |
| `client_satisfaction_score` | INTEGER | 1-5 satisfaction rating |
| **Pricing & Billing** |
| `base_service_fee` | DECIMAL(8,2) | Base tier fee |
| `additional_fees` | JSONB | Add-on services |
| `discount_applied` | DECIMAL(8,2) | Discounts applied |
| `total_service_cost` | DECIMAL(8,2) | Total service cost |
| **Performance Metrics** |
| `response_time_hours` | DECIMAL(5,2) | Average response time |
| `issue_resolution_hours` | DECIMAL(5,2) | Average resolution time |
| `automation_success_rate` | DECIMAL(3,2) | Automation success % |

**Key Features:**
- ✅ **Feature Management**: Fine-grained feature control per transaction
- ✅ **Performance Tracking**: Service quality metrics
- ✅ **Billing Integration**: Complete cost tracking
- ✅ **Client Satisfaction**: Quality measurement

### 8. **agent_intake_sessions** - Onboarding Tracking
*Track agent onboarding and form completion*

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `agent_id` | UUID | References profiles(id) |
| `session_type` | VARCHAR(50) | 'initial', 'update', 'review' |
| `status` | VARCHAR(50) | 'in_progress', 'completed', 'abandoned' |
| `completion_percentage` | INTEGER | 0-100 completion percentage |
| **Form Data** |
| `vendor_data` | JSONB | Temporary vendor form data |
| `branding_data` | JSONB | Temporary branding form data |
| `preferences_data` | JSONB | Other preferences |
| **Session Metadata** |
| `started_at` | TIMESTAMP | Session start time |
| `completed_at` | TIMESTAMP | Session completion time |
| `last_activity_at` | TIMESTAMP | Last activity timestamp |
| `ip_address` | INET | User IP address |
| `user_agent` | TEXT | Browser user agent |
| **Review & Approval** |
| `reviewed_by` | UUID | Who reviewed the session |
| `approved_at` | TIMESTAMP | Approval timestamp |
| `approval_notes` | TEXT | Review notes |

**Key Features:**
- ✅ **Progress Tracking**: Real-time completion percentage
- ✅ **Auto-Save**: Temporary storage for form data
- ✅ **Session Management**: Resume interrupted sessions
- ✅ **Audit Trail**: Complete session tracking

---

## 📋 Supporting Tables

### 9. **tasks** - Task Management
*Transaction-specific task tracking*

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `transaction_id` | UUID | References transactions(id) |
| `title` | TEXT | Task title |
| `description` | TEXT | Task description |
| `assigned_to` | UUID | References profiles(id) |
| `due_date` | DATE | Task due date |
| `completed_at` | TIMESTAMP | Completion timestamp |
| `priority` | TEXT | 'low', 'medium', 'high', 'urgent' |

### 10. **documents** - Document Management
*Transaction document storage*

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `transaction_id` | UUID | References transactions(id) |
| `title` | TEXT | Document title |
| `file_path` | TEXT | Supabase storage path |
| `file_size` | INTEGER | File size in bytes |
| `mime_type` | TEXT | MIME type |
| `uploaded_by` | UUID | References profiles(id) |

---

## 🔄 Automation System

### 11. **automation_rules** - Workflow Rules
*Configurable automation rules engine*

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Rule name |
| `description` | TEXT | Rule description |
| `trigger_event` | TEXT | Event that triggers rule |
| `conditions` | JSONB | Rule conditions |
| `actions` | JSONB | Actions to execute |
| `is_active` | BOOLEAN | Rule enabled status |
| `service_tier` | service_tier_type | Applicable service tier |
| `service_tier_filter` | VARCHAR(50) | Service tier filter |
| `vendor_type` | VARCHAR(50) | Applicable vendor type |
| `automation_category` | VARCHAR(50) | Rule category |

**Trigger Events:**
- `task_completed`, `status_changed`, `document_signed`, `document_uploaded`
- `offer_request_submitted`, `offer_approved`, `vendor_assigned`, `service_tier_selected`

### 12. **workflow_executions** - Execution Tracking
*Track automation rule executions*

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `automation_rule_id` | UUID | References automation_rules(id) |
| `transaction_id` | UUID | References transactions(id) |
| `trigger_data` | JSONB | Event data that triggered execution |
| `execution_status` | TEXT | 'pending', 'running', 'completed', 'failed', 'retrying' |
| `result_data` | JSONB | Execution results |
| `error_message` | TEXT | Error details if failed |
| `started_at` | TIMESTAMP | Execution start time |
| `completed_at` | TIMESTAMP | Execution completion time |
| `service_tier` | service_tier_type | Service tier context |
| `vendor_context` | JSONB | Vendor-related context |
| `client_context` | JSONB | Client-related context |

### 13. **email_templates** - Template Management
*Email template storage and management*

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Template name |
| `subject` | TEXT | Email subject line |
| `content` | TEXT | Email content |
| `template_type` | TEXT | Template category |
| `service_tier` | service_tier_type | Applicable service tier |
| `service_tier_filter` | VARCHAR(50) | Service tier filter |
| `is_agent_customizable` | BOOLEAN | Agent can customize |

---

## 🔐 Security Model

### Row Level Security (RLS) Policies

**Agent Data Isolation:**
```sql
-- Agents can only access their own transactions
CREATE POLICY "Agents can view their assigned transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = agent_id);

-- Agents can only manage their own vendors
CREATE POLICY "Agents can manage their own vendors" 
ON public.agent_vendors FOR ALL 
USING (agent_id = auth.uid());
```

**Role-Based Access:**
```sql
-- All agents can view all clients
CREATE POLICY "Agents can view all clients" 
ON public.clients FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role IN ('admin', 'coordinator', 'agent')
));
```

**Data Relationships:**
- Tasks, documents, and service details follow transaction access
- Workflow executions respect automation rule access
- All user-specific data is isolated by auth.uid()

---

## 🚀 Database Functions

### Business Logic Functions

**1. Get Agent's Primary Vendor**
```sql
get_agent_primary_vendor(agent_id UUID, vendor_type TEXT) RETURNS UUID
```
Returns the primary vendor ID for an agent and vendor type.

**2. Service Tier Features**
```sql
get_service_tier_features(service_tier TEXT) RETURNS JSONB
```
Returns the feature array for a given service tier.

**3. Offer Request Automation Trigger**
```sql
trigger_offer_request_automation() RETURNS TRIGGER
```
Automatically creates workflow executions when offer requests are submitted.

---

## 📊 Performance Optimizations

### Indexes

**Core Performance Indexes:**
```sql
-- Agent-specific data access
CREATE INDEX idx_transactions_agent_status ON transactions(agent_id, status);
CREATE INDEX idx_agent_vendors_agent_type ON agent_vendors(agent_id, vendor_type);
CREATE INDEX idx_offer_requests_agent ON offer_requests(agent_id);

-- Service tier filtering
CREATE INDEX idx_transactions_service_tier ON transactions(service_tier);
CREATE INDEX idx_automation_rules_service_tier ON automation_rules(service_tier_filter);

-- Workflow execution tracking
CREATE INDEX idx_workflow_executions_status ON workflow_executions(execution_status);
CREATE INDEX idx_offer_requests_status ON offer_requests(status);
```

**Search Optimization:**
```sql
-- Full-text search for clients
CREATE INDEX idx_clients_search ON clients 
USING gin(to_tsvector('english', full_name || ' ' || email));
```

---

## 🔄 Real-time Features

### Supabase Realtime Integration

**Enabled Tables:**
- `agent_vendors` - Real-time vendor updates
- `agent_branding` - Live branding changes  
- `offer_requests` - Instant offer status updates
- `transaction_service_details` - Service tracking
- `agent_intake_sessions` - Form progress tracking

**Usage Patterns:**
```typescript
// Subscribe to offer request updates
const { data, error } = supabase
  .channel('offer_updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'offer_requests',
    filter: `agent_id=eq.${agentId}`
  }, (payload) => {
    updateOfferStatus(payload.new);
  })
  .subscribe();
```

---

## 🎯 Lovable.dev Integration

### Key Integration Points

**1. Form Development:**
- `agent_vendors` - Multi-vendor preference forms
- `agent_branding` - Personalization form with conditional fields
- `offer_requests` - Complex multi-section offer forms

**2. Real-time Features:**
- Status updates via Supabase realtime
- Progress tracking for multi-step forms
- Live collaboration on offer requests

**3. Service Tier Management:**
- Dynamic feature enabling/disabling
- Tier-specific UI components
- Automated service delivery tracking

**4. Automation Integration:**
- Trigger workflow executions from form submissions
- Automated vendor assignments
- Email template personalization

---

## 📋 Migration History

### Phase 1: Base Schema (June 1, 2024)
- Core transaction management tables
- Basic automation and email systems
- Foundation RLS policies

### Phase 2: Agent Concierge Integration (December 29, 2024)
- Agent vendor preferences (`agent_vendors`)
- Agent branding and personalization (`agent_branding`)
- Digital offer management (`offer_requests`)
- Enhanced service tracking (`transaction_service_details`)
- Onboarding session management (`agent_intake_sessions`)
- Extended automation capabilities
- Enhanced real-time features

---

## 🔍 Usage Examples

### Common Query Patterns

**1. Get Agent's Transaction Dashboard:**
```sql
SELECT 
  t.*,
  c.first_name || ' ' || c.last_name as client_name,
  tsd.client_satisfaction_score,
  COUNT(tasks.id) as task_count
FROM transactions t
JOIN clients c ON c.id = t.client_id
LEFT JOIN transaction_service_details tsd ON tsd.transaction_id = t.id
LEFT JOIN tasks ON tasks.transaction_id = t.id AND tasks.completed_at IS NULL
WHERE t.agent_id = $1
GROUP BY t.id, c.first_name, c.last_name, tsd.client_satisfaction_score;
```

**2. Get Agent's Primary Vendors:**
```sql
SELECT vendor_type, company_name, contact_name, email, phone
FROM agent_vendors
WHERE agent_id = $1 AND is_primary = true AND is_active = true
ORDER BY vendor_type;
```

**3. Track Offer Request Progress:**
```sql
SELECT 
  or.*,
  t.property_address,
  t.service_tier,
  p.full_name as agent_name
FROM offer_requests or
JOIN transactions t ON t.id = or.transaction_id
JOIN profiles p ON p.id = or.agent_id
WHERE or.status = 'pending'
ORDER BY or.created_at DESC;
```

---

This database schema provides a comprehensive foundation for the Concierge Transaction Flow application, supporting complex real estate workflows while maintaining security, performance, and scalability for Lovable.dev development.