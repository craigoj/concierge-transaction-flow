
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SendSMSSchema = z.object({
  recipientId: z.string().uuid(),
  message: z.string().min(1).max(1600),
  urgent: z.boolean().optional().default(false),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error("SMS service not configured - missing Twilio credentials");
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

    // Check if user is coordinator
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "coordinator") {
      throw new Error("Unauthorized: Only coordinators can send SMS");
    }

    const requestBody = await req.json();
    const { recipientId, message, urgent } = SendSMSSchema.parse(requestBody);

    // Get recipient information
    const { data: recipient, error: recipientError } = await supabase
      .from("profiles")
      .select("phone_number, first_name, last_name")
      .eq("id", recipientId)
      .single();

    if (recipientError || !recipient) {
      throw new Error("Recipient not found");
    }

    if (!recipient.phone_number) {
      throw new Error("Recipient does not have a phone number");
    }

    // Check SMS settings
    const { data: settings } = await supabase
      .from("communication_settings")
      .select("sms_enabled")
      .eq("user_id", recipientId)
      .single();

    if (settings && !settings.sms_enabled) {
      throw new Error("Recipient has SMS notifications disabled");
    }

    // Format phone number (basic validation)
    const phoneNumber = recipient.phone_number.replace(/\D/g, '');
    const formattedPhone = phoneNumber.length === 10 ? `+1${phoneNumber}` : 
                           phoneNumber.length === 11 && phoneNumber.startsWith('1') ? `+${phoneNumber}` :
                           recipient.phone_number;

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const credentials = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    const smsResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        From: twilioPhoneNumber,
        To: formattedPhone,
        Body: urgent ? `[URGENT] ${message}` : message,
      }),
    });

    const smsResult = await smsResponse.json();

    if (!smsResponse.ok) {
      throw new Error(`Failed to send SMS: ${smsResult.message || 'Unknown error'}`);
    }

    // Log SMS in communication history
    await supabase
      .from("communication_history")
      .insert({
        user_id: user.id,
        recipient_id: recipientId,
        communication_type: "sms",
        subject: urgent ? "Urgent Notification" : "SMS Notification",
        content: message,
        status: "sent",
        metadata: {
          sms_sid: smsResult.sid,
          phone_number: formattedPhone,
          urgent: urgent,
        },
      });

    // Log the action
    await supabase
      .from("enhanced_activity_logs")
      .insert({
        user_id: user.id,
        target_user_id: recipientId,
        action: "sms_sent",
        category: "communication",
        description: `SMS sent to ${recipient.first_name} ${recipient.last_name}${urgent ? ' (URGENT)' : ''}`,
        entity_type: "communication",
        entity_id: recipientId,
        metadata: {
          sms_sid: smsResult.sid,
          message_length: message.length,
          urgent: urgent,
        },
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        smsId: smsResult.sid,
        message: "SMS sent successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-sms function:", error);
    
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
