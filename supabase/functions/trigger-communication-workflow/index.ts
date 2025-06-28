
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.NODE_ENV === 'production' ? "https://your-domain.com" : "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100;
const RATE_WINDOW = 60 * 1000;

// Input validation
const WorkflowTriggerSchema = z.object({
  event: z.enum(['task_completed', 'status_changed', 'document_signed']),
  transaction_id: z.string().uuid(),
  entity_id: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  return true;
}

serve(async (req) => {
  const startTime = Date.now();
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  
  console.log(`[${new Date().toISOString()}] ${req.method} request from IP: ${clientIP}`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    if (!checkRateLimit(clientIP)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded" }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing required environment variables');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    });

    // Validate request body
    const requestBody = await req.json();
    const { event, transaction_id, entity_id, metadata } = WorkflowTriggerSchema.parse(requestBody);

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
            const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-template-email`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseAnonKey}`,
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

    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Workflow trigger completed in ${duration}ms`);

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
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] Workflow trigger error (${duration}ms):`, {
      error: error.message,
      stack: error.stack,
      ip: clientIP
    });
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: error.message.includes("Rate limit") ? 429 : 
               error.message.includes("not found") ? 404 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
