import { supabase } from '@/integrations/supabase/client';
import type { AutomationRule, TriggerContext, TriggerEvent } from '@/types/automation';
import { logger } from '@/lib/logger';
import { TriggerEvaluator } from './TriggerEvaluator';

export class RuleMatcher {
  private triggerEvaluator = new TriggerEvaluator();

  async findMatchingRules(context: TriggerContext): Promise<AutomationRule[]> {
    try {
      const { data: rawRules, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('is_active', true);

      if (error) {
        logger.error('Error fetching automation rules', {
          error: error.message,
          context: 'automation_engine'
        });
        throw error;
      }

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

        if (await this.triggerEvaluator.evaluateTriggerCondition(rule.trigger_condition, context)) {
          matchingRules.push(rule);
          
          logger.debug('Rule matched trigger conditions', {
            ruleId: rule.id,
            ruleName: rule.name,
            triggerEvent: rule.trigger_event,
            transactionId: context.transaction_id,
            context: 'automation_engine'
          });
        }
      }

      logger.info('Rule matching completed', {
        totalRules: rawRules?.length || 0,
        matchingRules: matchingRules.length,
        transactionId: context.transaction_id,
        context: 'automation_engine'
      });

      return matchingRules;
    } catch (error) {
      logger.error('Error in rule matching process', {
        error: error instanceof Error ? error.message : 'Unknown error',
        transactionId: context.transaction_id,
        context: 'automation_engine'
      });
      throw error;
    }
  }
}