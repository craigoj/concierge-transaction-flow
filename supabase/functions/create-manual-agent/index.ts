
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
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Server configuration error - missing environment variables"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Environment variables OK");

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log("Supabase admin client created");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Authorization header required - please log in"
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("Validating authentication token...");
    
    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Authentication failed - please log in again"
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Authenticated user:", user.email);

    // Verify the user is a coordinator
    console.log("Checking user role...");
    const { data: coordinatorProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role, first_name, last_name")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile lookup error:", profileError.message);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Unable to verify user permissions"
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

    console.log("User is authorized as coordinator");

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Invalid request body - must be valid JSON"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Request body parsed successfully");
    
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

    console.log("Input validation passed");

    // Generate temporary password if none provided
    const tempPassword = password || Array.from(
      crypto.getRandomValues(new Uint8Array(12)), 
      b => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[b % 62]
    ).join('');

    console.log("Password generated/received");

    // Check if user already exists
    console.log("Checking if user already exists...");
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error("Error listing users:", listError.message);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Unable to check existing users"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const existingUser = existingUsers?.users?.find(u => u.email === email);
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
        console.error("Failed to create auth user:", createUserError?.message);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: `Failed to create user account: ${createUserError?.message || 'Unknown error'}`
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
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (profileInsertError) {
      console.error("Profile creation error:", profileInsertError.message);
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

    console.log("Profile created/updated successfully");

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
      console.error("Invitation creation error:", invitationError.message);
      // Don't fail the whole operation for invitation record creation
    } else {
      console.log("Invitation record created successfully");
    }

    // Log the activity
    console.log("Logging activity...");
    const { error: activityError } = await supabaseAdmin
      .from('enhanced_activity_logs')
      .insert({
        user_id: user.id,
        target_user_id: newUserId,
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
      console.error("Activity logging error:", activityError.message);
      // Don't fail the whole operation for logging errors
    } else {
      console.log("Activity logged successfully");
    }

    console.log("Agent creation completed successfully!");

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
    console.error("=== CRITICAL ERROR in create-manual-agent function ===");
    console.error("Error type:", typeof error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "An unexpected server error occurred",
        details: "Please check the function logs for detailed error information"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
