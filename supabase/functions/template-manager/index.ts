
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TemplateRequest {
  action: 'create' | 'read' | 'update' | 'delete';
  template?: {
    id?: string;
    name: string;
    subject: string;
    body_html: string;
    category?: string;
  };
  template_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

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

    const { action, template, template_id }: TemplateRequest = await req.json();

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

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Template manager error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
