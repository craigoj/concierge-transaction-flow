
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
      console.error("Missing environment variables:", { 
        supabaseUrl: !!supabaseUrl, 
        supabaseServiceKey: !!supabaseServiceKey 
      });
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
    console.log("Validating authentication token...");
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Authentication failed:", authError);
      throw new Error("Invalid authentication - please log in again");
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
      throw new Error("Failed to verify user permissions");
    }

    console.log("User profile found:", coordinatorProfile);

    if (coordinatorProfile?.role !== "coordinator") {
      console.error("User role:", coordinatorProfile?.role);
      throw new Error("Access denied: Only coordinators can create agents");
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
      throw new Error("Email, first name, and last name are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Please enter a valid email address");
    }

    console.log("Creating agent manually using direct database operations...");

    // Generate temporary password if none provided
    const tempPassword = password || Array.from(crypto.getRandomValues(new Uint8Array(12)), b => 
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[b % 62]
    ).join('');

    console.log("Generated password:", tempPassword ? "Yes" : "No");

    // Check if user already exists in auth.users
    console.log("Checking if user already exists...");
    const { data: existingUser, error: userCheckError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    
    let newUserId: string;

    if (existingUser?.user) {
      console.log("User already exists:", existingUser.user.id);
      newUserId = existingUser.user.id;
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
        throw new Error(`Failed to create user account: ${createUserError?.message}`);
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
      throw new Error(`Failed to create profile: ${profileInsertError.message}`);
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
      throw new Error(`Failed to create invitation record: ${invitationError.message}`);
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
      // Don't fail the whole operation for logging errors, just log it
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
    
    // Determine appropriate status code
    let statusCode = 500;
    if (error.message.includes("Access denied") || error.message.includes("Unauthorized")) {
      statusCode = 403;
    } else if (error.message.includes("required") || error.message.includes("valid email")) {
      statusCode = 400;
    } else if (error.message.includes("Invalid authentication")) {
      statusCode = 401;
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: "Check function logs for more information"
      }),
      {
        status: statusCode,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
