
export interface AutomationRule {
  id: string;
  name: string;
  trigger_event: TriggerEvent;
  trigger_condition: TriggerCondition;
  template_id: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type TriggerEvent = 
  | 'contract_date_offset'
  | 'status_change'
  | 'task_completed'
  | 'document_uploaded'
  | 'closing_date_offset'
  | 'time_based';

export interface TriggerCondition {
  type: TriggerEvent;
  // For date-based triggers
  offset_days?: number;
  offset_type?: 'before' | 'after';
  reference_date?: 'contract_date' | 'closing_date' | 'created_at';
  
  // For status change triggers
  from_status?: string;
  to_status?: string;
  
  // For task completion triggers
  task_title_contains?: string;
  task_priority?: string;
  
  // For document upload triggers
  document_type?: string;
  
  // For time-based triggers
  time_of_day?: string; // HH:MM format
  days_of_week?: number[]; // 0-6, Sunday = 0
  
  // General filters
  transaction_type?: string;
  service_tier?: string;
}

export interface WorkflowExecution {
  id: string;
  rule_id: string;
  transaction_id: string;
  status: ExecutionStatus;
  executed_at: string;
  completed_at?: string;
  error_message?: string;
  retry_count: number;
  metadata: Record<string, unknown>;
}

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'retrying';

export interface AutomationAction {
  type: ActionType;
  config: ActionConfig;
}

export type ActionType = 
  | 'create_tasks'
  | 'send_email'
  | 'update_status'
  | 'create_notification'
  | 'schedule_reminder';

export interface ActionConfig {
  // For create_tasks
  template_id?: string;
  
  // For send_email
  email_template_id?: string;
  recipients?: string[];
  
  // For update_status
  new_status?: string;
  
  // For notifications
  message?: string;
  notification_type?: string;
  
  // For reminders
  reminder_date?: string;
  reminder_message?: string;
}

// Database transaction type
export interface Transaction {
  id: string;
  agent_id: string;
  property_address: string;
  status: string;
  transaction_type: string;
  service_tier?: string;
  closing_date?: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

// Database task type
export interface Task {
  id: string;
  transaction_id: string;
  subject: string;
  description?: string;
  status: string;
  priority?: string;
  task_type?: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

// Database document type
export interface Document {
  id: string;
  transaction_id: string;
  filename: string;
  document_type?: string;
  file_size?: number;
  content_type?: string;
  upload_path: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

// Trigger data specific interfaces
export interface StatusChangeTriggerData {
  old_status: string;
  new_status: string;
  trigger_type: 'status_change';
  [key: string]: unknown;
}

export interface TaskCompletionTriggerData {
  task: Task;
  trigger_type: 'task_completed';
  [key: string]: unknown;
}

export interface DocumentUploadTriggerData {
  document: Document;
  trigger_type: 'document_uploaded';
  [key: string]: unknown;
}

export interface DateOffsetTriggerData {
  reference_date: string;
  trigger_type: 'contract_date_offset' | 'closing_date_offset';
  [key: string]: unknown;
}

export interface TimeBasedTriggerData {
  current_time: string;
  trigger_type: 'time_based';
  [key: string]: unknown;
}

export type TriggerDataUnion = 
  | StatusChangeTriggerData
  | TaskCompletionTriggerData 
  | DocumentUploadTriggerData
  | DateOffsetTriggerData
  | TimeBasedTriggerData;

export interface TriggerContext {
  transaction_id: string;
  transaction: Transaction;
  trigger_data: TriggerDataUnion;
  user_id?: string;
}

export interface AutomationAuditLog {
  id: string;
  execution_id: string;
  action: string;
  status: 'success' | 'failed';
  details: Record<string, unknown>;
  error_message?: string;
  created_at: string;
}
