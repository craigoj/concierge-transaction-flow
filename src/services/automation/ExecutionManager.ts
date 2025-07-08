import { supabase } from '@/integrations/supabase/client';
import type { 
  AutomationRule, 
  TriggerContext, 
  WorkflowExecution,
  ExecutionStatus,
  TriggerEvent
} from '@/types/automation';
import { logger } from '@/lib/logger';
import { auditData } from '@/lib/audit-logging';

export class ExecutionManager {
  private retryAttempts = 3;
  private retryDelay = 1000; // 1 second

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

      // Audit log successful execution
      auditData.update(
        context.user_id || 'system',
        'workflow_execution',
        execution.id,
        {
          rule_name: rule.name,
          template_id: rule.template_id,
          workflow_instance_id: workflowInstance,
          transaction_id: context.transaction_id
        }
      );

      logger.info('Automation rule executed successfully', {
        ruleId: rule.id,
        ruleName: rule.name,
        executionId: execution.id,
        transactionId: context.transaction_id,
        context: 'automation_engine'
      });

    } catch (error) {
      logger.error('Error executing automation rule', {
        error: error instanceof Error ? error.message : 'Unknown error',
        ruleId: rule.id,
        ruleName: rule.name,
        executionId: execution?.id,
        transactionId: context.transaction_id,
        context: 'automation_engine'
      });
      
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

  async updateExecutionStatus(
    executionId: string, 
    status: ExecutionStatus,
    errorMessage?: string
  ): Promise<void> {
    const updateData: {
      status: ExecutionStatus;
      completed_at?: string;
      error_message?: string;
    } = { status };
    
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

      logger.warn('Scheduling execution retry', {
        executionId: execution.id,
        retryCount,
        error: error.message,
        context: 'automation_engine'
      });

      // Schedule retry (in a real implementation, you'd use a job queue)
      setTimeout(() => {
        this.retryExecution(execution.id);
      }, this.retryDelay * retryCount);

    } else {
      // Mark as failed
      await this.updateExecutionStatus(execution.id, 'failed', error.message);
      
      logger.error('Execution failed after retries', {
        executionId: execution.id,
        retryCount,
        error: error.message,
        context: 'automation_engine'
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
        trigger_data: (execution.metadata as Record<string, unknown>)?.trigger_context || {}
      };

      await this.executeRule(rule, context);

    } catch (error) {
      logger.error('Error retrying execution', {
        error: error instanceof Error ? error.message : 'Unknown error',
        executionId,
        context: 'automation_engine'
      });
      
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
        logger.error('Error creating notification', {
          error: notificationError.message,
          ruleId: rule.id,
          executionId: execution.id,
          context: 'automation_engine'
        });
      } else {
        logger.info('Notification sent for automation rule', {
          ruleId: rule.id,
          ruleName: rule.name,
          recipient: context.transaction.agent_id,
          context: 'automation_engine'
        });
      }

    } catch (error) {
      logger.error('Error sending notifications', {
        error: error instanceof Error ? error.message : 'Unknown error',
        ruleId: rule.id,
        executionId: execution.id,
        context: 'automation_engine'
      });
    }
  }
}