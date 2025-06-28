
import { supabase } from '@/integrations/supabase/client';
import type { 
  AutomationRule, 
  TriggerCondition, 
  TriggerContext, 
  WorkflowExecution,
  AutomationAction,
  ActionType,
  ExecutionStatus,
  TriggerEvent
} from '@/types/automation';

export class AutomationEngine {
  private static instance: AutomationEngine;
  private retryAttempts = 3;
  private retryDelay = 1000; // 1 second

  static getInstance(): AutomationEngine {
    if (!AutomationEngine.instance) {
      AutomationEngine.instance = new AutomationEngine();
    }
    return AutomationEngine.instance;
  }

  async processTriggeredRules(context: TriggerContext): Promise<void> {
    try {
      console.log('Processing triggered rules for context:', context);
      
      const matchingRules = await this.findMatchingRules(context);
      
      for (const rule of matchingRules) {
        await this.executeRule(rule, context);
      }
    } catch (error) {
      console.error('Error processing triggered rules:', error);
      throw error;
    }
  }

  private async findMatchingRules(context: TriggerContext): Promise<AutomationRule[]> {
    const { data: rawRules, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    const matchingRules: AutomationRule[] = [];

    for (const rawRule of rawRules || []) {
      // Transform database response to match TypeScript interface
      const rule: AutomationRule = {
        ...rawRule,
        trigger_event: rawRule.trigger_event as TriggerEvent,
        trigger_condition: typeof rawRule.trigger_condition === 'string' 
          ? JSON.parse(rawRule.trigger_condition) 
          : rawRule.trigger_condition || {}
      };

      if (await this.evaluateTriggerCondition(rule.trigger_condition, context)) {
        matchingRules.push(rule);
      }
    }

    return matchingRules;
  }

  private async evaluateTriggerCondition(
    condition: TriggerCondition, 
    context: TriggerContext
  ): Promise<boolean> {
    const { transaction, trigger_data } = context;

    try {
      switch (condition.type) {
        case 'contract_date_offset':
          return this.evaluateDateOffset(
            transaction.created_at,
            condition.offset_days || 0,
            condition.offset_type || 'after'
          );

        case 'closing_date_offset':
          return this.evaluateDateOffset(
            transaction.closing_date,
            condition.offset_days || 0,
            condition.offset_type || 'after'
          );

        case 'status_change':
          return this.evaluateStatusChange(
            trigger_data.old_status,
            trigger_data.new_status,
            condition.from_status,
            condition.to_status
          );

        case 'task_completed':
          return this.evaluateTaskCompletion(trigger_data, condition);

        case 'document_uploaded':
          return this.evaluateDocumentUpload(trigger_data, condition);

        case 'time_based':
          return this.evaluateTimeBased(condition);

        default:
          console.warn('Unknown trigger condition type:', condition.type);
          return false;
      }
    } catch (error) {
      console.error('Error evaluating trigger condition:', error);
      return false;
    }
  }

  private evaluateDateOffset(
    referenceDate: string | null,
    offsetDays: number,
    offsetType: 'before' | 'after'
  ): boolean {
    if (!referenceDate) return false;

    const refDate = new Date(referenceDate);
    const today = new Date();
    const targetDate = new Date(refDate);

    if (offsetType === 'after') {
      targetDate.setDate(refDate.getDate() + offsetDays);
    } else {
      targetDate.setDate(refDate.getDate() - offsetDays);
    }

    // Check if today matches the target date (within the same day)
    return today.toDateString() === targetDate.toDateString();
  }

  private evaluateStatusChange(
    oldStatus: string,
    newStatus: string,
    fromStatus?: string,
    toStatus?: string
  ): boolean {
    const fromMatches = !fromStatus || oldStatus === fromStatus;
    const toMatches = !toStatus || newStatus === toStatus;
    return fromMatches && toMatches;
  }

  private evaluateTaskCompletion(
    triggerData: Record<string, any>,
    condition: TriggerCondition
  ): boolean {
    if (!triggerData.task) return false;

    const task = triggerData.task;
    
    if (condition.task_title_contains) {
      const titleMatches = task.title
        ?.toLowerCase()
        .includes(condition.task_title_contains.toLowerCase());
      if (!titleMatches) return false;
    }

    if (condition.task_priority) {
      if (task.priority !== condition.task_priority) return false;
    }

    return task.is_completed === true;
  }

  private evaluateDocumentUpload(
    triggerData: Record<string, any>,
    condition: TriggerCondition
  ): boolean {
    if (!triggerData.document) return false;

    const document = triggerData.document;

    if (condition.document_type) {
      // This would need to be implemented based on how document types are stored
      return document.file_name?.toLowerCase().includes(condition.document_type.toLowerCase());
    }

    return true;
  }

  private evaluateTimeBased(condition: TriggerCondition): boolean {
    const now = new Date();
    
    if (condition.days_of_week && condition.days_of_week.length > 0) {
      if (!condition.days_of_week.includes(now.getDay())) {
        return false;
      }
    }

    if (condition.time_of_day) {
      const [hours, minutes] = condition.time_of_day.split(':').map(Number);
      const targetTime = new Date();
      targetTime.setHours(hours, minutes, 0, 0);
      
      // Check if current time is within 1 minute of target time
      const timeDiff = Math.abs(now.getTime() - targetTime.getTime());
      return timeDiff < 60000; // 1 minute tolerance
    }

    return true;
  }

  async executeRule(rule: AutomationRule, context: TriggerContext): Promise<void> {
    let execution: WorkflowExecution | null = null;

    try {
      // Create execution record
      execution = await this.createExecution(rule, context);
      
      // Update status to running
      await this.updateExecutionStatus(execution.id, 'running');

      // Get the workflow template
      const { data: template, error: templateError } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('id', rule.template_id)
        .single();

      if (templateError || !template) {
        throw new Error(`Template not found: ${rule.template_id}`);
      }

      // Apply the workflow template
      const { data: workflowInstance, error: applyError } = await supabase
        .rpc('apply_workflow_template', {
          p_transaction_id: context.transaction_id,
          p_template_id: rule.template_id,
          p_applied_by: context.user_id || null
        });

      if (applyError) {
        throw applyError;
      }

      // Send notifications
      await this.sendNotifications(rule, context, execution);

      // Update execution status to completed
      await this.updateExecutionStatus(execution.id, 'completed');

      // Log successful execution
      await this.logAuditEvent(execution.id, 'workflow_applied', 'success', {
        template_id: rule.template_id,
        workflow_instance_id: workflowInstance
      });

    } catch (error) {
      console.error('Error executing rule:', error);
      
      if (execution) {
        await this.handleExecutionError(execution, error as Error);
      }
      
      throw error;
    }
  }

  private async createExecution(
    rule: AutomationRule, 
    context: TriggerContext
  ): Promise<WorkflowExecution> {
    const { data, error } = await supabase
      .from('workflow_executions')
      .insert({
        rule_id: rule.id,
        transaction_id: context.transaction_id,
        status: 'pending',
        retry_count: 0,
        metadata: {
          rule_name: rule.name,
          trigger_context: context.trigger_data
        }
      })
      .select()
      .single();

    if (error) throw error;
    
    // Transform to match our interface
    return {
      ...data,
      status: data.status as ExecutionStatus,
      retry_count: data.retry_count || 0,
      metadata: typeof data.metadata === 'string' 
        ? JSON.parse(data.metadata) 
        : data.metadata || {}
    };
  }

  private async updateExecutionStatus(
    executionId: string, 
    status: ExecutionStatus,
    errorMessage?: string
  ): Promise<void> {
    const updateData: any = { status };
    
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }
    
    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    const { error } = await supabase
      .from('workflow_executions')
      .update(updateData)
      .eq('id', executionId);

    if (error) throw error;
  }

