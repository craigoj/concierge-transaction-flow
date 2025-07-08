import type { TriggerCondition, TriggerContext } from '@/types/automation';
import { logger } from '@/lib/logger';

export class TriggerEvaluator {
  async evaluateTriggerCondition(
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
          logger.warn('Unknown trigger condition type', {
            conditionType: condition.type,
            context: 'automation_engine'
          });
          return false;
      }
    } catch (error) {
      logger.error('Error evaluating trigger condition', {
        error: error instanceof Error ? error.message : 'Unknown error',
        conditionType: condition.type,
        context: 'automation_engine'
      });
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
}