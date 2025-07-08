
import { supabase } from '@/integrations/supabase/client';
import { automationEngine } from './AutomationEngine';
import type { 
  TriggerContext, 
  Transaction,
  StatusChangeTriggerData,
  TaskCompletionTriggerData,
  DocumentUploadTriggerData,
  DateOffsetTriggerData,
  TimeBasedTriggerData
} from '@/types/automation';

export class TriggerDetector {
  private static instance: TriggerDetector;

  static getInstance(): TriggerDetector {
    if (!TriggerDetector.instance) {
      TriggerDetector.instance = new TriggerDetector();
    }
    return TriggerDetector.instance;
  }

  async detectStatusChange(
    transactionId: string,
    oldStatus: string,
    newStatus: string,
    userId?: string
  ): Promise<void> {
    try {
      console.log(`Status change detected: ${oldStatus} → ${newStatus} for transaction ${transactionId}`);
      
      const { data: transaction, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error || !transaction) {
        console.error('Transaction not found for status change trigger:', error);
        return;
      }

      const triggerData: StatusChangeTriggerData = {
        old_status: oldStatus,
        new_status: newStatus,
        trigger_type: 'status_change'
      };

      const context: TriggerContext = {
        transaction_id: transactionId,
        transaction: transaction as Transaction,
        trigger_data: triggerData,
        user_id: userId
      };

      await automationEngine.processTriggeredRules(context);
    } catch (error) {
      console.error('Error detecting status change:', error);
    }
  }

  async detectTaskCompletion(
    taskId: string,
    transactionId: string,
    userId?: string
  ): Promise<void> {
    try {
      console.log(`Task completion detected: ${taskId} for transaction ${transactionId}`);
      
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (taskError || !task) {
        console.error('Task not found for completion trigger:', taskError);
        return;
      }

      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (transactionError || !transaction) {
        console.error('Transaction not found for task completion trigger:', transactionError);
        return;
      }

      const triggerData: TaskCompletionTriggerData = {
        task: task as any, // TODO: Create proper Task interface
        trigger_type: 'task_completed'
      };

      const context: TriggerContext = {
        transaction_id: transactionId,
        transaction: transaction as Transaction,
        trigger_data: triggerData,
        user_id: userId
      };

      await automationEngine.processTriggeredRules(context);
    } catch (error) {
      console.error('Error detecting task completion:', error);
    }
  }

  async detectDocumentUpload(
    documentId: string,
    transactionId: string,
    userId?: string
  ): Promise<void> {
    try {
      console.log(`Document upload detected: ${documentId} for transaction ${transactionId}`);
      
      const { data: document, error: documentError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (documentError || !document) {
        console.error('Document not found for upload trigger:', documentError);
        return;
      }

      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (transactionError || !transaction) {
        console.error('Transaction not found for document upload trigger:', transactionError);
        return;
      }

      const triggerData: DocumentUploadTriggerData = {
        document: document as any, // TODO: Create proper Document interface
        trigger_type: 'document_uploaded'
      };

      const context: TriggerContext = {
        transaction_id: transactionId,
        transaction: transaction as Transaction,
        trigger_data: triggerData,
        user_id: userId
      };

      await automationEngine.processTriggeredRules(context);
    } catch (error) {
      console.error('Error detecting document upload:', error);
    }
  }

  async detectDateBasedTriggers(): Promise<void> {
    try {
      console.log('Checking for date-based triggers...');
      
      // Get all active transactions
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .in('status', ['intake', 'active']);

      if (error) {
        console.error('Error fetching transactions for date triggers:', error);
        return;
      }

      for (const transaction of transactions || []) {
        // Check contract date triggers
        await this.checkContractDateTriggers(transaction);
        
        // Check closing date triggers
        await this.checkClosingDateTriggers(transaction);
      }
    } catch (error) {
      console.error('Error detecting date-based triggers:', error);
    }
  }

  private async checkContractDateTriggers(transaction: Transaction): Promise<void> {
    if (!transaction.created_at) return;

    const triggerData: DateOffsetTriggerData = {
      reference_date: transaction.created_at,
      trigger_type: 'contract_date_offset'
    };

    const context: TriggerContext = {
      transaction_id: transaction.id,
      transaction,
      trigger_data: triggerData
    };

    await automationEngine.processTriggeredRules(context);
  }

  private async checkClosingDateTriggers(transaction: Transaction): Promise<void> {
    if (!transaction.closing_date) return;

    const triggerData: DateOffsetTriggerData = {
      reference_date: transaction.closing_date,
      trigger_type: 'closing_date_offset'
    };

    const context: TriggerContext = {
      transaction_id: transaction.id,
      transaction,
      trigger_data: triggerData
    };

    await automationEngine.processTriggeredRules(context);
  }

  async detectTimeBasedTriggers(): Promise<void> {
    try {
      console.log('Checking for time-based triggers...');
      
      // Get all active transactions for time-based processing
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .in('status', ['intake', 'active']);

      if (error) {
        console.error('Error fetching transactions for time triggers:', error);
        return;
      }

      for (const transaction of transactions || []) {
        const triggerData: TimeBasedTriggerData = {
          current_time: new Date().toISOString(),
          trigger_type: 'time_based'
        };

        const context: TriggerContext = {
          transaction_id: transaction.id,
          transaction: transaction as Transaction,
          trigger_data: triggerData
        };

        await automationEngine.processTriggeredRules(context);
      }
    } catch (error) {
      console.error('Error detecting time-based triggers:', error);
    }
  }
}

// Singleton instance
export const triggerDetector = TriggerDetector.getInstance();
