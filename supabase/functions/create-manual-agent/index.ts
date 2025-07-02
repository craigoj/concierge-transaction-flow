
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("=== CREATE MANUAL AGENT FUNCTION START ===");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Server configuration error"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Authorization required"
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Authentication failed"
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Role verification
    const { data: coordinatorProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || coordinatorProfile?.role !== "coordinator") {
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

    // Parse request body
    const requestBody = await req.json();
    const { email, firstName, lastName, phoneNumber, brokerage, password } = requestBody;

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

    // Generate temporary password if none provided
    const tempPassword = password || Array.from(
      crypto.getRandomValues(new Uint8Array(12)), 
      b => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[b % 62]
    ).join('');

    console.log("Creating new auth user...");
    
    // Create new user with admin privileges and ACTIVATE immediately
    const { data: createUserResult, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone: phoneNumber,
        brokerage: brokerage,
        role: 'agent'
      }
    });

    if (createUserError || !createUserResult.user) {
      console.error("Failed to create auth user:", createUserError);
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

    const newUserId = createUserResult.user.id;
    console.log("New user created with ID:", newUserId);

    // Create profile with ACTIVE status
    const { error: profileInsertError } = await supabaseAdmin
      .from('profiles')
      .insert({
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
        invitation_status: 'completed', // Set as completed/active
        invited_by: user.id,
        invited_at: new Date().toISOString(),
        onboarding_completed_at: new Date().toISOString() // Mark as fully onboarded
      });

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

    // Create invitation record
    await supabaseAdmin
      .from('agent_invitations')
      .insert({
        invited_by: user.id,
        agent_id: newUserId,
        email: email,
        status: 'accepted', // Mark as accepted since it's manual creation
        creation_method: 'manual_creation',
        invited_at: new Date().toISOString(),
        accepted_at: new Date().toISOString(),
        invitation_token: `manual-${newUserId}`
      });

    console.log("=== AGENT CREATED AND ACTIVATED SUCCESSFULLY ===");

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          agent_id: newUserId,
          email: email,
          temporary_password: tempPassword,
          message: 'Agent created and activated successfully'
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("=== CRITICAL ERROR ===", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "An unexpected server error occurred"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
