
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables:", { supabaseUrl: !!supabaseUrl, supabaseServiceKey: !!supabaseServiceKey });
      throw new Error("Missing required environment variables");
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      throw new Error("Authorization header required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Authentication failed:", authError);
      throw new Error("Invalid authentication");
    }

    console.log("Authenticated user:", user.email);

    // Verify the user is a coordinator
    const { data: coordinatorProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile lookup error:", profileError);
      throw new Error("Failed to verify user role");
    }

    if (coordinatorProfile?.role !== "coordinator") {
      console.error("User role:", coordinatorProfile?.role);
      throw new Error("Unauthorized: Only coordinators can create agents");
    }

    const requestBody = await req.json();
    console.log("Request body:", requestBody);
    
    const { email, firstName, lastName, phoneNumber, brokerage, password } = requestBody;

    if (!email || !firstName || !lastName) {
      throw new Error("Email, first name, and last name are required");
    }

    // Check if user already exists using admin client
    const { data: existingUsers, error: lookupError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (lookupError) {
      console.error("User lookup error:", lookupError);
      throw new Error("Failed to check existing users");
    }

    const existingUser = existingUsers.users.find(u => u.email === email);
    let newUserId;
    
    if (existingUser) {
      console.log("User already exists:", email);
      newUserId = existingUser.id;
    } else {
      // Create new user using admin client
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password || 'temporaryPassword123!',
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          phone: phoneNumber,
          brokerage: brokerage,
          role: 'agent'
        }
      });

      if (createError) {
        console.error("User creation error:", createError);
        throw new Error(`Failed to create user: ${createError.message}`);
      }

      newUserId = newUser.user.id;
      console.log("New user created:", newUserId);
    }

    // Update or create profile using admin client
    const { data: profileData, error: profileUpsertError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: newUserId,
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber || null,
        brokerage: brokerage || null,
        role: 'agent',
        manual_setup: true,
        setup_method: 'manual_creation',
        admin_activated: true,
        onboarding_method: 'assisted_setup',
        invitation_status: 'completed',
        invited_by: user.id,
        invited_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (profileUpsertError) {
      console.error("Profile upsert error:", profileUpsertError);
      throw new Error(`Failed to create profile: ${profileUpsertError.message}`);
    }

    // Create invitation record using admin client
    const { error: invitationError } = await supabaseAdmin
      .from('agent_invitations')
      .insert({
        invited_by: user.id,
        agent_id: newUserId,
        email: email,
        status: 'accepted',
        creation_method: 'manual_creation',
        invited_at: new Date().toISOString(),
        accepted_at: new Date().toISOString(),
        invitation_token: 'manual-' + newUserId
      });

    if (invitationError) {
      console.error("Invitation creation error:", invitationError);
      // Don't throw here as this is not critical
    }

    console.log("Agent created successfully:", { newUserId, email });

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          agent_id: newUserId,
          email: email,
          message: "Agent created successfully"
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in create-manual-agent function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: "Check function logs for more information"
      }),
      {
        status: error.message.includes("Unauthorized") ? 403 : 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
