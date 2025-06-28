
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

    const { executionId } = await req.json();

    console.log('Retrying automation execution:', executionId);

    // Get the failed execution
    const { data: execution, error: executionError } = await supabaseClient
      .from('workflow_executions')
      .select('*, automation_rules!inner(*)')
      .eq('id', executionId)
      .eq('status', 'failed')
      .single();

    if (executionError || !execution) {
      throw new Error(`Failed execution not found: ${executionId}`);
    }

    // Check retry count limit (max 3 retries)
    if (execution.retry_count >= 3) {
      throw new Error(`Maximum retry attempts reached for execution: ${executionId}`);
    }

    // Update retry count and status
    const newRetryCount = execution.retry_count + 1;
    await supabaseClient
      .from('workflow_executions')
      .update({
        status: 'retrying',
        retry_count: newRetryCount,
        error_message: null,
        metadata: {
          ...execution.metadata,
          retry_attempt: newRetryCount,
          retried_at: new Date().toISOString()
        }
      })
      .eq('id', executionId);

    // Log retry attempt
    await supabaseClient
      .from('automation_audit_logs')
      .insert({
        execution_id: executionId,
        action: 'retry_attempted',
        status: 'success',
        details: {
          retry_count: newRetryCount,
          original_error: execution.error_message
        }
      });

    try {
      // Re-execute the automation
      const rule = execution.automation_rules;
      const metadata = execution.metadata as any;

      // Apply the workflow template again
      const { data: workflowInstance, error: applyError } = await supabaseClient
        .rpc('apply_workflow_template', {
          p_transaction_id: execution.transaction_id,
          p_template_id: rule.template_id,
          p_applied_by: null
        });

      if (applyError) {
        throw applyError;
      }

      // Update execution status to completed
      await supabaseClient
        .from('workflow_executions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          metadata: {
            ...metadata,
            workflow_instance_id: workflowInstance,
            retry_successful: true,
            completed_at: new Date().toISOString()
          }
        })
        .eq('id', executionId);

      // Log successful retry
      await supabaseClient
        .from('automation_audit_logs')
        .insert({
          execution_id: executionId,
          action: 'retry_successful',
          status: 'success',
          details: {
            retry_count: newRetryCount,
            workflow_instance_id: workflowInstance
          }
        });

      return new Response(
        JSON.stringify({
          success: true,
          execution_id: executionId,
          retry_count: newRetryCount,
          workflow_instance_id: workflowInstance
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } catch (retryError) {
      console.error('Retry failed:', retryError);

      // Update execution status back to failed
      await supabaseClient
        .from('workflow_executions')
        .update({
          status: 'failed',
          error_message: retryError.message,
          metadata: {
            ...execution.metadata,
            retry_failed_at: new Date().toISOString(),
            retry_error: retryError.message
          }
        })
        .eq('id', executionId);

      // Log failed retry
      await supabaseClient
        .from('automation_audit_logs')
        .insert({
          execution_id: executionId,
          action: 'retry_failed',
          status: 'failed',
          details: {
            retry_count: newRetryCount,
            error: retryError.message
          },
          error_message: retryError.message
        });

      throw retryError;
    }

  } catch (error) {
    console.error('Error in retry-automation function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
