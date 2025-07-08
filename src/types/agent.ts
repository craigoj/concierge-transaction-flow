// Comprehensive Agent Type Definitions
// This file contains all TypeScript interfaces for agent-related functionality

import { Database, Tables, Enums } from '@/integrations/supabase/types';
import { Json } from '@/integrations/supabase/types';

// =============================================================================
// CORE AGENT TYPES
// =============================================================================

export type Profile = Tables<'profiles'>;
export type UserRole = Enums<'user_role'>;

// Extended agent profile with additional computed properties
export interface AgentProfile extends Profile {
  full_name?: string;
  display_name?: string;
  status?: string;
  setup_completion?: number;
}

// Agent creation and update interfaces
export interface CreateAgentRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  brokerage?: string;
  license_number?: string;
  years_experience?: number;
  specialties?: string[];
  setup_method?: 'email_invitation' | 'manual_creation' | 'assisted_setup';
  bio?: string;
}

export interface UpdateAgentRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  brokerage?: string;
  license_number?: string;
  years_experience?: number;
  specialties?: string[];
  bio?: string;
}

// =============================================================================
// AGENT SEARCH AND FILTERING
// =============================================================================

export interface AgentSearchFilters {
  searchTerm: string;
  status: 'all' | 'completed' | 'sent' | 'pending';
  brokerage: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  experience: 'all' | '0-2' | '3-5' | '6-10' | '10+';
  location: string;
}

export interface AgentSearchResult extends AgentProfile {
  match_score?: number;
  highlighted_fields?: string[];
}

// =============================================================================
// AGENT MANAGEMENT AND PERMISSIONS
// =============================================================================

export interface AgentPermissions {
  can_view_transactions: boolean;
  can_edit_transactions: boolean;
  can_delete_transactions: boolean;
  can_manage_clients: boolean;
  can_access_documents: boolean;
  can_use_automation: boolean;
  admin_level?: 'none' | 'limited' | 'full';
}

export interface AgentAccountSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  auto_save_enabled: boolean;
  theme_preference: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
}

// =============================================================================
// AGENT INVITATION AND ONBOARDING
// =============================================================================

export type InvitationStatus = 'pending' | 'sent' | 'completed' | 'expired' | 'cancelled';
export type SetupMethod = 'email_invitation' | 'manual_creation' | 'assisted_setup';

export interface AgentInvitation {
  id: string;
  agent_id: string;
  email: string;
  status: InvitationStatus;
  invitation_token: string;
  setup_link_token?: string;
  invited_by: string;
  invited_at: string;
  accepted_at?: string;
  expires_at?: string;
  creation_method?: string;
  admin_notes?: string;
}

export interface OnboardingProgress {
  step: number;
  total_steps: number;
  completed_steps: string[];
  current_step: string;
  completion_percentage: number;
  estimated_time_remaining?: number;
}

// =============================================================================
// AGENT DATA PROVIDER TYPES
// =============================================================================

export interface AgentTransaction extends Tables<'transactions'> {
  clients: Tables<'clients'>[];
  tasks: Tables<'tasks'>[];
}

export interface AgentDataContextType {
  transactions: AgentTransaction[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  hasAccess: (transactionId: string) => boolean;
}

// =============================================================================
// ADMIN DASHBOARD TYPES
// =============================================================================

export interface AdminDashboardStats {
  totalAgents: number;
  activeAgents: number;
  pendingAgents: number;
  lockedAgents: number;
  thisWeekAgents: number;
  communicationsThisWeek: number;
  failedCommunications: number;
  onboardingRate: number;
}

export interface AgentActivitySummary {
  agent_id: string;
  agent_name: string;
  last_login?: string;
  transactions_count: number;
  active_tasks_count: number;
  completion_rate: number;
  communication_activity: number;
}

// =============================================================================
// AGENT ACCOUNT CONTROLLER TYPES
// =============================================================================

export interface AgentAccountControllerData {
  agent: AgentProfile;
  permissions: AgentPermissions;
  settings: AgentAccountSettings;
  invitations: AgentInvitation[];
  activity_summary: AgentActivitySummary;
}

export interface AgentStatusUpdateRequest {
  agent_id: string;
  new_status: InvitationStatus;
  admin_activated?: boolean;
  reason?: string;
}

export interface PasswordResetRequest {
  agent_id: string;
  email: string;
  redirect_url?: string;
}

export interface SetupLinkRequest {
  agent_id: string;
  expires_hours?: number;
}

export interface SetupLinkResponse {
  success: boolean;
  setup_link?: string;
  expires_at?: string;
  error?: string;
}

// =============================================================================
// SERVICE TIER MANAGEMENT TYPES
// =============================================================================

export type ServiceTierType = Enums<'service_tier_type'>;

export interface ServiceTierMetrics {
  completionRate: number;
  avgClosingTime: number;
  clientSatisfaction: number;
  upgradeRecommendation?: ServiceTierType;
  totalTransactions?: number;
  successRate?: number;
}

export interface ServiceTierFeatures {
  [key: string]: string[];
}

export interface ServiceTierPricing {
  [key: string]: number;
}

export interface ServiceTierUpgradeRequest {
  transaction_id: string;
  from_tier: ServiceTierType;
  to_tier: ServiceTierType;
  reason?: string;
  effective_date?: string;
}

// =============================================================================
// BULK OPERATIONS
// =============================================================================

export interface BulkAgentOperation {
  action: 'activate' | 'deactivate' | 'delete' | 'send_invitation' | 'update_status';
  agent_ids: string[];
  parameters?: Record<string, unknown>;
  performed_by: string;
}

export interface BulkOperationResult {
  success: boolean;
  processed_count: number;
  failed_count: number;
  errors: Array<{
    agent_id: string;
    error: string;
  }>;
}

// =============================================================================
// ERROR AND RESPONSE TYPES
// =============================================================================

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
    has_more?: boolean;
  };
}

