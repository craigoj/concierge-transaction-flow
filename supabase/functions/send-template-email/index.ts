
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  template_id: string;
  recipient_email: string;
  recipient_name: string;
  transaction_id?: string;
  variables?: Record<string, any>;
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

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { template_id, recipient_email, recipient_name, transaction_id, variables }: EmailRequest = await req.json();

    // Fetch the email template
    const { data: template, error: templateError } = await supabaseClient
      .from('email_templates')
      .select('*')
      .eq('id', template_id)
      .single();

    if (templateError || !template) {
      throw new Error('Template not found');
    }

    // Fetch transaction data if transaction_id is provided
    let transactionData = null;
    if (transaction_id) {
      const { data: transaction, error: transactionError } = await supabaseClient
        .from('transactions')
        .select(`
          *,
          agent:agent_id(first_name, last_name, email),
          clients(full_name, email, type)
        `)
        .eq('id', transaction_id)
        .single();

      if (!transactionError && transaction) {
        transactionData = transaction;
      }
    }

    // Prepare template variables
    const templateVariables = {
      agent_name: transactionData?.agent ? `${transactionData.agent.first_name} ${transactionData.agent.last_name}` : '',
      client_name: recipient_name,
      property_address: transactionData?.property_address || '',
      closing_date: transactionData?.closing_date ? new Date(transactionData.closing_date).toLocaleDateString() : '',
      purchase_price: transactionData?.purchase_price ? `$${transactionData.purchase_price.toLocaleString()}` : '',
      transaction_status: transactionData?.status || '',
      ...variables // Allow override of default variables
    };

    // Replace template variables
    let emailSubject = template.subject;
    let emailBody = template.body_html;

    Object.entries(templateVariables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      emailSubject = emailSubject.replace(new RegExp(placeholder, 'g'), value?.toString() || '');
      emailBody = emailBody.replace(new RegExp(placeholder, 'g'), value?.toString() || '');
    });

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "AgentConnect <noreply@agentconnect.com>",
      to: [recipient_email],
      subject: emailSubject,
      html: emailBody,
    });

    console.log('Email sent successfully:', emailResponse);

    // Log the communication in the database
    const { error: logError } = await supabaseClient
      .from('communications')
      .insert({
        transaction_id: transaction_id,
        sender_id: user.id,
        recipient_id: null, // We don't have recipient ID for external emails
        subject: emailSubject,
        content: emailBody,
        type: 'email',
        status: 'sent'
      });

    if (logError) {
      console.error('Error logging communication:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        email_id: emailResponse.data?.id,
        message: 'Email sent successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Send template email error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
