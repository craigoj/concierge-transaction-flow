
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SendEmailSchema = z.object({
  recipientId: z.string().uuid(),
  templateId: z.string().uuid(),
  variables: z.record(z.any()).optional().default({}),
  sendImmediately: z.boolean().optional().default(true),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Invalid authentication");
    }

    const requestBody = await req.json();
    const { recipientId, templateId, variables, sendImmediately } = SendEmailSchema.parse(requestBody);

    // Get email template
    const { data: template, error: templateError } = await supabase
      .from("enhanced_email_templates")
      .select("*")
      .eq("id", templateId)
      .eq("is_active", true)
      .single();

    if (templateError || !template) {
      throw new Error("Email template not found or inactive");
    }

    // Get recipient information
    const { data: recipient, error: recipientError } = await supabase
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", recipientId)
      .single();

    if (recipientError || !recipient) {
      throw new Error("Recipient not found");
    }

    // Process template variables
    let processedSubject = template.subject;
    let processedBody = template.body_html;

    // Replace variables in template
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), String(value));
      processedBody = processedBody.replace(new RegExp(placeholder, 'g'), String(value));
    });

    // Add default variables
    const defaultVariables = {
      recipient_name: `${recipient.first_name} ${recipient.last_name}`,
      agent_name: `${recipient.first_name} ${recipient.last_name}`,
      current_date: new Date().toLocaleDateString(),
      support_email: "support@example.com", // Configure this
      dashboard_url: `${Deno.env.get('FRONTEND_URL') || supabaseUrl}/agent/dashboard`,
    };

    Object.entries(defaultVariables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), String(value));
      processedBody = processedBody.replace(new RegExp(placeholder, 'g'), String(value));
    });

    if (sendImmediately) {
      // Send email via Resend
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "noreply@example.com", // Configure this
          to: [recipient.email],
          subject: processedSubject,
          html: processedBody,
        }),
      });

      const emailResult = await emailResponse.json();

      if (!emailResponse.ok) {
        throw new Error(`Failed to send email: ${emailResult.message}`);
      }

      // Log email in communication history
      await supabase
        .from("communication_history")
        .insert({
          user_id: user.id,
          recipient_id: recipientId,
          communication_type: "email",
          template_id: templateId,
          subject: processedSubject,
          content: processedBody,
          status: "sent",
          metadata: {
            email_id: emailResult.id,
            variables: variables,
          },
        });

      return new Response(
        JSON.stringify({ 
          success: true, 
          emailId: emailResult.id,
          message: "Email sent successfully"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } else {
      // Queue email for later sending
      await supabase
        .from("communication_history")
        .insert({
          user_id: user.id,
          recipient_id: recipientId,
          communication_type: "email",
          template_id: templateId,
          subject: processedSubject,
          content: processedBody,
          status: "queued",
          metadata: {
            variables: variables,
            scheduled_for: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes delay
          },
        });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email queued for sending"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  } catch (error: any) {
    console.error("Error in send-enhanced-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Check function logs for more information"
      }),
      {
        status: error.message.includes("not found") ? 404 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
