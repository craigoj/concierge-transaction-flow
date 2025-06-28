
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAutomationTriggers = () => {
  
  const triggerStatusChangeAutomation = useCallback(async (
    transactionId: string,
    oldStatus: string,
    newStatus: string,
    userId?: string
  ) => {
    try {
      console.log(`Triggering status change automation: ${oldStatus} → ${newStatus}`);
      
      const { data: transaction, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error || !transaction) {
        console.error('Transaction not found for automation trigger:', error);
        return;
      }

      // Find matching automation rules for status change
      const { data: rules, error: rulesError } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('is_active', true)
        .eq('trigger_event', 'status_change');

      if (rulesError) {
        console.error('Error fetching automation rules:', rulesError);
        return;
      }

      // Execute matching rules
      for (const rule of rules || []) {
        const condition = rule.trigger_condition as any;
        
        // Check if conditions match
        const fromMatches = !condition.from_status || oldStatus === condition.from_status;
        const toMatches = !condition.to_status || newStatus === condition.to_status;
        
        if (fromMatches && toMatches) {
          await supabase.functions.invoke('execute-automation', {
            body: {
              ruleId: rule.id,
              context: {
                transaction_id: transactionId,
                transaction,
                trigger_data: {
                  old_status: oldStatus,
                  new_status: newStatus,
                  trigger_type: 'status_change'
                },
                user_id: userId
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('Error triggering status change automation:', error);
    }
  }, []);

  const triggerTaskCompletionAutomation = useCallback(async (
    taskId: string,
    transactionId: string,
    userId?: string
  ) => {
    try {
      console.log(`Triggering task completion automation for task: ${taskId}`);
      
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (taskError || !task) {
        console.error('Task not found for automation trigger:', taskError);
        return;
      }

      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (transactionError || !transaction) {
        console.error('Transaction not found for automation trigger:', transactionError);
        return;
      }

      // Find matching automation rules for task completion
      const { data: rules, error: rulesError } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('is_active', true)
        .eq('trigger_event', 'task_completed');

      if (rulesError) {
        console.error('Error fetching automation rules:', rulesError);
        return;
      }

      // Execute matching rules
      for (const rule of rules || []) {
        const condition = rule.trigger_condition as any;
        
        // Check if conditions match
        let shouldTrigger = true;
        
        if (condition.task_title_contains) {
          shouldTrigger = task.title?.toLowerCase().includes(condition.task_title_contains.toLowerCase());
        }
        
        if (shouldTrigger && condition.task_priority) {
          shouldTrigger = task.priority === condition.task_priority;
        }
        
        if (shouldTrigger) {
          await supabase.functions.invoke('execute-automation', {
            body: {
              ruleId: rule.id,
              context: {
                transaction_id: transactionId,
                transaction,
                trigger_data: {
                  task,
                  trigger_type: 'task_completed'
                },
                user_id: userId
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('Error triggering task completion automation:', error);
    }
  }, []);

  const triggerDocumentUploadAutomation = useCallback(async (
    documentId: string,
    transactionId: string,
    userId?: string
  ) => {
    try {
      console.log(`Triggering document upload automation for document: ${documentId}`);
      
      const { data: document, error: documentError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (documentError || !document) {
        console.error('Document not found for automation trigger:', documentError);
        return;
      }

      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (transactionError || !transaction) {
        console.error('Transaction not found for automation trigger:', transactionError);
        return;
      }

      // Find matching automation rules for document upload
      const { data: rules, error: rulesError } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('is_active', true)
        .eq('trigger_event', 'document_uploaded');

      if (rulesError) {
        console.error('Error fetching automation rules:', rulesError);
        return;
      }

      // Execute matching rules
      for (const rule of rules || []) {
        const condition = rule.trigger_condition as any;
        
        // Check if conditions match
        let shouldTrigger = true;
        
        if (condition.document_type) {
          shouldTrigger = document.file_name?.toLowerCase().includes(condition.document_type.toLowerCase());
        }
        
        if (shouldTrigger) {
          await supabase.functions.invoke('execute-automation', {
            body: {
              ruleId: rule.id,
              context: {
                transaction_id: transactionId,
                transaction,
                trigger_data: {
                  document,
                  trigger_type: 'document_uploaded'
                },
                user_id: userId
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('Error triggering document upload automation:', error);
    }
  }, []);

  return {
    triggerStatusChangeAutomation,
    triggerTaskCompletionAutomation,
    triggerDocumentUploadAutomation,
  };
};
