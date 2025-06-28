
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
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
const EmailRequestSchema = z.object({
  template_id: z.string().uuid(),
  recipient_email: z.string().email(),
  recipient_name: z.string().min(1).max(100),
  transaction_id: z.string().uuid().optional(),
  variables: z.record(z.any()).optional(),
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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey || !resendApiKey) {
      throw new Error('Missing required environment variables');
    }

    const resend = new Resend(resendApiKey);
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    });

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate request body
    const requestBody = await req.json();
    const { template_id, recipient_email, recipient_name, transaction_id, variables } = EmailRequestSchema.parse(requestBody);

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

    // Log the communication in the database
    const { error: logError } = await supabaseClient
      .from('communications')
      .insert({
        transaction_id: transaction_id,
        sender_id: user.id,
        recipient_id: null,
        subject: emailSubject,
        content: emailBody,
        type: 'email',
        status: 'sent'
      });

    if (logError) {
      console.error('Error logging communication:', logError);
    }

    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Template email sent successfully in ${duration}ms:`, emailResponse);

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
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] Send template email error (${duration}ms):`, {
      error: error.message,
      stack: error.stack,
      ip: clientIP
    });
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: error.message.includes("Rate limit") ? 429 : 
               error.message.includes("Not authenticated") ? 401 :
               error.message.includes("not found") ? 404 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
