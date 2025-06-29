// Agent Concierge Integration Types
// These types extend the main Database interface with new Agent Concierge tables

import type { Json } from './types'

// =============================================================================
// AGENT CONCIERGE TABLE TYPES
// =============================================================================

export interface AgentVendorsTable {
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
  Insert: {
    id?: string
    agent_id: string
    vendor_type: string
    company_name: string
    contact_name?: string | null
    email?: string | null
    phone?: string | null
    address?: string | null
    notes?: string | null
    is_primary?: boolean
    is_active?: boolean
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    agent_id?: string
    vendor_type?: string
    company_name?: string
    contact_name?: string | null
    email?: string | null
    phone?: string | null
    address?: string | null
    notes?: string | null
    is_primary?: boolean
    is_active?: boolean
    created_at?: string
    updated_at?: string
  }
  Relationships: [
    {
      foreignKeyName: "agent_vendors_agent_id_fkey"
      columns: ["agent_id"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
  ]
}

export interface AgentBrandingTable {
  Row: {
    id: string
    agent_id: string
    has_branded_sign: boolean
    sign_notes: string | null
    review_link: string | null
    has_canva_template: boolean
    canva_template_url: string | null
    social_media_permission: boolean
    favorite_color: string | null
    drinks_coffee: boolean | null
    drinks_alcohol: boolean | null
    birthday: string | null
    preferred_communication_time: string | null
    communication_style: string | null
    logo_url: string | null
    business_card_template_url: string | null
    email_signature: string | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    agent_id: string
    has_branded_sign?: boolean
    sign_notes?: string | null
    review_link?: string | null
    has_canva_template?: boolean
    canva_template_url?: string | null
    social_media_permission?: boolean
    favorite_color?: string | null
    drinks_coffee?: boolean | null
    drinks_alcohol?: boolean | null
    birthday?: string | null
    preferred_communication_time?: string | null
    communication_style?: string | null
    logo_url?: string | null
    business_card_template_url?: string | null
    email_signature?: string | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    agent_id?: string
    has_branded_sign?: boolean
    sign_notes?: string | null
    review_link?: string | null
    has_canva_template?: boolean
    canva_template_url?: string | null
    social_media_permission?: boolean
    favorite_color?: string | null
    drinks_coffee?: boolean | null
    drinks_alcohol?: boolean | null
    birthday?: string | null
    preferred_communication_time?: string | null
    communication_style?: string | null
    logo_url?: string | null
    business_card_template_url?: string | null
    email_signature?: string | null
    created_at?: string
    updated_at?: string
  }
  Relationships: [
    {
      foreignKeyName: "agent_branding_agent_id_fkey"
      columns: ["agent_id"]
      isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
  ]
}

export interface OfferRequestsTable {
  Row: {
    id: string
    transaction_id: string | null
    agent_id: string
    property_address: string
    property_city: string | null
    property_state: string | null
    property_zip: string | null
    buyer_names: string
    buyer_contacts: Json
    purchase_price: number
    loan_type: string
    lending_company: string
    emd_amount: number
    exchange_fee: number
    settlement_company: string
    closing_cost_assistance: string | null
    projected_closing_date: string
    wdi_inspection_details: Json
    fica_details: Json
    extras: string | null
    lead_eifs_survey: string | null
    occupancy_notes: string | null
    financing_contingency_days: number | null
    inspection_contingency_days: number | null
    appraisal_contingency_days: number | null
    settlement_date_contingency_days: number | null
    status: string
    drafted_by: string | null
    reviewed_by: string | null
    approved_at: string | null
    sent_at: string | null
    generated_documents: Json | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    transaction_id?: string | null
    agent_id: string
    property_address: string
    property_city?: string | null
    property_state?: string | null
    property_zip?: string | null
    buyer_names: string
    buyer_contacts: Json
    purchase_price: number
    loan_type: string
    lending_company: string
    emd_amount: number
    exchange_fee: number
    settlement_company: string
    closing_cost_assistance?: string | null
    projected_closing_date: string
    wdi_inspection_details: Json
    fica_details: Json
    extras?: string | null
    lead_eifs_survey?: string | null
    occupancy_notes?: string | null
    financing_contingency_days?: number | null
    inspection_contingency_days?: number | null
    appraisal_contingency_days?: number | null
    settlement_date_contingency_days?: number | null
    status?: string
    drafted_by?: string | null
    reviewed_by?: string | null
    approved_at?: string | null
    sent_at?: string | null
    generated_documents?: Json | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    transaction_id?: string | null
    agent_id?: string
    property_address?: string
    property_city?: string | null
    property_state?: string | null
    property_zip?: string | null
    buyer_names?: string
    buyer_contacts?: Json
    purchase_price?: number
    loan_type?: string
    lending_company?: string
    emd_amount?: number
    exchange_fee?: number
    settlement_company?: string
    closing_cost_assistance?: string | null
    projected_closing_date?: string
    wdi_inspection_details?: Json
    fica_details?: Json
    extras?: string | null
    lead_eifs_survey?: string | null
    occupancy_notes?: string | null
    financing_contingency_days?: number | null
    inspection_contingency_days?: number | null
    appraisal_contingency_days?: number | null
    settlement_date_contingency_days?: number | null
    status?: string
    drafted_by?: string | null
    reviewed_by?: string | null
    approved_at?: string | null
    sent_at?: string | null
    generated_documents?: Json | null
    created_at?: string
    updated_at?: string
  }
  Relationships: [
    {
      foreignKeyName: "offer_requests_transaction_id_fkey"
      columns: ["transaction_id"]
      isOneToOne: false
      referencedRelation: "transactions"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "offer_requests_agent_id_fkey"
      columns: ["agent_id"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "offer_requests_drafted_by_fkey"
      columns: ["drafted_by"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "offer_requests_reviewed_by_fkey"
      columns: ["reviewed_by"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
  ]
}

export interface TransactionServiceDetailsTable {
  Row: {
    id: string
    transaction_id: string
    selected_features: Json | null
    upgrade_history: Json[] | null
    feature_customizations: Json | null
    service_milestones: Json | null
    milestone_completions: Json | null
    client_satisfaction_score: number | null
    base_service_fee: number | null
    additional_fees: Json | null
    discount_applied: number | null
    total_service_cost: number | null
    response_time_hours: number | null
    issue_resolution_hours: number | null
    automation_success_rate: number | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    transaction_id: string
    selected_features?: Json | null
    upgrade_history?: Json[] | null
    feature_customizations?: Json | null
    service_milestones?: Json | null
    milestone_completions?: Json | null
    client_satisfaction_score?: number | null
    base_service_fee?: number | null
    additional_fees?: Json | null
    discount_applied?: number | null
    total_service_cost?: number | null
    response_time_hours?: number | null
    issue_resolution_hours?: number | null
    automation_success_rate?: number | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    transaction_id?: string
    selected_features?: Json | null
    upgrade_history?: Json[] | null
    feature_customizations?: Json | null
    service_milestones?: Json | null
    milestone_completions?: Json | null
    client_satisfaction_score?: number | null
    base_service_fee?: number | null
    additional_fees?: Json | null
    discount_applied?: number | null
    total_service_cost?: number | null
    response_time_hours?: number | null
    issue_resolution_hours?: number | null
    automation_success_rate?: number | null
    created_at?: string
    updated_at?: string
  }
  Relationships: [
    {
      foreignKeyName: "transaction_service_details_transaction_id_fkey"
      columns: ["transaction_id"]
      isOneToOne: true
      referencedRelation: "transactions"
      referencedColumns: ["id"]
    }
  ]
}

export interface AgentIntakeSessionsTable {
  Row: {
    id: string
    agent_id: string
    session_type: string
    status: string
    completion_percentage: number
    vendor_data: Json | null
    branding_data: Json | null
    preferences_data: Json | null
    started_at: string
    completed_at: string | null
    last_activity_at: string
    ip_address: string | null
    user_agent: string | null
    reviewed_by: string | null
    approved_at: string | null
    approval_notes: string | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    agent_id: string
    session_type?: string
    status?: string
    completion_percentage?: number
    vendor_data?: Json | null
    branding_data?: Json | null
    preferences_data?: Json | null
    started_at?: string
    completed_at?: string | null
    last_activity_at?: string
    ip_address?: string | null
    user_agent?: string | null
    reviewed_by?: string | null
    approved_at?: string | null
    approval_notes?: string | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    agent_id?: string
    session_type?: string
    status?: string
    completion_percentage?: number
    vendor_data?: Json | null
    branding_data?: Json | null
    preferences_data?: Json | null
    started_at?: string
    completed_at?: string | null
    last_activity_at?: string
    ip_address?: string | null
    user_agent?: string | null
    reviewed_by?: string | null
    approved_at?: string | null
    approval_notes?: string | null
    created_at?: string
    updated_at?: string
  }
  Relationships: [
    {
      foreignKeyName: "agent_intake_sessions_agent_id_fkey"
      columns: ["agent_id"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "agent_intake_sessions_reviewed_by_fkey"
      columns: ["reviewed_by"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
  ]
}

// =============================================================================
// HELPER TYPES FOR FORM DATA
// =============================================================================

export type AgentVendor = AgentVendorsTable['Row']
export type AgentVendorInsert = AgentVendorsTable['Insert']
export type AgentVendorUpdate = AgentVendorsTable['Update']

export type AgentBranding = AgentBrandingTable['Row']
export type AgentBrandingInsert = AgentBrandingTable['Insert']
export type AgentBrandingUpdate = AgentBrandingTable['Update']

export type OfferRequest = OfferRequestsTable['Row']
export type OfferRequestInsert = OfferRequestsTable['Insert']
export type OfferRequestUpdate = OfferRequestsTable['Update']

export type TransactionServiceDetails = TransactionServiceDetailsTable['Row']
export type TransactionServiceDetailsInsert = TransactionServiceDetailsTable['Insert']
export type TransactionServiceDetailsUpdate = TransactionServiceDetailsTable['Update']

export type AgentIntakeSession = AgentIntakeSessionsTable['Row']
export type AgentIntakeSessionInsert = AgentIntakeSessionsTable['Insert']
export type AgentIntakeSessionUpdate = AgentIntakeSessionsTable['Update']

// =============================================================================
// VENDOR TYPES
// =============================================================================

export const VENDOR_TYPES = [
  'lender',
  'settlement',
  'home_inspection',
  'termite_inspection',
  'photography',
  'staging',
  'cleaning',
  'lawn_care',
  'title_company',
  'appraiser',
  'surveyor',
  'insurance',
  'locksmith',
  'handyman'
] as const

export type VendorType = typeof VENDOR_TYPES[number]

// =============================================================================
// OFFER REQUEST TYPES
// =============================================================================

export const OFFER_REQUEST_STATUSES = [
  'pending',
  'drafted',
  'reviewed',
  'approved',
  'sent',
  'cancelled'
] as const

export type OfferRequestStatus = typeof OFFER_REQUEST_STATUSES[number]

export const LOAN_TYPES = [
  'Conventional',
  'FHA',
  'VA',
  'USDA',
  'Cash',
  'Jumbo',
  'Other'
] as const

export type LoanType = typeof LOAN_TYPES[number]

// =============================================================================
// FORM DATA INTERFACES
// =============================================================================

export interface BuyerContact {
  phones: string[]
  emails: string[]
}

export interface WDIInspectionDetails {
  period: string
  provider: 'buyer' | 'seller'
  notes?: string
}

export interface FICADetails {
  required: boolean
  inspection_period?: string
}

export interface OfferRequestFormData {
  // Property Information
  property_address: string
  property_city?: string
  property_state?: string
  property_zip?: string
  
  // Buyer Information
  buyer_names: string
  buyer_contacts: BuyerContact
  
  // Financial Details
  purchase_price: number
  loan_type: LoanType
  lending_company: string
  emd_amount: number
  exchange_fee: number
  
  // Settlement Information
  settlement_company: string
  closing_cost_assistance?: string
  projected_closing_date: string
  
  // Inspection Details
  wdi_inspection_details: WDIInspectionDetails
  fica_details: FICADetails
  
  // Additional Terms
  extras?: string
  lead_eifs_survey?: string
  occupancy_notes?: string
  
  // Contingencies
  financing_contingency_days?: number
  inspection_contingency_days?: number
  appraisal_contingency_days?: number
  settlement_date_contingency_days?: number
}

export interface AgentIntakeFormData {
  vendors: AgentVendorInsert[]
  branding: AgentBrandingInsert
  session: AgentIntakeSessionInsert
}

// =============================================================================
// SERVICE TIER FEATURES
// =============================================================================

export interface ServiceTierFeatures {
  [key: string]: string[]
}

export const SERVICE_TIER_FEATURES: ServiceTierFeatures = {
  buyer_core: ['basic_coordination', 'document_management', 'email_communication'],
  buyer_elite: ['basic_coordination', 'document_management', 'email_communication', 'welcome_guides', 'premium_support'],
  white_glove_buyer: ['basic_coordination', 'document_management', 'email_communication', 'welcome_guides', 'premium_support', 'concierge_service', 'celebration'],
  listing_core: ['basic_coordination', 'document_management', 'email_communication', 'mls_listing'],
  listing_elite: ['basic_coordination', 'document_management', 'email_communication', 'mls_listing', 'professional_photography', 'social_media'],
  white_glove_listing: ['basic_coordination', 'document_management', 'email_communication', 'mls_listing', 'professional_photography', 'social_media', 'staging', 'lockbox_management']
}

// =============================================================================
// AUTOMATION ENHANCEMENTS
// =============================================================================

export const AUTOMATION_CATEGORIES = [
  'general',
  'offer_management', 
  'vendor_coordination',
  'service_tier_automation',
  'client_communication'
] as const

export type AutomationCategory = typeof AUTOMATION_CATEGORIES[number]

export const NEW_TRIGGER_EVENTS = [
  'offer_request_submitted',
  'offer_approved',
  'vendor_assigned',
  'service_tier_selected'
] as const

export type NewTriggerEvent = typeof NEW_TRIGGER_EVENTS[number]