
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GenerateSetupLinkSchema = z.object({
  agentId: z.string().uuid(),
  expiresHours: z.number().optional().default(24),
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
      throw new Error("Unauthorized: Only coordinators can generate setup links");
    }

    const requestBody = await req.json();
    const { agentId, expiresHours } = GenerateSetupLinkSchema.parse(requestBody);

    // Generate setup link token
    const setupToken = await supabase.rpc('generate_agent_setup_link', {
      p_agent_id: agentId,
      p_expires_hours: expiresHours
    });

    if (setupToken.error) {
      throw new Error(`Failed to generate setup link: ${setupToken.error.message}`);
    }

    const setupLink = `${Deno.env.get('FRONTEND_URL') || supabaseUrl}/agent/setup/${setupToken.data}`;

    // Log the action
    await supabase
      .from("activity_logs")
      .insert({
        user_id: user.id,
        action: "generate_setup_link",
        description: `Generated setup link for agent`,
        entity_type: "profile",
        entity_id: agentId,
        metadata: {
          expires_hours: expiresHours,
          setup_token: setupToken.data,
        },
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        setupLink,
        setupToken: setupToken.data,
        expiresAt: new Date(Date.now() + expiresHours * 60 * 60 * 1000).toISOString(),
        message: "Setup link generated successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in generate-setup-link function:", error);
    
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
