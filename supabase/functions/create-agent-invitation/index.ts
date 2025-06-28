
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.NODE_ENV === 'production' ? "https://your-domain.com" : "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

// Rate limiting storage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds

// Input validation schemas
const CreateAgentSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  brokerage: z.string().optional(),
  isResend: z.boolean().optional().default(false),
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

const sendWelcomeEmail = async (email: string, firstName: string, lastName: string) => {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.log('RESEND_API_KEY not configured, skipping email');
    return;
  }

  try {
    const portalUrl = Deno.env.get('FRONTEND_URL') || Deno.env.get('SUPABASE_URL');
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'The Agent Concierge Co. <noreply@theagentconcierge.co>',
        to: [email],
        subject: 'Welcome to The Agent Concierge Co. - Complete Your Setup',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2c3e50;">Welcome to The Agent Concierge Co.</h1>
            <p>Hi ${firstName} ${lastName},</p>
            <p>Your agent account has been created! You can now access the platform and complete your onboarding.</p>
            <p style="margin: 20px 0;">
              <a href="${portalUrl}/agent/setup" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Complete Your Setup
              </a>
            </p>
            <p>If you have any questions, please don't hesitate to reach out to us.</p>
            <p>Best regards,<br>The Agent Concierge Co. Team</p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      throw new Error(`Resend API error: ${errorText}`);
    }

    const result = await emailResponse.json();
    console.log('Welcome email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

const handler = async (req: Request): Promise<Response> => {
  const startTime = Date.now();
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  
  console.log(`[${new Date().toISOString()}] ${req.method} request from IP: ${clientIP}`);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    if (!checkRateLimit(clientIP)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate required environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
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

    // Verify the user is a coordinator
    const { data: coordinatorProfile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || coordinatorProfile?.role !== "coordinator") {
      throw new Error("Unauthorized: Only coordinators can create agent invitations");
    }

    // Validate request body
    const requestBody = await req.json();
    const validatedData = CreateAgentSchema.parse(requestBody);
    const { firstName, lastName, email, phoneNumber, brokerage, isResend } = validatedData;

    if (isResend) {
      // Handle resend logic
      const { data: existingAgent, error: findError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .eq("role", "agent")
        .single();

      if (findError || !existingAgent) {
        throw new Error("Agent not found for resend");
      }

      const invitationToken = crypto.randomUUID();
      
      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({
          invitation_status: "sent",
          invitation_token: invitationToken,
          invited_at: new Date().toISOString(),
          invited_by: user.id
        })
        .eq("id", existingAgent.id);

      if (updateProfileError) {
        console.error("Failed to update profile for resend:", updateProfileError);
        throw new Error("Failed to update invitation details");
      }

      await supabase
        .from("agent_invitations")
        .update({
          invitation_token: invitationToken,
          status: "sent",
          invited_at: new Date().toISOString()
        })
        .eq("agent_id", existingAgent.id);

      await sendWelcomeEmail(email, firstName, lastName);

      const duration = Date.now() - startTime;
      console.log(`[${new Date().toISOString()}] Request completed successfully in ${duration}ms`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          agentId: existingAgent.id,
          email,
          message: "Agent invitation resent successfully"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create new agent
    const invitationToken = crypto.randomUUID();
    const tempPassword = crypto.randomUUID();
    
    const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone: phoneNumber,
        brokerage,
        role: 'agent'
      }
    });

    if (createUserError || !newUser.user) {
      throw new Error(`Failed to create user: ${createUserError?.message}`);
    }

    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({
        invitation_status: "sent",
        invitation_token: invitationToken,
        invited_at: new Date().toISOString(),
        invited_by: user.id
      })
      .eq("id", newUser.user.id);

    if (updateProfileError) {
      console.error("Failed to update profile:", updateProfileError);
    }

    const { error: invitationError } = await supabase
      .from("agent_invitations")
      .insert({
        invited_by: user.id,
        agent_id: newUser.user.id,
        email,
        invitation_token: invitationToken,
        status: "sent"
      });

    if (invitationError) {
      console.error("Failed to create invitation record:", invitationError);
    }

    await sendWelcomeEmail(email, firstName, lastName);

    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Request completed successfully in ${duration}ms`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        agentId: newUser.user.id,
        email,
        message: "Agent invitation created successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] Error in create-agent-invitation function (${duration}ms):`, {
      error: error.message,
      stack: error.stack,
      ip: clientIP
    });
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Check function logs for more information"
      }),
      {
        status: error.message.includes("Rate limit") ? 429 : 
               error.message.includes("Unauthorized") ? 403 :
               error.message.includes("Invalid authentication") ? 401 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
