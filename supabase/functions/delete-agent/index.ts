
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("=== DELETE AGENT FUNCTION START ===");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables");
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

    // Parse request body
    const { agentId } = await req.json();

    if (!agentId) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Agent ID is required"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

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

    // Verify coordinator role
    const { data: coordinatorProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || coordinatorProfile?.role !== "coordinator") {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Access denied: Only coordinators can delete agents"
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Deleting agent:", agentId);

    // Delete from auth.users first
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(agentId);
    
    if (authDeleteError) {
      console.error("Auth user deletion error:", authDeleteError);
      // Continue with profile deletion even if auth deletion fails
    }

    // Delete profile (this should cascade to related tables)
    const { error: profileDeleteError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', agentId);

    if (profileDeleteError) {
      console.error("Profile deletion error:", profileDeleteError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Failed to delete profile: ${profileDeleteError.message}`
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Clean up related records
    await supabaseAdmin.from('agent_invitations').delete().eq('agent_id', agentId);

    console.log("Agent deletion completed successfully");

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Agent deleted successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
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
