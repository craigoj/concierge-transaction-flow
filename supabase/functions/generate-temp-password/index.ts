
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GenerateTempPasswordSchema = z.object({
  agentId: z.string().uuid(),
  expiresHours: z.number().optional().default(24),
  sendEmail: z.boolean().optional().default(true),
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
      throw new Error("Unauthorized: Only coordinators can generate temporary passwords");
    }

    const requestBody = await req.json();
    const { agentId, expiresHours, sendEmail } = GenerateTempPasswordSchema.parse(requestBody);

    // Get agent information
    const { data: agent, error: agentError } = await supabase
      .from("profiles")
      .select("email, first_name, last_name, role")
      .eq("id", agentId)
      .single();

    if (agentError || !agent) {
      throw new Error("Agent not found");
    }

    if (agent.role !== "agent") {
      throw new Error("Target user is not an agent");
    }

    // Generate temporary password
    const tempPassword = generateSecurePassword();
    const passwordHash = await hashPassword(tempPassword);
    const expiresAt = new Date(Date.now() + expiresHours * 60 * 60 * 1000);

    // Store temporary password
    const { data: tempPasswordRecord, error: tempPasswordError } = await supabase
      .from("temporary_passwords")
      .insert({
        user_id: agentId,
        password_hash: passwordHash,
        expires_at: expiresAt.toISOString(),
        created_by: user.id,
        is_active: true,
      })
      .select()
      .single();

    if (tempPasswordError) {
      throw new Error(`Failed to create temporary password: ${tempPasswordError.message}`);
    }

    // Update user's password in auth.users (requires service role)
    const { error: passwordUpdateError } = await supabase.auth.admin.updateUserById(
      agentId,
      { password: tempPassword }
    );

    if (passwordUpdateError) {
      // Clean up temporary password record if auth update fails
      await supabase
        .from("temporary_passwords")
        .delete()
        .eq("id", tempPasswordRecord.id);
      
      throw new Error(`Failed to set temporary password: ${passwordUpdateError.message}`);
    }

    // Send email with temporary password if requested
    if (sendEmail) {
      try {
        await supabase.functions.invoke('send-enhanced-email', {
          body: {
            recipientId: agentId,
            templateId: await getPasswordResetTemplateId(supabase),
            variables: {
              agent_name: `${agent.first_name} ${agent.last_name}`,
              temporary_password: tempPassword,
              expires_at: expiresAt.toLocaleString(),
              login_url: `${Deno.env.get('FRONTEND_URL') || supabaseUrl}/auth`,
              expires_hours: expiresHours,
            },
            sendImmediately: true,
          }
        });
      } catch (emailError) {
        console.warn("Failed to send password email:", emailError);
        // Don't fail the whole operation if email fails
      }
    }

    // Log the action
    await supabase
      .from("enhanced_activity_logs")
      .insert({
        user_id: user.id,
        target_user_id: agentId,
        action: "temp_password_generated",
        category: "security",
        description: `Temporary password generated for ${agent.first_name} ${agent.last_name}`,
        entity_type: "profile",
        entity_id: agentId,
        metadata: {
          expires_at: expiresAt.toISOString(),
          expires_hours: expiresHours,
          email_sent: sendEmail,
        },
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        temporaryPassword: tempPassword,
        expiresAt: expiresAt.toISOString(),
        message: "Temporary password generated successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in generate-temp-password function:", error);
    
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

// Utility functions
function generateSecurePassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getPasswordResetTemplateId(supabase: any): Promise<string> {
  const { data: template } = await supabase
    .from("enhanced_email_templates")
    .select("id")
    .eq("template_type", "password_reset")
    .eq("is_active", true)
    .single();
  
  return template?.id || null;
}

serve(handler);
