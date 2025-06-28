
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.NODE_ENV === 'production' ? "https://your-domain.com" : "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
}

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100;
const RATE_WINDOW = 60 * 1000;

// Input validation
const SendEmailSchema = z.object({
  templateName: z.string().min(1).max(100),
  recipientEmail: z.string().email(),
  recipientName: z.string().min(1).max(100),
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
    return new Response('ok', { headers: corsHeaders })
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
        },
      )
    }

    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey || !resendApiKey) {
      throw new Error('Missing required environment variables');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    });

    // Validate request body
    const requestBody = await req.json();
    const { templateName, recipientEmail, variables, recipientName } = SendEmailSchema.parse(requestBody);

    // Get email template from database
    const { data: template, error: templateError } = await supabaseClient
      .from('email_templates')
      .select('*')
      .eq('name', templateName)
      .single()

    if (templateError || !template) {
      throw new Error(`Template not found: ${templateName}`)
    }

    // Replace variables in template
    let htmlContent = template.body_html
    let subject = template.subject

    for (const [key, value] of Object.entries(variables || {})) {
      const placeholder = `{{${key}}}`
      htmlContent = htmlContent.replaceAll(placeholder, String(value))
      subject = subject.replaceAll(placeholder, String(value))
    }

    // Send email using Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'The Agent Concierge Co. <noreply@theagentconcierge.co>',
        to: [recipientEmail],
        subject: subject,
        html: htmlContent,
      }),
    })

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text()
      throw new Error(`Resend API error: ${errorText}`)
    }

    const result = await resendResponse.json()
    
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Email sent successfully in ${duration}ms:`, result);

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] Error sending email (${duration}ms):`, {
      error: error.message,
      stack: error.stack,
      ip: clientIP
    });
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message.includes("Rate limit") ? 429 : 
               error.message.includes("not found") ? 404 : 400,
      },
    )
  }
})
