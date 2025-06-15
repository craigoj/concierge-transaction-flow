
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
}

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
    
    const { firstName, lastName, email, phoneNumber, brokerage }: CreateAgentRequest = requestBody;

    // Generate invitation token
    const invitationToken = crypto.randomUUID();
    
    // Create the agent user account with a temporary password
    const tempPassword = crypto.randomUUID();
    
    console.log("Creating user with email:", email);
    
    // Create user with role in metadata to prevent trigger function errors
    const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone: phoneNumber,
        brokerage,
        role: 'agent' // Add role to prevent trigger function casting error
      }
    });

    console.log("User creation result:", !!newUser.user, "Error:", createUserError);

    if (createUserError || !newUser.user) {
      throw new Error(`Failed to create user: ${createUserError?.message}`);
    }

    // Update the profile with invitation details (role should already be set by trigger)
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
      // Don't throw here as the user was created successfully
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
      // Don't throw here as the user was created successfully
    }

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
