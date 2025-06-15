
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

    console.log(`Starting XML import for file: ${filename}`);

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

    if (importError) {
      console.error('Failed to create import record:', importError);
      throw importError;
    }

    console.log(`Created import record: ${importRecord.id}`);

    let templatesImported = 0;
    let tasksImported = 0;
    let emailsImported = 0;

    try {
      // Parse XML content with enhanced error handling
      console.log('Parsing XML content...');
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, "application/xml");
      
      // Check for parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error(`XML parsing failed: ${parserError.textContent}`);
      }
      
      const taskTemplates = xmlDoc.querySelectorAll('taskTemplate');
      console.log(`Found ${taskTemplates.length} task templates to process`);

      if (taskTemplates.length === 0) {
        throw new Error("No task templates found in XML file");
      }

      for (const [templateIndex, templateElement] of Array.from(taskTemplates).entries()) {
        try {
          const folderName = templateElement.getAttribute('folderName') || '';
          const name = templateElement.querySelector('name')?.textContent || '';
          const description = templateElement.querySelector('description')?.textContent || '';
          const templateType = templateElement.querySelector('taskTemplateType')?.textContent || 'XACTION';

          console.log(`Processing template ${templateIndex + 1}/${taskTemplates.length}: ${name}`);

          if (!name.trim()) {
            console.warn(`Skipping template ${templateIndex + 1}: No name found`);
            continue;
          }

          // Map template type to our enum
          let mappedType = 'General';
          if (name.toLowerCase().includes('listing') || name.toLowerCase().includes('seller')) {
            mappedType = 'Listing';
          } else if (name.toLowerCase().includes('buyer') || name.toLowerCase().includes('purchase')) {
            mappedType = 'Buyer';
          }

          // Check for duplicate template names
          const { data: existingTemplate } = await supabaseClient
            .from('workflow_templates')
            .select('id')
            .eq('name', name)
            .single();

          if (existingTemplate) {
            console.warn(`Template "${name}" already exists, skipping...`);
            continue;
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

          if (templateError) {
            console.error(`Failed to create template "${name}":`, templateError);
            throw templateError;
          }

          templatesImported++;
          console.log(`Created template: ${name} (ID: ${workflowTemplate.id})`);

          // Process template entries (tasks)
          const templateEntries = templateElement.querySelectorAll('taskTemplateEntry');
          console.log(`Processing ${templateEntries.length} tasks for template: ${name}`);
          
          for (const [index, entryElement] of Array.from(templateEntries).entries()) {
            try {
              const entry = parseTemplateEntry(entryElement);
              
              if (!entry.subject.trim()) {
                console.warn(`Skipping task ${index + 1} in template "${name}": No subject`);
                continue;
              }

              // Create due date rule
              const dueDateRule = createDueDateRule(entry);

              // Handle email template if present
              let emailTemplateId = null;
              if (entry.letterTemplate && entry.letterTemplate.name.trim()) {
                try {
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
                    console.log(`Created email template: ${entry.letterTemplate.name}`);
                  } else {
                    console.warn(`Failed to create email template "${entry.letterTemplate.name}":`, emailError);
                  }
                } catch (emailErr) {
                  console.warn(`Error creating email template for task "${entry.subject}":`, emailErr);
                }
              }

              // Create template task with all enhanced properties
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

              if (taskError) {
                console.error(`Failed to create task "${entry.subject}":`, taskError);
                throw taskError;
              }

              tasksImported++;
            } catch (taskErr) {
              console.error(`Error processing task ${index + 1} in template "${name}":`, taskErr);
              // Continue with other tasks instead of failing the entire import
            }
          }

          console.log(`Completed template: ${name} (${templateEntries.length} tasks processed)`);
        } catch (templateErr) {
          console.error(`Error processing template ${templateIndex + 1}:`, templateErr);
          // Continue with other templates instead of failing the entire import
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

      console.log(`Import completed successfully: ${templatesImported} templates, ${tasksImported} tasks, ${emailsImported} emails`);

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
      console.error('Processing error:', processingError);
      
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
      JSON.stringify({ 
        success: false,
        error: error.message,
        templatesImported: 0,
        tasksImported: 0,
        emailsImported: 0
      }),
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
    taskType: getText('taskType') || 'TODO',
    subject: getText('subject'),
    note: getText('note'),
    dueDateAdjustActive: getBool('dueDateAdjustActive'),
    dueDateAdjustDelta: getNum('dueDateAdjustDelta'),
    dueDateAdjustType: getText('dueDateAdjustType') || 'TEMPLATE_START_DATE',
    autoFillWithRole: getText('autoFillWithRole'),
    agentVisible: getBool('agentVisible'),
    buyerSellerVisible: getBool('buyerSellerVisible'),
    isOnCalendar: getBool('isOnCalendar'),
    milestone: getBool('milestone'),
    reminderSet: getBool('reminderSet'),
    reminderDelta: getNum('reminderDelta'),
    reminderTimeMinutes: getNum('reminderTimeMinutes') || 540,
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
