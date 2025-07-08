import { Database } from '@/integrations/supabase/types';

// Base types from database
export type DbWorkflowTemplate = Database['public']['Tables']['workflow_templates']['Row'];
export type DbTemplateTask = Database['public']['Tables']['template_tasks']['Row'];
export type DbEmailTemplate = Database['public']['Tables']['email_templates']['Row'];

// Due date rule types
export interface DueDateRule {
  type: 'days_from_event' | 'specific_date' | 'no_due_date';
  days?: number;
  event?: 'ratified_date' | 'closing_date' | 'inspection_date' | 'appraisal_date' | 'financing_date';
  date?: string;
}

// Template task interface with proper typing
export interface TemplateTask {
  id: string;
  subject: string;
  task_type?: string | null;
  email_template_id?: string | null;
  due_date_rule: DueDateRule;
  sort_order: number;
  is_agent_visible: boolean;
  is_milestone: boolean | null;
  description_notes?: string | null;
  phase?: string | null;
  template_id: string;
  created_at: string;
}

// Workflow template with tasks
export interface WorkflowTemplate {
  id: string;
  name: string;
  type: 'Listing' | 'Buyer' | 'General';
  description?: string | null;
  is_active: boolean;
  created_at: string;
  created_by: string;
  updated_at: string;
  template_tasks: TemplateTask[];
}

// Workflow template without tasks (for basic operations)
export interface WorkflowTemplateBase {
  id: string;
  name: string;
  type: 'Listing' | 'Buyer' | 'General';
  description?: string | null;
  is_active: boolean;
  created_at: string;
  created_by: string;
  updated_at: string;
}

// Email template interface
export interface EmailTemplate {
  id: string;
  name: string;
  subject?: string | null;
  to?: string | null;
  cc?: string | null;
  bcc?: string | null;
  content?: string | null;
  created_at: string;
  updated_at: string;
}

// XML Import types
export interface ParsedXMLTask {
  subject: string;
  taskType: string;
  dueDateRule: DueDateRule;
  isAgentVisible: boolean;
  hasEmail: boolean;
  sortOrder: number;
  phase?: string;
  descriptionNotes?: string;
}

export interface ParsedXMLEmail {
  name: string;
  subject: string;
  to: string;
  cc: string;
  bcc: string;
  content?: string;
}

export interface ParsedXMLTemplate {
  name: string;
  type: string;
  description: string;
  folderName: string;
  tasks: ParsedXMLTask[];
  emails: ParsedXMLEmail[];
}

export interface XMLValidationIssue {
  type: 'error' | 'warning';
  message: string;
  location?: string;
}

export interface XMLImportResult {
  success: boolean;
  templatesImported: number;
  tasksImported: number;
  emailsImported: number;
  importId: string;
  error?: string;
}

export interface XMLImportProgress {
  stage: 'parsing' | 'validating' | 'importing' | 'completed' | 'error';
  templatesProcessed: number;
  totalTemplates: number;
  tasksProcessed: number;
  totalTasks: number;
  emailsProcessed: number;
  totalEmails: number;
  currentTemplate?: string;
  error?: string;
}

// Form types
export interface CreateTemplateFormData {
  name: string;
  type: 'Listing' | 'Buyer' | 'General';
  description: string;
}

export interface TemplateTaskFormData {
  id?: string;
  subject: string;
  description_notes: string;
  due_date_rule: DueDateRule;
  phase: string;
  is_agent_visible: boolean;
  email_template_id?: string;
  sort_order: number;
}

// Sort and filter types
export type TemplateSortOption = 'name' | 'created_at' | 'task_count';
export type TemplateFilterStatus = 'all' | 'active' | 'inactive';
export type TemplateFilterSource = 'all' | 'imported' | 'manual';

// Error handling types
export interface TemplateError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// API response types
export interface TemplateAPIResponse<T = unknown> {
  data?: T;
  error?: TemplateError;
  success: boolean;
}

// Workflow integration types
export interface WorkflowTriggerCondition {
  service_tier?: string;
  transaction_type?: string;
  agent_id?: string;
  [key: string]: unknown;
}

export interface WorkflowMetadata {
  triggered_by?: string;
  service_tier?: string;
  transaction_type?: string;
  form_data?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface IntakeCompleteData {
  agent_id: string;
  service_tier: string;
  vendor_preferences?: Record<string, unknown>;
  branding_preferences?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface OfferSubmitData {
  transaction_id: string;
  offer_amount: number;
  terms?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ServiceTierSelectData {
  transaction_id: string;
  service_tier: string;
  selected_features?: string[];
  [key: string]: unknown;
}