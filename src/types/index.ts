
// Comprehensive type definitions for the application

export interface TransactionData {
  id: string;
  property_address: string;
  purchase_price?: number;
  status: 'intake' | 'active' | 'closed';
  transaction_type?: 'buyer' | 'seller' | 'dual';
  service_tier?: 'buyer_core' | 'buyer_elite' | 'white_glove_buyer' | 'listing_core' | 'listing_elite' | 'white_glove_listing';
  closing_date?: string;
  agent_id: string;
  city: string;
  state: string;
  zip_code: string;
  commission_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface WorkflowData {
  id: string;
  name: string;
  description?: string;
  type: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowExecution {
  id: string;
  rule_id: string;
  transaction_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'retrying';
  executed_at: string;
  completed_at?: string;
  error_message?: string;
  retry_count: number;
  metadata?: Record<string, any>;
}

export interface TemplateData {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplateData {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  category?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AgentData {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  role: 'agent' | 'coordinator';
  brokerage?: string;
  license_number?: string;
  years_experience?: number;
  specialties?: string[];
  bio?: string;
  profile_image_url?: string;
  invitation_status?: 'pending' | 'accepted' | 'expired';
  invited_at?: string;
  invited_by?: string;
  onboarding_completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AutomationRuleData {
  id: string;
  name: string;
  trigger_event: 'contract_date_offset' | 'status_change' | 'task_completed' | 'document_uploaded' | 'closing_date_offset' | 'time_based';
  trigger_condition?: Record<string, any>;
  template_id: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  status: number;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  count?: number;
  totalPages?: number;
  currentPage?: number;
}

export interface FormValidationError {
  field: string;
  message: string;
}

export interface ServiceError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// Mobile table specific types
export interface MobileTableColumn<T = Record<string, any>> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  primary?: boolean;
  secondary?: boolean;
}

export interface MobileTableProps<T = Record<string, any>> {
  data: T[];
  columns: MobileTableColumn<T>[];
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

// Transaction form data
export interface CreateTransactionFormData {
  property_address: string;
  city: string;
  state: string;
  zip_code: string;
  purchase_price?: number;
  transaction_type?: 'buyer' | 'seller' | 'dual';
  service_tier?: string;
  closing_date?: string;
  commission_rate?: number;
}

// Agent list error types
export interface AgentListError {
  message: string;
  type: 'fetch_error' | 'validation_error' | 'network_error';
  details?: Record<string, any>;
}
