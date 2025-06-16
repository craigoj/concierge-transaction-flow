
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  isResend?: boolean;
}

const sendWelcomeEmail = async (email: string, firstName: string, lastName: string) => {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.log('RESEND_API_KEY not configured, skipping email');
    return;
  }

  try {
    const portalUrl = 'https://0bfc22b0-8528-4f58-aca1-98f16c16dad6.lovableproject.com';
    
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
    // Don't throw here - we don't want email failures to block agent creation
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Request method:", req.method);
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    console.log("Auth header present:", !!authHeader);
    
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    console.log("User authenticated:", !!user, "Auth error:", authError);
    
    if (authError || !user) {
      throw new Error("Invalid authentication");
    }

    // Verify the user is a coordinator
    const { data: coordinatorProfile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    console.log("User role:", coordinatorProfile?.role, "Profile error:", profileError);

    if (profileError || coordinatorProfile?.role !== "coordinator") {
      throw new Error("Unauthorized: Only coordinators can create agent invitations");
    }

    const requestBody = await req.json();
    console.log("Request body:", requestBody);
    
    const { firstName, lastName, email, phoneNumber, brokerage, isResend }: CreateAgentRequest = requestBody;

    if (isResend) {
      // For resend, find existing agent and update invitation details
      console.log("Resending invitation for email:", email);
      
      const { data: existingAgent, error: findError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .eq("role", "agent")
        .single();

      if (findError || !existingAgent) {
        throw new Error("Agent not found for resend");
      }

      // Generate new invitation token
      const invitationToken = crypto.randomUUID();
      
      // Update the profile with new invitation details
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
        console.log("Failed to update profile for resend:", updateProfileError.message);
        throw new Error("Failed to update invitation details");
      }

      // Update invitation record
      const { error: invitationError } = await supabase
        .from("agent_invitations")
        .update({
          invitation_token: invitationToken,
          status: "sent",
          invited_at: new Date().toISOString()
        })
        .eq("agent_id", existingAgent.id);

      if (invitationError) {
        console.log("Failed to update invitation record:", invitationError.message);
        // Don't throw here as the profile was updated successfully
      }

      // Send welcome email for resend
      console.log("Sending welcome email for resend...");
      await sendWelcomeEmail(email, firstName, lastName);

      console.log("Agent invitation resent successfully for agent ID:", existingAgent.id);

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

    // Original create logic for new agents
    const invitationToken = crypto.randomUUID();
    const tempPassword = crypto.randomUUID();
    
    console.log("Creating user with email:", email);
    
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

    console.log("User creation result:", !!newUser.user, "Error:", createUserError);

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

    console.log("Profile update error:", updateProfileError);

    if (updateProfileError) {
      console.log("Failed to update profile:", updateProfileError.message);
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

    console.log("Invitation record error:", invitationError);

    if (invitationError) {
      console.log("Failed to create invitation record:", invitationError.message);
    }

    // Send welcome email for new agent
    console.log("Sending welcome email for new agent...");
    await sendWelcomeEmail(email, firstName, lastName);

    console.log("Agent invitation created successfully:", {
      agentId: newUser.user.id,
      email,
      invitationToken
    });

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
    console.error("Error in create-agent-invitation function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Check function logs for more information"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