// =============================================================================
// EVENT AND CALLBACK TYPES
// =============================================================================

export interface AgentEventCallbacks {
  onAgentCreated?: (agent: AgentProfile) => void;
  onAgentUpdated?: (agent: AgentProfile) => void;
  onAgentDeleted?: (agentId: string) => void;
  onStatusChanged?: (agentId: string, newStatus: InvitationStatus) => void;
  onInvitationSent?: (invitation: AgentInvitation) => void;
  onError?: (error: ApiError) => void;
}

// =============================================================================
// FORM AND VALIDATION TYPES
// =============================================================================

export interface AgentFormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  brokerage?: string;
  license_number?: string;
  years_experience?: string;
  general?: string;
}

export interface AgentFormValidation {
  isValid: boolean;
  errors: AgentFormErrors;
  warnings?: AgentFormErrors;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type AgentSortField = 'name' | 'email' | 'created_at' | 'last_login' | 'status' | 'brokerage';
export type SortDirection = 'asc' | 'desc';

export interface AgentSortOptions {
  field: AgentSortField;
  direction: SortDirection;
}

export interface AgentPaginationOptions {
  page: number;
  limit: number;
  sort?: AgentSortOptions;
}

// =============================================================================
// REALTIME AND PAYLOAD TYPES
// =============================================================================

export interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: Record<string, unknown>;
  old?: Record<string, unknown>;
  schema: string;
  table: string;
}

export interface AgentRealtimeUpdate {
  id: string;
  action: 'created' | 'updated' | 'deleted';
  data?: Partial<AgentProfile>;
  timestamp: string;
}

// =============================================================================
// TEMPLATE AND WORKFLOW TYPES
// =============================================================================

export interface AgentTemplate {
  id: string;
  name: string;
  description?: string;
  template_data: Record<string, unknown>;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  required: boolean;
  order: number;
  estimated_duration?: number;
  completed_at?: string;
}

export interface AgentWorkflow {
  id: string;
  agent_id: string;
  workflow_type: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  steps: WorkflowStep[];
  progress_percentage: number;
  started_at?: string;
  completed_at?: string;
  current_step?: string;
}

// =============================================================================
// BULK OPERATIONS AND VALIDATION
// =============================================================================

export interface AgentValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  agent_data?: Partial<CreateAgentRequest>;
}

export interface BulkImportResult {
  total_processed: number;
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    agent_data?: Partial<CreateAgentRequest>;
    errors: string[];
  }>;
  created_agents: AgentProfile[];
}

// =============================================================================
// COMMUNICATION AND NOTIFICATION TYPES
// =============================================================================

export interface CommunicationTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  body_text?: string;
  template_type: 'email' | 'sms' | 'in_app';
  variables: Record<string, unknown>;
  is_active: boolean;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  communication_alerts: boolean;
  task_reminders: boolean;
  status_updates: boolean;
}

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

export interface AgentListProps {
  agents: AgentProfile[];
  loading?: boolean;
  onAgentSelect?: (agent: AgentProfile) => void;
  onAgentEdit?: (agent: AgentProfile) => void;
  onAgentDelete?: (agentId: string) => void;
  showBulkActions?: boolean;
  searchable?: boolean;
  filterable?: boolean;
}

export interface AgentCardProps {
  agent: AgentProfile;
  onClick?: (agent: AgentProfile) => void;
  onEdit?: (agent: AgentProfile) => void;
  onDelete?: (agentId: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export interface CreateAgentDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (agent: AgentProfile) => void;
  onError?: (error: ApiError) => void;
  initialData?: Partial<CreateAgentRequest>;
}

export interface EditAgentDialogProps {
  agent: AgentProfile;
  open: boolean;
  onClose: () => void;
  onSuccess?: (agent: AgentProfile) => void;
  onError?: (error: ApiError) => void;
}

export interface DeleteAgentDialogProps {
  agent: AgentProfile;
  open: boolean;
  onClose: () => void;
  onSuccess?: (agentId: string) => void;
  onError?: (error: ApiError) => void;
}

export interface BulkActionsDialogProps {
  selectedAgents: AgentProfile[];
  open: boolean;
  onClose: () => void;
  onSuccess?: (operation: string, count: number) => void;
  onError?: (error: ApiError) => void;
}