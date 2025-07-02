
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

    console.log("Starting comprehensive agent deletion for:", agentId);

    // Step 1: Delete all related records first (in order to avoid foreign key constraints)
    console.log("Deleting agent-related records...");
    
    // Delete agent vendors
    await supabaseAdmin.from('agent_vendors').delete().eq('agent_id', agentId);
    
    // Delete agent branding
    await supabaseAdmin.from('agent_branding').delete().eq('agent_id', agentId);
    
    // Delete agent intake sessions
    await supabaseAdmin.from('agent_intake_sessions').delete().eq('agent_id', agentId);
    
    // Delete offer requests
    await supabaseAdmin.from('offer_requests').delete().eq('agent_id', agentId);
    
    // Delete agent invitations
    await supabaseAdmin.from('agent_invitations').delete().eq('agent_id', agentId);
    
    // Delete communication logs where user_id matches
    await supabaseAdmin.from('communication_logs').delete().eq('user_id', agentId);
    
    // Delete communication history
    await supabaseAdmin.from('communication_history').delete().eq('user_id', agentId);
    await supabaseAdmin.from('communication_history').delete().eq('recipient_id', agentId);
    
    // Delete activity logs
    await supabaseAdmin.from('activity_logs').delete().eq('user_id', agentId);
    await supabaseAdmin.from('enhanced_activity_logs').delete().eq('user_id', agentId);
    await supabaseAdmin.from('enhanced_activity_logs').delete().eq('target_user_id', agentId);
    
    // Delete notifications
    await supabaseAdmin.from('notifications').delete().eq('user_id', agentId);
    
    // Delete communication settings
    await supabaseAdmin.from('communication_settings').delete().eq('user_id', agentId);
    
    // Delete notification preferences
    await supabaseAdmin.from('notification_preferences').delete().eq('user_id', agentId);
    
    // Delete calendar integrations
    await supabaseAdmin.from('calendar_integrations').delete().eq('user_id', agentId);
    
    // Delete account lockouts
    await supabaseAdmin.from('account_lockouts').delete().eq('user_id', agentId);

    console.log("Deleted all related records");

    // Step 2: Delete the profile
    console.log("Deleting profile...");
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

    console.log("Profile deleted successfully");

    // Step 3: Delete from auth.users (this might fail if user doesn't exist, which is ok)
    console.log("Attempting to delete auth user...");
    try {
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(agentId);
      if (authDeleteError) {
        console.log("Auth user deletion warning (may not exist):", authDeleteError.message);
      } else {
        console.log("Auth user deleted successfully");
      }
    } catch (authError) {
      console.log("Auth user deletion attempt failed (user may not exist):", authError);
    }

    // Log the successful deletion
    await supabaseAdmin.from('enhanced_activity_logs').insert({
      user_id: user.id,
      target_user_id: agentId,
      action: 'agent_deletion',
      category: 'agent_management',
      description: 'Agent account completely deleted',
      entity_type: 'profile',
      entity_id: agentId,
      metadata: {
        deleted_by: user.id,
        deletion_method: 'coordinator_delete'
      }
    });

    console.log("Agent deletion completed successfully");

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Agent and all related data deleted successfully"
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
