
import type { TriggerContext } from '@/types/automation';
import { logger } from '@/lib/logger';
import { RuleMatcher } from './automation/RuleMatcher';
import { ExecutionManager } from './automation/ExecutionManager';

export class AutomationEngine {
  private static instance: AutomationEngine;
  private ruleMatcher = new RuleMatcher();
  private executionManager = new ExecutionManager();

  static getInstance(): AutomationEngine {
    if (!AutomationEngine.instance) {
      AutomationEngine.instance = new AutomationEngine();
    }
    return AutomationEngine.instance;
  }

  async processTriggeredRules(context: TriggerContext): Promise<void> {
    try {
      logger.info('Processing triggered rules for context', {
        transactionId: context.transaction_id,
        triggerData: context.trigger_data,
        context: 'automation_engine'
      });
      
      const matchingRules = await this.ruleMatcher.findMatchingRules(context);
      
      for (const rule of matchingRules) {
        await this.executionManager.executeRule(rule, context);
      }
      
      logger.info('Completed processing triggered rules', {
        transactionId: context.transaction_id,
        processedRules: matchingRules.length,
        context: 'automation_engine'
      });
    } catch (error) {
      logger.error('Error processing triggered rules', {
        error: error instanceof Error ? error.message : 'Unknown error',
        transactionId: context.transaction_id,
        context: 'automation_engine'
      });
      throw error;
    }
  }

}

// Singleton instance
export const automationEngine = AutomationEngine.getInstance();
