
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ManualSetupSchema = z.object({
  agentId: z.string().uuid(),
  password: z.string().min(8),
  skipOnboarding: z.boolean().default(false),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Invalid authentication");
    }

    // Verify the user is a coordinator
    const { data: coordinatorProfile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || coordinatorProfile?.role !== "coordinator") {
      throw new Error("Unauthorized: Only coordinators can perform manual setup");
    }

    const requestBody = await req.json();
    const { agentId, password, skipOnboarding } = ManualSetupSchema.parse(requestBody);

    // Update agent password using admin API
    const { error: passwordError } = await supabase.auth.admin.updateUserById(
      agentId,
      { password }
    );

    if (passwordError) {
      throw new Error(`Failed to set password: ${passwordError.message}`);
    }

    // Update profile to mark as manually set up
    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({
        manual_setup: true,
        setup_method: "manual_creation",
        admin_activated: true,
        invitation_status: "completed",
        onboarding_completed_at: skipOnboarding ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", agentId);

    if (profileUpdateError) {
      throw new Error(`Failed to update profile: ${profileUpdateError.message}`);
    }

    // Update invitation status
    const { error: invitationError } = await supabase
      .from("agent_invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
        creation_method: "manual_setup",
      })
      .eq("agent_id", agentId);

    if (invitationError) {
      console.warn("Failed to update invitation record:", invitationError);
    }

    // Log the manual setup
    await supabase
      .from("activity_logs")
      .insert({
        user_id: user.id,
        action: "manual_agent_setup",
        description: `Manually set up agent account`,
        entity_type: "profile",
        entity_id: agentId,
        metadata: {
          skip_onboarding: skipOnboarding,
          setup_method: "manual_creation",
        },
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Agent setup completed successfully",
        agentId,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in manual-agent-setup function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Check function logs for more information"
      }),
      {
        status: error.message.includes("Unauthorized") ? 403 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
