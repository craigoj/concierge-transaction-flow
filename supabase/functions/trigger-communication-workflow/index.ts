
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkflowTrigger {
  event: 'task_completed' | 'status_changed' | 'document_signed';
  transaction_id: string;
  entity_id?: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { event, transaction_id, entity_id, metadata }: WorkflowTrigger = await req.json();

    console.log('Workflow trigger received:', { event, transaction_id, entity_id });

    // Find matching automation rules
    const { data: rules, error: rulesError } = await supabaseClient
      .from('automation_rules')
      .select(`
        *,
        template:template_id(*)
      `)
      .eq('trigger_event', event)
      .eq('is_active', true);

    if (rulesError) {
      throw rulesError;
    }

    if (!rules || rules.length === 0) {
      console.log('No matching automation rules found');
      return new Response(
        JSON.stringify({ message: 'No matching rules found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch transaction data
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('transactions')
      .select(`
        *,
        agent:agent_id(first_name, last_name, email),
        clients(full_name, email, type)
      `)
      .eq('id', transaction_id)
      .single();

    if (transactionError || !transaction) {
      throw new Error('Transaction not found');
    }

    const results = [];

    // Process each matching rule
    for (const rule of rules) {
      try {
        console.log('Processing rule:', rule.name);

        // Create workflow execution record
        const { data: execution, error: executionError } = await supabaseClient
          .from('workflow_executions')
          .insert({
            rule_id: rule.id,
            transaction_id: transaction_id,
            status: 'pending',
            metadata: { event, entity_id, ...metadata }
          })
          .select()
          .single();

        if (executionError) {
          throw executionError;
        }

        // Determine recipients based on the transaction
        const recipients = [];
        
        // Add agent
        if (transaction.agent?.email) {
          recipients.push({
            email: transaction.agent.email,
            name: `${transaction.agent.first_name} ${transaction.agent.last_name}`
          });
        }

        // Add clients
        transaction.clients?.forEach(client => {
          if (client.email) {
            recipients.push({
              email: client.email,
              name: client.full_name
            });
          }
        });

        console.log('Recipients:', recipients);

        // Send emails to all recipients
        for (const recipient of recipients) {
          try {
            const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-template-email`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                template_id: rule.template_id,
                recipient_email: recipient.email,
                recipient_name: recipient.name,
                transaction_id: transaction_id,
                variables: metadata
              })
            });

            if (!emailResponse.ok) {
              throw new Error(`Failed to send email to ${recipient.email}`);
            }

            console.log(`Email sent to ${recipient.email}`);
          } catch (emailError) {
            console.error(`Error sending email to ${recipient.email}:`, emailError);
          }
        }

        // Update execution status
        await supabaseClient
          .from('workflow_executions')
          .update({
            status: 'success',
            metadata: { 
              ...execution.metadata, 
              recipients_count: recipients.length 
            }
          })
          .eq('id', execution.id);

        results.push({
          rule_id: rule.id,
          rule_name: rule.name,
          status: 'success',
          recipients_count: recipients.length
        });

      } catch (ruleError) {
        console.error(`Error processing rule ${rule.name}:`, ruleError);
        
        // Update execution status with error
        await supabaseClient
          .from('workflow_executions')
          .update({
            status: 'failed',
            error_message: ruleError.message
          })
          .eq('rule_id', rule.id)
          .eq('transaction_id', transaction_id);

        results.push({
          rule_id: rule.id,
          rule_name: rule.name,
          status: 'failed',
          error: ruleError.message
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed_rules: results.length,
        results 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Workflow trigger error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
