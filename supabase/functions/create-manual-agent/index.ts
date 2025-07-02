
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("=== CREATE MANUAL AGENT FUNCTION START ===");
  console.log("Request method:", req.method);
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));
  
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Environment variables check
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log("Environment check:", {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      urlValue: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'missing'
    });
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("CRITICAL: Missing environment variables");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Server configuration error - missing environment variables",
          debug: { hasUrl: !!supabaseUrl, hasServiceKey: !!supabaseServiceKey }
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create admin client
    console.log("Creating Supabase admin client...");
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log("Supabase admin client created successfully");

    // Authentication check
    const authHeader = req.headers.get("Authorization");
    console.log("Auth header present:", !!authHeader);
    
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
    
    console.log("Auth validation result:", {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authError: authError?.message
    });
    
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Authentication failed - please log in again",
          debug: { authError: authError?.message }
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Role verification
    console.log("Checking user role for user:", user.id);
    const { data: coordinatorProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role, first_name, last_name")
      .eq("id", user.id)
      .single();

    console.log("Profile lookup result:", {
      hasProfile: !!coordinatorProfile,
      userRole: coordinatorProfile?.role,
      profileError: profileError?.message
    });

    if (profileError) {
      console.error("Profile lookup error:", profileError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Unable to verify user permissions",
          debug: { profileError: profileError.message }
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (coordinatorProfile?.role !== "coordinator") {
      console.error("Access denied - user role:", coordinatorProfile?.role);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Access denied: Only coordinators can create agents",
          debug: { userRole: coordinatorProfile?.role }
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Parse request body
    console.log("Parsing request body...");
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log("Raw request body:", bodyText);
      requestBody = JSON.parse(bodyText);
      console.log("Parsed request body:", requestBody);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Invalid request body - must be valid JSON",
          debug: { parseError: parseError.message }
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    const { email, firstName, lastName, phoneNumber, brokerage, password } = requestBody;
    console.log("Request data validation:", {
      hasEmail: !!email,
      hasFirstName: !!firstName,
      hasLastName: !!lastName,
      hasPhoneNumber: !!phoneNumber,
      hasBrokerage: !!brokerage,
      hasPassword: !!password
    });

    // Validate required fields
    if (!email || !firstName || !lastName) {
      console.error("Missing required fields");
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
      console.error("Invalid email format:", email);
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

    console.log("Password handling:", { hasProvidedPassword: !!password, generatedLength: tempPassword.length });

    // Check if user already exists in auth.users
    console.log("Checking if user already exists...");
    let listUsersResult;
    try {
      listUsersResult = await supabaseAdmin.auth.admin.listUsers();
      console.log("List users result:", {
        hasData: !!listUsersResult.data,
        userCount: listUsersResult.data?.users?.length || 0,
        hasError: !!listUsersResult.error
      });
    } catch (listError) {
      console.error("Error listing users:", listError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Unable to check existing users",
          debug: { listError: listError.message }
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    if (listUsersResult.error) {
      console.error("Error listing users:", listUsersResult.error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Unable to check existing users",
          debug: { listError: listUsersResult.error.message }
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const existingUser = listUsersResult.data?.users?.find(u => u.email === email);
    let newUserId: string;

    if (existingUser) {
      console.log("User already exists:", existingUser.id);
      newUserId = existingUser.id;
      
      // Update existing user's password
      console.log("Updating existing user password...");
      try {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          { password: tempPassword }
        );
        
        if (updateError) {
          console.error("Failed to update user password:", updateError);
        } else {
          console.log("User password updated successfully");
        }
      } catch (updateException) {
        console.error("Exception updating user password:", updateException);
      }
    } else {
      console.log("Creating new auth user...");
      
      // Create new user with admin privileges
      let createUserResult;
      try {
        createUserResult = await supabaseAdmin.auth.admin.createUser({
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
        
        console.log("Create user result:", {
          hasData: !!createUserResult.data,
          hasUser: !!createUserResult.data?.user,
          userId: createUserResult.data?.user?.id,
          hasError: !!createUserResult.error
        });
      } catch (createException) {
        console.error("Exception creating user:", createException);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: `Failed to create user account: ${createException.message}`,
            debug: { createException: createException.message }
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      if (createUserResult.error || !createUserResult.data?.user) {
        console.error("Failed to create auth user:", createUserResult.error);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: `Failed to create user account: ${createUserResult.error?.message || 'Unknown error'}`,
            debug: { createError: createUserResult.error }
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      newUserId = createUserResult.data.user.id;
      console.log("New user created with ID:", newUserId);
    }

    // Create or update profile
    console.log("Creating/updating profile...");
    let profileResult;
    try {
      profileResult = await supabaseAdmin
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
          invited_at: new Date().toISOString(),
          onboarding_completed_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        .select()
        .single();
        
      console.log("Profile upsert result:", {
        hasData: !!profileResult.data,
        hasError: !!profileResult.error,
        errorMessage: profileResult.error?.message
      });
    } catch (profileException) {
      console.error("Profile creation exception:", profileException);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Failed to create profile: ${profileException.message}`,
          debug: { profileException: profileException.message }
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (profileResult.error) {
      console.error("Profile creation error:", profileResult.error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Failed to create profile: ${profileResult.error.message}`,
          debug: { profileError: profileResult.error }
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
    let invitationResult;
    try {
      invitationResult = await supabaseAdmin
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
        
      console.log("Invitation insert result:", {
        hasError: !!invitationResult.error,
        errorMessage: invitationResult.error?.message
      });
    } catch (invitationException) {
      console.error("Invitation creation exception:", invitationException);
      // Don't fail the whole operation for invitation record creation
    }

    if (invitationResult?.error) {
      console.error("Invitation creation error:", invitationResult.error);
      // Don't fail the whole operation for invitation record creation
    } else {
      console.log("Invitation record created successfully");
    }

    console.log("=== AGENT CREATION COMPLETED SUCCESSFULLY ===");

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
    console.error("Full error object:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "An unexpected server error occurred",
        debug: {
          errorType: typeof error,
          errorMessage: error.message,
          errorStack: error.stack?.substring(0, 500) // Truncate stack trace
        }
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
