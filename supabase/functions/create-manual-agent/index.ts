
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
    console.log("=== Create Manual Agent Function Started ===");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables");
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
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Authorization header required"
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("Validating authentication token...");
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Authentication failed:", authError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Invalid authentication - please log in again"
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Authenticated user:", user.email, "User ID:", user.id);

    // Verify the user is a coordinator
    console.log("Checking user role...");
    const { data: coordinatorProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role, first_name, last_name")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile lookup error:", profileError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Failed to verify user permissions"
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("User profile found:", coordinatorProfile);

    if (coordinatorProfile?.role !== "coordinator") {
      console.error("User role:", coordinatorProfile?.role);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Access denied: Only coordinators can create agents"
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const requestBody = await req.json();
    console.log("Request body received:", {
      email: requestBody.email,
      firstName: requestBody.firstName,
      lastName: requestBody.lastName,
      hasPhone: !!requestBody.phoneNumber,
      hasBrokerage: !!requestBody.brokerage,
      hasPassword: !!requestBody.password
    });
    
    const { email, firstName, lastName, phoneNumber, brokerage, password } = requestBody;

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Email, first name, and last name are required"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Please enter a valid email address"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Creating agent manually...");

    // Generate temporary password if none provided
    const tempPassword = password || Array.from(crypto.getRandomValues(new Uint8Array(12)), b => 
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[b % 62]
    ).join('');

    console.log("Generated password:", tempPassword ? "Yes" : "No");

    // Check if user already exists by trying to get user by email
    console.log("Checking if user already exists...");
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    let existingUser = null;
    if (!listError && existingUsers?.users) {
      existingUser = existingUsers.users.find(u => u.email === email);
    }

    let newUserId: string;

    if (existingUser) {
      console.log("User already exists:", existingUser.id);
      newUserId = existingUser.id;
    } else {
      console.log("Creating new auth user...");
      
      // Create new user with admin privileges
      const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true, // Auto-confirm email for manual creation
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          phone: phoneNumber,
          brokerage: brokerage,
          role: 'agent'
        }
      });

      if (createUserError || !newUser.user) {
        console.error("Failed to create auth user:", createUserError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: `Failed to create user account: ${createUserError?.message}`
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      newUserId = newUser.user.id;
      console.log("New user created with ID:", newUserId);
    }

    // Create or update profile
    console.log("Creating/updating profile...");
    const { data: profile, error: profileInsertError } = await supabaseAdmin
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
      })
      .select()
      .single();

    if (profileInsertError) {
      console.error("Profile creation error:", profileInsertError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Failed to create profile: ${profileInsertError.message}`
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Profile created/updated:", profile);

    // Create invitation record
    console.log("Creating invitation record...");
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
        invitation_token: `manual-${newUserId}`
      });

    if (invitationError) {
      console.error("Invitation creation error:", invitationError);
      // Don't fail the whole operation for invitation record creation
    }

    // Log the activity
    console.log("Logging activity...");
    const { error: activityError } = await supabaseAdmin
      .from('enhanced_activity_logs')
      .insert({
        user_id: user.id, // The coordinator creating the agent
        target_user_id: newUserId, // The agent being created
        action: 'manual_agent_creation',
        category: 'agent_management',
        description: `Manually created agent: ${firstName} ${lastName}`,
        entity_type: 'profile',
        entity_id: newUserId,
        metadata: {
          email: email,
          setup_method: 'manual_creation'
        }
      });

    if (activityError) {
      console.error("Activity logging error:", activityError);
      // Don't fail the whole operation for logging errors
    }

    console.log("Agent created successfully!");

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          agent_id: newUserId,
          email: email,
          temporary_password: tempPassword,
          message: 'Agent created manually and activated successfully'
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("=== ERROR in create-manual-agent function ===");
    console.error("Error type:", typeof error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Full error object:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "An unexpected error occurred",
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
