
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Running automation scheduler...');

    // Get all active transactions
    const { data: transactions, error: transactionsError } = await supabaseClient
      .from('transactions')
      .select('*')
      .in('status', ['intake', 'active']);

    if (transactionsError) {
      throw transactionsError;
    }

    // Get all active time-based and date-based automation rules
    const { data: rules, error: rulesError } = await supabaseClient
      .from('automation_rules')
      .select('*')
      .eq('is_active', true)
      .in('trigger_event', ['contract_date_offset', 'closing_date_offset', 'time_based']);

    if (rulesError) {
      throw rulesError;
    }

    console.log(`Found ${transactions?.length || 0} transactions and ${rules?.length || 0} time-based rules`);

    let triggeredCount = 0;

    // Process each transaction against each rule
    for (const transaction of transactions || []) {
      for (const rule of rules || []) {
        const condition = rule.trigger_condition as any;
        let shouldTrigger = false;

        // Check if rule should trigger based on type
        if (rule.trigger_event === 'contract_date_offset' && transaction.created_at) {
          shouldTrigger = checkDateOffset(
            transaction.created_at,
            condition.offset_days || 0,
            condition.offset_type || 'after'
          );
        } else if (rule.trigger_event === 'closing_date_offset' && transaction.closing_date) {
          shouldTrigger = checkDateOffset(
            transaction.closing_date,
            condition.offset_days || 0,
            condition.offset_type || 'after'
          );
        } else if (rule.trigger_event === 'time_based') {
          shouldTrigger = checkTimeBased(condition);
        }

        if (shouldTrigger) {
          // Check if we already executed this rule for this transaction today
          const today = new Date().toISOString().split('T')[0];
          const { data: existingExecution } = await supabaseClient
            .from('workflow_executions')
            .select('id')
            .eq('rule_id', rule.id)
            .eq('transaction_id', transaction.id)
            .gte('executed_at', `${today}T00:00:00Z`)
            .lt('executed_at', `${today}T23:59:59Z`)
            .single();

          if (!existingExecution) {
            console.log(`Triggering rule ${rule.name} for transaction ${transaction.id}`);
            
            // Execute the automation
            await supabaseClient.functions.invoke('execute-automation', {
              body: {
                ruleId: rule.id,
                context: {
                  transaction_id: transaction.id,
                  transaction,
                  trigger_data: {
                    trigger_type: rule.trigger_event,
                    scheduled_execution: true,
                    execution_date: new Date().toISOString()
                  }
                }
              }
            });

            triggeredCount++;
          }
        }
      }
    }

    console.log(`Automation scheduler completed. Triggered ${triggeredCount} automations.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${transactions?.length || 0} transactions against ${rules?.length || 0} rules`,
        triggered_count: triggeredCount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in automation scheduler:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function checkDateOffset(
  referenceDate: string,
  offsetDays: number,
  offsetType: 'before' | 'after'
): boolean {
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

function checkTimeBased(condition: any): boolean {
  const now = new Date();
  
  // Check day of week
  if (condition.days_of_week && condition.days_of_week.length > 0) {
    if (!condition.days_of_week.includes(now.getDay())) {
      return false;
    }
  }

  // Check time of day (with 5-minute window)
  if (condition.time_of_day) {
    const [hours, minutes] = condition.time_of_day.split(':').map(Number);
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);
    
    // Check if current time is within 5 minutes of target time
    const timeDiff = Math.abs(now.getTime() - targetTime.getTime());
    return timeDiff < 300000; // 5 minutes tolerance
  }

  return true;
}
