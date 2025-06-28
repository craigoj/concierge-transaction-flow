
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { ruleId, context } = await req.json();

    console.log('Executing automation rule:', ruleId, 'with context:', context);

    // Get the automation rule
    const { data: rule, error: ruleError } = await supabaseClient
      .from('automation_rules')
      .select('*')
      .eq('id', ruleId)
      .eq('is_active', true)
      .single();

    if (ruleError || !rule) {
      throw new Error(`Automation rule not found or inactive: ${ruleId}`);
    }

    // Create execution record
    const { data: execution, error: executionError } = await supabaseClient
      .from('workflow_executions')
      .insert({
        rule_id: ruleId,
        transaction_id: context.transaction_id,
        status: 'running',
        metadata: {
          rule_name: rule.name,
          trigger_context: context.trigger_data,
          started_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (executionError) {
      throw executionError;
    }

    try {
      // Apply the workflow template
      const { data: workflowInstance, error: applyError } = await supabaseClient
        .rpc('apply_workflow_template', {
          p_transaction_id: context.transaction_id,
          p_template_id: rule.template_id,
          p_applied_by: context.user_id || null
        });

      if (applyError) {
        throw applyError;
      }

      // Create notification for the transaction agent
      const { data: transaction } = await supabaseClient
        .from('transactions')
        .select('agent_id, property_address')
        .eq('id', context.transaction_id)
        .single();

      if (transaction) {
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: transaction.agent_id,
            transaction_id: context.transaction_id,
            message: `Workflow "${rule.name}" has been automatically applied to ${transaction.property_address}`,
            is_read: false
          });
      }

      // Update execution status to completed
      await supabaseClient
        .from('workflow_executions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          metadata: {
            ...execution.metadata,
            workflow_instance_id: workflowInstance,
            completed_at: new Date().toISOString()
          }
        })
        .eq('id', execution.id);

      // Log successful execution
      await supabaseClient
        .from('automation_audit_logs')
        .insert({
          execution_id: execution.id,
          action: 'workflow_applied',
          status: 'success',
          details: {
            template_id: rule.template_id,
            workflow_instance_id: workflowInstance,
            rule_name: rule.name
          }
        });

      return new Response(
        JSON.stringify({
          success: true,
          execution_id: execution.id,
          workflow_instance_id: workflowInstance
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } catch (error) {
      console.error('Error executing automation:', error);

      // Update execution status to failed
      await supabaseClient
        .from('workflow_executions')
        .update({
          status: 'failed',
          error_message: error.message,
          metadata: {
            ...execution.metadata,
            failed_at: new Date().toISOString(),
            error: error.message
          }
        })
        .eq('id', execution.id);

      // Log failed execution
      await supabaseClient
        .from('automation_audit_logs')
        .insert({
          execution_id: execution.id,
          action: 'execution_failed',
          status: 'failed',
          details: {
            error: error.message,
            rule_name: rule.name
          },
          error_message: error.message
        });

      throw error;
    }

  } catch (error) {
    console.error('Error in execute-automation function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