  private async handleExecutionError(
    execution: WorkflowExecution, 
    error: Error
  ): Promise<void> {
    const retryCount = execution.retry_count + 1;
    
    if (retryCount < this.retryAttempts) {
      // Schedule retry
      await supabase
        .from('workflow_executions')
        .update({
          status: 'retrying',
          retry_count: retryCount,
          error_message: error.message
        })
        .eq('id', execution.id);

      // Log retry attempt
      await this.logAuditEvent(execution.id, 'retry_scheduled', 'success', {
        retry_count: retryCount,
        error: error.message
      });

      // Schedule retry (in a real implementation, you'd use a job queue)
      setTimeout(() => {
        this.retryExecution(execution.id);
      }, this.retryDelay * retryCount);

    } else {
      // Mark as failed
      await this.updateExecutionStatus(execution.id, 'failed', error.message);
      
      // Log failure
      await this.logAuditEvent(execution.id, 'execution_failed', 'failed', {
        error: error.message,
        retry_count: retryCount
      });
    }
  }

  private async retryExecution(executionId: string): Promise<void> {
    try {
      const { data: rawExecution, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('id', executionId)
        .single();

      if (error || !rawExecution) {
        throw new Error('Execution not found for retry');
      }

      // Transform execution data
      const execution: WorkflowExecution = {
        ...rawExecution,
        status: rawExecution.status as ExecutionStatus,
        retry_count: rawExecution.retry_count || 0,
        metadata: typeof rawExecution.metadata === 'string' 
          ? JSON.parse(rawExecution.metadata) 
          : rawExecution.metadata || {}
      };

      const { data: rawRule, error: ruleError } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('id', execution.rule_id)
        .single();

      if (ruleError || !rawRule) {
        throw new Error('Rule not found for retry');
      }

      // Transform rule data
      const rule: AutomationRule = {
        ...rawRule,
        trigger_event: rawRule.trigger_event as TriggerEvent,
        trigger_condition: typeof rawRule.trigger_condition === 'string' 
          ? JSON.parse(rawRule.trigger_condition) 
          : rawRule.trigger_condition || {}
      };

      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', execution.transaction_id)
        .single();

      if (transactionError || !transaction) {
        throw new Error('Transaction not found for retry');
      }

      const context: TriggerContext = {
        transaction_id: execution.transaction_id,
        transaction,
        trigger_data: (execution.metadata as any)?.trigger_context || {}
      };

      await this.executeRule(rule, context);

    } catch (error) {
      console.error('Error retrying execution:', error);
      // Get the current execution data again for retry count
      const { data: currentExecution } = await supabase
        .from('workflow_executions')
        .select('retry_count')
        .eq('id', executionId)
        .single();
      
      const executionForError: WorkflowExecution = {
        id: executionId,
        rule_id: '',
        transaction_id: '',
        status: 'failed',
        executed_at: '',
        retry_count: (currentExecution?.retry_count || 0) + 1,
        metadata: {}
      };
      
      await this.handleExecutionError(executionForError, error as Error);
    }
  }

  private async sendNotifications(
    rule: AutomationRule,
    context: TriggerContext,
    execution: WorkflowExecution
  ): Promise<void> {
    try {
      // Create in-app notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: context.transaction.agent_id,
          transaction_id: context.transaction_id,
          message: `Workflow "${rule.name}" has been automatically applied to transaction ${context.transaction.property_address}`,
          is_read: false
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }

      // Log notification
      await this.logAuditEvent(execution.id, 'notification_sent', 'success', {
        rule_name: rule.name,
        recipient: context.transaction.agent_id
      });

    } catch (error) {
      console.error('Error sending notifications:', error);
      await this.logAuditEvent(execution.id, 'notification_failed', 'failed', {
        error: (error as Error).message
      });
    }
  }

  private async logAuditEvent(
    executionId: string,
    action: string,
    status: 'success' | 'failed',
    details: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('automation_audit_logs')
        .insert({
          execution_id: executionId,
          action,
          status,
          details,
          error_message: status === 'failed' ? details.error : null
        });

      if (error) {
        console.error('Error logging audit event:', error);
      }
    } catch (error) {
      console.error('Error in logAuditEvent:', error);
    }
  }
}

// Singleton instance
export const automationEngine = AutomationEngine.getInstance();
