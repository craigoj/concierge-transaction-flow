
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

    console.log("Calling create_manual_agent database function...");
    console.log("Parameters:", {
      p_email: email,
      p_first_name: firstName,
      p_last_name: lastName,
      p_phone: phoneNumber || null,
      p_brokerage: brokerage || null,
      p_password: password || null,
      p_created_by: user.id
    });

    // Call the database function to create the agent
    const { data: functionResult, error: functionError } = await supabaseAdmin.rpc('create_manual_agent', {
      p_email: email,
      p_first_name: firstName,
      p_last_name: lastName,
      p_phone: phoneNumber || null,
      p_brokerage: brokerage || null,
      p_password: password || null,
      p_created_by: user.id
    });

    if (functionError) {
      console.error("Database function error:", functionError);
      console.error("Error details:", {
        message: functionError.message,
        details: functionError.details,
        hint: functionError.hint,
        code: functionError.code
      });
      throw new Error(`Database error: ${functionError.message}`);
    }

    console.log("Database function result:", functionResult);

    if (!functionResult || !functionResult.success) {
      console.error("Function returned failure:", functionResult);
      throw new Error(functionResult?.message || "Failed to create agent");
    }

    console.log("Agent created successfully:", {
      agentId: functionResult.agent_id,
      email: functionResult.email
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          agent_id: functionResult.agent_id,
          email: functionResult.email,
          temporary_password: functionResult.temporary_password,
          message: functionResult.message
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
