
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TemplateRequest {
  action: 'create' | 'update' | 'delete' | 'list';
  templateData?: any;
  templateId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { action, templateData, templateId }: TemplateRequest = await req.json();

    let result;

    switch (action) {
      case 'create': {
        const { data, error } = await supabaseClient
          .from('workflow_templates')
          .insert(templateData)
          .select()
          .single();
        
        if (error) throw error;
        result = { success: true, data };
        break;
      }
      
      case 'update': {
        if (!templateId) {
          throw new Error('Template ID is required for update');
        }
        
        const { data, error } = await supabaseClient
          .from('workflow_templates')
          .update(templateData)
          .eq('id', templateId)
          .select()
          .single();
        
        if (error) throw error;
        result = { success: true, data };
        break;
      }
      
      case 'delete': {
        if (!templateId) {
          throw new Error('Template ID is required for delete');
        }
        
        const { error } = await supabaseClient
          .from('workflow_templates')
          .delete()
          .eq('id', templateId);
        
        if (error) throw error;
        result = { success: true };
        break;
      }
      
      case 'list': {
        const { data, error } = await supabaseClient
          .from('workflow_templates')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        result = { success: true, data };
        break;
      }
      
      default: {
        throw new Error(`Unknown action: ${action}`);
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Template manager error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
