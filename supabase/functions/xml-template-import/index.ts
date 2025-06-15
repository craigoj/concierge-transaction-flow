
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface XMLImportRequest {
  xmlContent: string;
  filename: string;
}

interface TaskTemplateEntry {
  taskTemplateEntryId: string;
  taskType: string;
  subject: string;
  note?: string;
  dueDateAdjustActive: boolean;
  dueDateAdjustDelta: number;
  dueDateAdjustType: string;
  autoFillWithRole?: string;
  agentVisible: boolean;
  buyerSellerVisible: boolean;
  isOnCalendar: boolean;
  milestone: boolean;
  reminderSet: boolean;
  reminderDelta: number;
  reminderTimeMinutes: number;
  xactionSideBuyer: boolean;
  xactionSideSeller: boolean;
  xactionSideDual: boolean;
  sort: number;
  letterTemplate?: {
    letterTemplateId: string;
    name: string;
    emailTo: string;
    emailCc: string;
    emailBcc: string;
    emailSubject: string;
    htmlText: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: { user } } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check if user is coordinator
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'coordinator') {
      throw new Error("Only coordinators can import templates");
    }

    const { xmlContent, filename }: XMLImportRequest = await req.json();

    // Create import record
    const { data: importRecord, error: importError } = await supabaseClient
      .from('xml_template_imports')
      .insert({
        filename,
        imported_by: user.id,
        import_status: 'processing'
      })
      .select()
      .single();

    if (importError) throw importError;

    let templatesImported = 0;
    let tasksImported = 0;
    let emailsImported = 0;

    try {
      // Parse XML content
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, "application/xml");
      
      const taskTemplates = xmlDoc.querySelectorAll('taskTemplate');

      for (const templateElement of taskTemplates) {
        const folderName = templateElement.getAttribute('folderName') || '';
        const name = templateElement.querySelector('name')?.textContent || '';
        const description = templateElement.querySelector('description')?.textContent || '';
        const templateType = templateElement.querySelector('taskTemplateType')?.textContent || 'XACTION';

        // Map template type to our enum
        let mappedType = 'General';
        if (name.toLowerCase().includes('listing') || name.toLowerCase().includes('seller')) {
          mappedType = 'Listing';
        } else if (name.toLowerCase().includes('buyer') || name.toLowerCase().includes('purchase')) {
          mappedType = 'Buyer';
        }

        // Create workflow template
        const { data: workflowTemplate, error: templateError } = await supabaseClient
          .from('workflow_templates')
          .insert({
            name,
            type: mappedType,
            description: description || `Imported from ${folderName}`,
            created_by: user.id,
            is_active: true
          })
          .select()
          .single();

        if (templateError) throw templateError;
        templatesImported++;

        // Process template entries (tasks)
        const templateEntries = templateElement.querySelectorAll('taskTemplateEntry');
        
        for (const [index, entryElement] of Array.from(templateEntries).entries()) {
          const entry = parseTemplateEntry(entryElement);
          
          // Create due date rule
          const dueDateRule = createDueDateRule(entry);

          // Handle email template if present
          let emailTemplateId = null;
          if (entry.letterTemplate) {
            const { data: emailTemplate, error: emailError } = await supabaseClient
              .from('email_templates')
              .insert({
                name: entry.letterTemplate.name,
                subject: entry.letterTemplate.emailSubject,
                body_html: entry.letterTemplate.htmlText,
                category: 'Imported Templates',
                created_by: user.id
              })
              .select()
              .single();

            if (!emailError && emailTemplate) {
              emailTemplateId = emailTemplate.id;
              
              // Track imported email template
              await supabaseClient
                .from('imported_email_templates')
                .insert({
                  email_template_id: emailTemplate.id,
                  original_xml_id: entry.letterTemplate.letterTemplateId,
                  folder_name: folderName,
                  email_to: entry.letterTemplate.emailTo,
                  email_cc: entry.letterTemplate.emailCc,
                  email_bcc: entry.letterTemplate.emailBcc,
                  template_type: templateType,
                  import_id: importRecord.id
                });

              emailsImported++;
            }
          }

          // Create template task
          const { error: taskError } = await supabaseClient
            .from('template_tasks')
            .insert({
              template_id: workflowTemplate.id,
              subject: entry.subject,
              description_notes: entry.note || '',
              due_date_rule: dueDateRule,
              sort_order: entry.sort,
              email_template_id: emailTemplateId,
              is_agent_visible: entry.agentVisible,
              task_type: entry.taskType,
              auto_fill_with_role: entry.autoFillWithRole,
              is_on_calendar: entry.isOnCalendar,
              is_milestone: entry.milestone,
              reminder_set: entry.reminderSet,
              reminder_delta: entry.reminderDelta,
              reminder_time_minutes: entry.reminderTimeMinutes,
              xaction_side_buyer: entry.xactionSideBuyer,
              xaction_side_seller: entry.xactionSideSeller,
              xaction_side_dual: entry.xactionSideDual,
              buyer_seller_visible: entry.buyerSellerVisible
            });

          if (taskError) throw taskError;
          tasksImported++;
        }
      }

      // Update import record with success
      await supabaseClient
        .from('xml_template_imports')
        .update({
          import_status: 'completed',
          templates_imported: templatesImported,
          tasks_imported: tasksImported,
          emails_imported: emailsImported,
          completed_at: new Date().toISOString()
        })
        .eq('id', importRecord.id);

      return new Response(
        JSON.stringify({
          success: true,
          templatesImported,
          tasksImported,
          emailsImported,
          importId: importRecord.id
        }),
        {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );

    } catch (processingError) {
      // Update import record with error
      await supabaseClient
        .from('xml_template_imports')
        .update({
          import_status: 'failed',
          error_message: processingError.message,
          templates_imported: templatesImported,
          tasks_imported: tasksImported,
          emails_imported: emailsImported,
          completed_at: new Date().toISOString()
        })
        .eq('id', importRecord.id);

      throw processingError;
    }

  } catch (error: any) {
    console.error("Error in xml-template-import function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function parseTemplateEntry(entryElement: Element): TaskTemplateEntry {
  const getText = (selector: string) => entryElement.querySelector(selector)?.textContent || '';
  const getBool = (selector: string) => getText(selector) === 'true';
  const getNum = (selector: string) => parseInt(getText(selector)) || 0;

  const entry: TaskTemplateEntry = {
    taskTemplateEntryId: getText('taskTemplateEntryId'),
    taskType: getText('taskType'),
    subject: getText('subject'),
    note: getText('note'),
    dueDateAdjustActive: getBool('dueDateAdjustActive'),
    dueDateAdjustDelta: getNum('dueDateAdjustDelta'),
    dueDateAdjustType: getText('dueDateAdjustType'),
    autoFillWithRole: getText('autoFillWithRole'),
    agentVisible: getBool('agentVisible'),
    buyerSellerVisible: getBool('buyerSellerVisible'),
    isOnCalendar: getBool('isOnCalendar'),
    milestone: getBool('milestone'),
    reminderSet: getBool('reminderSet'),
    reminderDelta: getNum('reminderDelta'),
    reminderTimeMinutes: getNum('reminderTimeMinutes'),
    xactionSideBuyer: getBool('xactionSideBuyer'),
    xactionSideSeller: getBool('xactionSideSeller'),
    xactionSideDual: getBool('xactionSideDual'),
    sort: getNum('sort')
  };

  // Parse letter template if present
  const letterTemplate = entryElement.querySelector('letterTemplate');
  if (letterTemplate) {
    entry.letterTemplate = {
      letterTemplateId: letterTemplate.querySelector('letterTemplateId')?.textContent || '',
      name: letterTemplate.querySelector('name')?.textContent || '',
      emailTo: letterTemplate.querySelector('emailTo')?.textContent || '',
      emailCc: letterTemplate.querySelector('emailCc')?.textContent || '',
      emailBcc: letterTemplate.querySelector('emailBcc')?.textContent || '',
      emailSubject: letterTemplate.querySelector('emailSubject')?.textContent || '',
      htmlText: letterTemplate.querySelector('htmlText')?.textContent || ''
    };
  }

  return entry;
}

function createDueDateRule(entry: TaskTemplateEntry) {
  if (!entry.dueDateAdjustActive) {
    return { type: 'no_due_date' };
  }

  switch (entry.dueDateAdjustType) {
    case 'TEMPLATE_START_DATE':
      return {
        type: 'days_from_event',
        event: 'ratified_date',
        days: entry.dueDateAdjustDelta
      };
    case 'CLOSING_DATE':
      return {
        type: 'days_from_event',
        event: 'closing_date',
        days: entry.dueDateAdjustDelta
      };
    default:
      return {
        type: 'days_from_event',
        event: 'ratified_date',
        days: entry.dueDateAdjustDelta
      };
  }
}

serve(handler);
