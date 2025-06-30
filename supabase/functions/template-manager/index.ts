
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.NODE_ENV === 'production' ? "https://your-domain.com" : "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100;
const RATE_WINDOW = 60 * 1000;

// Input validation schemas
const TemplateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  subject: z.string().min(1).max(200),
  body_html: z.string().min(1),
  category: z.string().max(50).optional(),
});

const TemplateRequestSchema = z.object({
  action: z.enum(['create', 'read', 'update', 'delete']),
  template: TemplateSchema.optional(),
  template_id: z.string().uuid().optional(),
});

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  return true;
}

serve(async (req) => {
  const startTime = Date.now();
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  
  console.log(`[${new Date().toISOString()}] ${req.method} request from IP: ${clientIP}`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    if (!checkRateLimit(clientIP)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded" }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing required environment variables');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    });

    // Get the current user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is a coordinator
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'coordinator') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Coordinator access required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate request body
    const requestBody = await req.json();
    const { action, template, template_id } = TemplateRequestSchema.parse(requestBody);

    let result;

    switch (action) {
      case 'create':
        if (!template) {
          throw new Error('Template data required for create action');
        }
        
        const { data: newTemplate, error: createError } = await supabaseClient
          .from('email_templates')
          .insert({
            ...template,
            created_by: user.id,
          })
          .select()
          .single();

        if (createError) throw createError;
        result = { template: newTemplate };
        break;

      case 'read':
        const { data: templates, error: readError } = await supabaseClient
          .from('email_templates')
          .select('*')
          .order('created_at', { ascending: false });

        if (readError) throw readError;
        result = { templates };
        break;

      case 'update':
        if (!template?.id) {
          throw new Error('Template ID required for update action');
        }

        const { data: updatedTemplate, error: updateError } = await supabaseClient
          .from('email_templates')
          .update({
            name: template.name,
            subject: template.subject,
            body_html: template.body_html,
            category: template.category,
            updated_at: new Date().toISOString(),
          })
          .eq('id', template.id)
          .select()
          .single();

        if (updateError) throw updateError;
        result = { template: updatedTemplate };
        break;

      case 'delete':
        if (!template_id) {
          throw new Error('Template ID required for delete action');
        }

        const { error: deleteError } = await supabaseClient
          .from('email_templates')
          .delete()
          .eq('id', template_id);

        if (deleteError) throw deleteError;
        result = { success: true };
        break;

      default:
        throw new Error('Invalid action specified');
    }

    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Template manager action '${action}' completed in ${duration}ms`);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] Template manager error (${duration}ms):`, {
      error: error.message,
      stack: error.stack,
      ip: clientIP
    });
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: error.message.includes("Rate limit") ? 429 : 
               error.message.includes("Not authenticated") ? 401 :
               error.message.includes("Unauthorized") ? 403 :
               error.message.includes("required") ? 400 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
