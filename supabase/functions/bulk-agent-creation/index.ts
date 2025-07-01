
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BulkAgentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  brokerage: z.string().optional(),
  setupMethod: z.enum(["email_invitation", "manual_creation"]).default("email_invitation"),
});

const BulkCreationSchema = z.object({
  agents: z.array(BulkAgentSchema),
  sendEmails: z.boolean().default(true),
  defaultPassword: z.string().optional(),
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
      throw new Error("Unauthorized: Only coordinators can bulk create agents");
    }

    const requestBody = await req.json();
    const { agents, sendEmails, defaultPassword } = BulkCreationSchema.parse(requestBody);

    const results = [];
    const errors = [];

    for (const agent of agents) {
      try {
        if (agent.setupMethod === "manual_creation") {
          // Use manual creation function
          const { data: response, error } = await supabase.rpc('create_manual_agent', {
            p_email: agent.email,
            p_first_name: agent.firstName,
            p_last_name: agent.lastName,
            p_phone: agent.phoneNumber || null,
            p_brokerage: agent.brokerage || null,
            p_password: defaultPassword || null,
            p_created_by: user.id,
          });

          if (error) throw error;

          results.push({
            email: agent.email,
            status: 'success',
            method: 'manual_creation',
            agentId: (response as any).agent_id,
          });
        } else {
          // Use email invitation method
          const invitationToken = crypto.randomUUID();
          const tempPassword = crypto.randomUUID();
          
          const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
            email: agent.email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
              first_name: agent.firstName,
              last_name: agent.lastName,
              phone: agent.phoneNumber,
              brokerage: agent.brokerage,
              role: 'agent'
            }
          });

          if (createUserError || !newUser.user) {
            throw new Error(`Failed to create user: ${createUserError?.message}`);
          }

          // Update profile
          await supabase
            .from("profiles")
            .update({
              invitation_status: "sent",
              invitation_token: invitationToken,
              invited_at: new Date().toISOString(),
              invited_by: user.id
            })
            .eq("id", newUser.user.id);

          // Create invitation record
          await supabase
            .from("agent_invitations")
            .insert({
              invited_by: user.id,
              agent_id: newUser.user.id,
              email: agent.email,
              invitation_token: invitationToken,
              status: "sent"
            });

          results.push({
            email: agent.email,
            status: 'success',
            method: 'email_invitation',
            agentId: newUser.user.id,
          });
        }
      } catch (error: any) {
        errors.push({
          email: agent.email,
          error: error.message,
        });
      }
    }

    // Log the bulk operation
    await supabase
      .from("activity_logs")
      .insert({
        user_id: user.id,
        action: "bulk_agent_creation",
        description: `Bulk created ${results.length} agents, ${errors.length} errors`,
        entity_type: "profile",
        entity_id: user.id,
        metadata: {
          total_agents: agents.length,
          successful: results.length,
          errors: errors.length,
          send_emails: sendEmails,
        },
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        errors,
        summary: {
          total: agents.length,
          successful: results.length,
          failed: errors.length,
        },
        message: `Bulk creation completed: ${results.length} successful, ${errors.length} failed`
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in bulk-agent-creation function:", error);
    
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
