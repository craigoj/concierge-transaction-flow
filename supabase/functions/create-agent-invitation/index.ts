
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateAgentRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  brokerage?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const { firstName, lastName, email, phoneNumber, brokerage }: CreateAgentRequest = await req.json();

    // Get the current user (coordinator)
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

    // Generate invitation token
    const invitationToken = crypto.randomUUID();
    
    // Create the agent user account with a temporary password
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
        role: "agent"
      }
    });

    if (createUserError || !newUser.user) {
      throw new Error(`Failed to create user: ${createUserError?.message}`);
    }

    // Update the profile with invitation details
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
      throw new Error(`Failed to update profile: ${updateProfileError.message}`);
    }

    // Create invitation record
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

    // Send welcome email
    const setupUrl = `${Deno.env.get("SITE_URL") || "https://app.theagentconcierge.com"}/agent/setup/${invitationToken}`;
    
    const emailResponse = await resend.emails.send({
      from: "The Agent Concierge <noreply@theagentconcierge.com>",
      to: [email],
      subject: "Your Invitation to The Agent Concierge Portal is Ready",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Montserrat', Arial, sans-serif; margin: 0; padding: 0; background-color: #faf9f7; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: #2c2c2c; padding: 40px 30px; text-align: center; }
            .logo { color: white; font-size: 24px; font-weight: 600; letter-spacing: 2px; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 24px; color: #2c2c2c; margin-bottom: 20px; font-family: 'Libre Baskerville', serif; }
            .message { font-size: 16px; line-height: 1.6; color: #6b6b6b; margin-bottom: 30px; }
            .cta-button { 
              display: inline-block; 
              background: #2c2c2c; 
              color: white; 
              padding: 16px 32px; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: 600;
              font-size: 16px;
              letter-spacing: 1px;
            }
            .footer { padding: 30px; text-align: center; color: #999; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">THE AGENT CONCIERGE</div>
            </div>
            <div class="content">
              <div class="greeting">Hello ${firstName},</div>
              <div class="message">
                Eileen has personally created your secure client portal. This will be your central hub for tracking all transaction progress, managing documents, and communicating with us seamlessly.
                <br><br>
                To access your account for the first time, please set up your password.
              </div>
              <a href="${setupUrl}" class="cta-button">Set Your Password</a>
            </div>
            <div class="footer">
              © 2024 The Agent Concierge Co. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Agent invitation created successfully:", {
      agentId: newUser.user.id,
      email,
      invitationToken,
      emailResponse: emailResponse.id
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        agentId: newUser.user.id,
        email,
        emailSent: !!emailResponse.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in create-agent-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
