import { supabase } from "@/integrations/supabase/client";
import { hamptonRoadsLocations, hamptonRoadsProfessionals, hamptonRoadsClients, hamptonRoadsCommunications, hamptonRoadsDocuments } from "./hamptonRoadsData";
import { hamptonRoadsEmailTemplates, hamptonRoadsWorkflowTemplates } from "./hamptonRoadsTemplates";
import { hamptonRoadsEnhancedClients, hamptonRoadsProfessionalContacts, hamptonRoadsEnhancedCommunications, hamptonRoadsAdvancedWorkflowTemplates } from "./hamptonRoadsEnhancedData";
import { hamptonRoadsAdvancedEmailTemplates as advancedTemplates } from "./hamptonRoadsAdvancedTemplates";

export const generateHamptonRoadsMockData = async () => {
  console.log("Starting Hampton Roads mock data generation...");
  
  try {
    // Get current user for RLS compliance
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("You must be logged in to generate mock data.");
    }

    // Clear existing data first to avoid duplicates
    await clearExistingData();
    
    // 1. Create realistic Hampton Roads transactions
    await createHamptonRoadsTransactions(user.id);
    
    // 2. Create Hampton Roads specific clients (enhanced)
    await createHamptonRoadsEnhancedClients();
    
    // 3. Create professional contacts database
    await createProfessionalContacts();
    
    // 4. Create email templates (standard + advanced)
    await createHamptonRoadsEmailTemplates();
    await createAdvancedEmailTemplates();
    
    // 5. Create workflow templates (standard + advanced)
    await createHamptonRoadsWorkflowTemplates();
    await createAdvancedWorkflowTemplates();
    
    // 6. Create tasks for transactions
    await createHamptonRoadsTasks();
    
    // 7. Create enhanced communication logs
    await createHamptonRoadsEnhancedCommunications(user.id);
    
    // 8. Create document records
    await createHamptonRoadsDocuments(user.id);
    
    // 9. Create notifications
    await createHamptonRoadsNotifications(user.id);

    console.log("Hampton Roads mock data generation completed successfully!");
    return { success: true, message: "Hampton Roads demo data has been created successfully!" };
    
  } catch (error) {
    console.error("Error generating Hampton Roads mock data:", error);
    return { success: false, message: `Error: ${error.message}` };
  }
};

const clearExistingData = async () => {
  console.log("Clearing existing demo data...");
  
  try {
    // Clear in reverse dependency order
    await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('communication_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('template_tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('workflow_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('email_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  } catch (error) {
    console.log("Note: Some data may not exist to clear, continuing...");
  }
};

const createHamptonRoadsTransactions = async (currentUserId: string) => {
  console.log("Creating Hampton Roads transactions...");
  
  const transactions = [];
  
  // White Glove transactions
  hamptonRoadsLocations.whiteGlove.forEach((property, index) => {
    transactions.push({
      property_address: property.address,
      city: property.city,
      state: 'VA',
      zip_code: property.zip,
      purchase_price: property.price,
      closing_date: new Date(Date.now() + (30 + index * 15) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: index < 2 ? 'active' as const : 'intake' as const,
      transaction_type: 'seller' as const,
      service_tier: 'white_glove_listing' as const,
      commission_rate: 2.8 + (index * 0.1),
      agent_id: currentUserId, // Use current user as agent for all transactions
      created_at: new Date(Date.now() - (60 - index * 10) * 24 * 60 * 60 * 1000).toISOString()
    });
  });
  
  // Elite transactions
  hamptonRoadsLocations.elite.forEach((property, index) => {
    const transactionType = index % 3 === 0 ? 'dual' : (index % 2 === 0 ? 'buyer' : 'seller');
    const serviceTier = transactionType === 'buyer' ? 'buyer_elite' : 'listing_elite';
    
    transactions.push({
      property_address: property.address,
      city: property.city,
      state: 'VA',
      zip_code: property.zip,
      purchase_price: property.price,
      closing_date: new Date(Date.now() + (20 + index * 10) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active' as const,
      transaction_type: transactionType as any,
      service_tier: serviceTier as any,
      commission_rate: transactionType === 'dual' ? 5.0 : 2.5,
      agent_id: currentUserId,
      created_at: new Date(Date.now() - (45 - index * 5) * 24 * 60 * 60 * 1000).toISOString()
    });
  });
  
  // Core transactions
  hamptonRoadsLocations.core.forEach((property, index) => {
    const transactionType = index % 2 === 0 ? 'buyer' : 'seller';
    const serviceTier = transactionType === 'buyer' ? 'buyer_core' : 'listing_core';
    
    transactions.push({
      property_address: property.address,
      city: property.city,
      state: 'VA',
      zip_code: property.zip,
      purchase_price: property.price,
      closing_date: new Date(Date.now() + (15 + index * 8) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: index < 3 ? 'active' as const : 'intake' as const,
      transaction_type: transactionType as any,
      service_tier: serviceTier as any,
      commission_rate: 2.0,
      agent_id: currentUserId,
      created_at: new Date(Date.now() - (30 - index * 3) * 24 * 60 * 60 * 1000).toISOString()
    });
  });

  const { error } = await supabase
    .from('transactions')
    .insert(transactions);

  if (error) {
    throw new Error(`Failed to create Hampton Roads transactions: ${error.message}`);
  }

  console.log(`Created ${transactions.length} Hampton Roads transactions`);
};

const createHamptonRoadsEnhancedClients = async () => {
  console.log("Creating enhanced Hampton Roads clients...");
  
  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, property_address, transaction_type');

  if (!transactions) return;

  const clients = [];

  // Use enhanced client data but only use fields that exist in the database schema
  transactions.forEach((transaction, index) => {
    if (hamptonRoadsEnhancedClients[index]) {
      const enhancedClient = hamptonRoadsEnhancedClients[index];
      
      // Create client record with only the fields that exist in the database
      const client = {
        transaction_id: transaction.id,
        full_name: enhancedClient.full_name,
        email: enhancedClient.email,
        phone: enhancedClient.phone,
        type: enhancedClient.type,
        preferred_contact_method: enhancedClient.preferred_contact_method,
        referral_source: enhancedClient.referral_source,
        // Combine all the enhanced information into the notes field
        notes: enhancedClient.notes + 
               (enhancedClient.military_branch ? ` | Military: ${enhancedClient.military_branch}` : '') +
               (enhancedClient.base_assignment ? ` | Base: ${enhancedClient.base_assignment}` : '') +
               (enhancedClient.security_clearance ? ` | Clearance: ${enhancedClient.security_clearance}` : '') +
               (enhancedClient.va_loan_entitlement ? ` | VA Loan: $${enhancedClient.va_loan_entitlement}` : '') +
               (enhancedClient.profession ? ` | Profession: ${enhancedClient.profession}` : '') +
               (enhancedClient.timeline ? ` | Timeline: ${enhancedClient.timeline}` : ''),
        address: `Currently residing near ${transaction.property_address.split(' ')[1]} area`
      };
      
      // For dual transactions, create both buyer and seller
      if (transaction.transaction_type === 'dual') {
        clients.push({
          ...client,
          type: 'seller' as const,
          full_name: client.full_name + ' (Seller)',
          notes: client.notes + ' [Seller side of dual transaction]'
        });
        
        const nextClient = hamptonRoadsEnhancedClients[index + 1] || hamptonRoadsEnhancedClients[0];
        clients.push({
          transaction_id: transaction.id,
          full_name: nextClient.full_name + ' (Buyer)',
          email: nextClient.email,
          phone: nextClient.phone,
          type: 'buyer' as const,
          preferred_contact_method: nextClient.preferred_contact_method,
          referral_source: nextClient.referral_source,
          notes: nextClient.notes + 
                 (nextClient.military_branch ? ` | Military: ${nextClient.military_branch}` : '') +
                 (nextClient.base_assignment ? ` | Base: ${nextClient.base_assignment}` : '') +
                 ' [Buyer side of dual transaction]',
          address: `Currently residing near ${transaction.property_address.split(' ')[1]} area`
        });
      } else {
        clients.push(client);
      }
    }
  });

  const { error } = await supabase
    .from('clients')
    .insert(clients);

  if (error) {
    throw new Error(`Failed to create enhanced Hampton Roads clients: ${error.message}`);
  }

  console.log(`Created ${clients.length} enhanced Hampton Roads clients`);
};

const createProfessionalContacts = async () => {
  console.log("Creating professional contacts database...");
  
  // Get current user for RLS compliance
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const contacts = [];

  // Add lenders
  hamptonRoadsProfessionalContacts.lenders.forEach(lender => {
    contacts.push({
      full_name: lender.name,
      email: lender.email,
      phone: lender.phone,
      company: lender.company,
      category: 'Lender',
      rating: lender.rating,
      user_id: user.id
    });
  });

  // Add inspectors
  hamptonRoadsProfessionalContacts.inspectors.forEach(inspector => {
    contacts.push({
      full_name: inspector.name,
      email: inspector.email,
      phone: inspector.phone,
      company: inspector.company,
      category: 'Inspector',
      rating: inspector.rating,
      user_id: user.id
    });
  });

  // Add attorneys
  hamptonRoadsProfessionalContacts.attorneys.forEach(attorney => {
    contacts.push({
      full_name: attorney.name,
      email: attorney.email,
      phone: attorney.phone,
      company: attorney.company,
      category: 'Attorney',
      rating: attorney.rating,
      user_id: user.id
    });
  });

  // Add contractors
  hamptonRoadsProfessionalContacts.contractors.forEach(contractor => {
    contacts.push({
      full_name: contractor.contact,
      email: contractor.email,
      phone: contractor.phone,
      company: contractor.name,
      category: 'Contractor',
      rating: contractor.rating,
      user_id: user.id
    });
  });

  const { error } = await supabase
    .from('contacts')
    .insert(contacts);

  if (error) {
    throw new Error(`Failed to create professional contacts: ${error.message}`);
  }

  console.log(`Created ${contacts.length} professional contacts`);
};

const createHamptonRoadsEmailTemplates = async () => {
  console.log("Creating Hampton Roads email templates...");
  
  // Get current user for creator assignment
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const templates = hamptonRoadsEmailTemplates.map(template => ({
    name: template.name,
    category: template.category,
    subject: template.subject,
    body_html: template.body_html,
    created_by: user.id
  }));

  const { error } = await supabase
    .from('email_templates')
    .insert(templates);

  if (error) {
    throw new Error(`Failed to create Hampton Roads email templates: ${error.message}`);
  }

  console.log(`Created ${templates.length} Hampton Roads email templates`);
};

const createAdvancedEmailTemplates = async () => {
  console.log("Creating advanced Hampton Roads email templates...");
  
  // Get current user for creator assignment
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const templates = advancedTemplates.map(template => ({
    name: template.name,
    category: template.category,
    subject: template.subject,
    body_html: template.body_html,
    created_by: user.id
  }));

  const { error } = await supabase
    .from('email_templates')
    .insert(templates);

  if (error) {
    throw new Error(`Failed to create advanced Hampton Roads email templates: ${error.message}`);
  }

  console.log(`Created ${templates.length} advanced Hampton Roads email templates`);
};

const createHamptonRoadsWorkflowTemplates = async () => {
  console.log("Creating Hampton Roads workflow templates...");
  
  // Get current user for creator assignment
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const templates = hamptonRoadsWorkflowTemplates.map(template => ({
    name: template.name,
    type: template.type,
    description: template.description,
    created_by: user.id,
    is_active: true
  }));

  const { data: createdTemplates, error } = await supabase
    .from('workflow_templates')
    .insert(templates)
    .select();

  if (error) {
    throw new Error(`Failed to create Hampton Roads workflow templates: ${error.message}`);
  }

  // Create template tasks for each workflow
  const templateTasks = [];
  createdTemplates.forEach((template, templateIndex) => {
    const workflowTemplate = hamptonRoadsWorkflowTemplates[templateIndex];
    workflowTemplate.tasks.forEach((task, taskIndex) => {
      templateTasks.push({
        template_id: template.id,
        subject: task.subject,
        description_notes: task.description,
        phase: task.phase,
        sort_order: taskIndex,
        due_date_rule: {
          type: 'days_from_event',
          event: 'ratified_date',
          days: task.days_from_contract
        },
        is_agent_visible: true
      });
    });
  });

  if (templateTasks.length > 0) {
    const { error: taskError } = await supabase
      .from('template_tasks')
      .insert(templateTasks);

    if (taskError) {
      throw new Error(`Failed to create Hampton Roads template tasks: ${taskError.message}`);
    }
  }

  console.log(`Created ${templates.length} Hampton Roads workflow templates with ${templateTasks.length} tasks`);
};

const createAdvancedWorkflowTemplates = async () => {
  console.log("Creating advanced Hampton Roads workflow templates...");
  
  // Get current user for creator assignment
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const templates = hamptonRoadsAdvancedWorkflowTemplates.map(template => ({
    name: template.name,
    type: template.type,
    description: template.description,
    created_by: user.id,
    is_active: true
  }));

  const { data: createdTemplates, error } = await supabase
    .from('workflow_templates')
    .insert(templates)
    .select();

  if (error) {
    throw new Error(`Failed to create advanced Hampton Roads workflow templates: ${error.message}`);
  }

  // Create template tasks for each workflow
  const templateTasks = [];
  createdTemplates.forEach((template, templateIndex) => {
    const workflowTemplate = hamptonRoadsAdvancedWorkflowTemplates[templateIndex];
    workflowTemplate.tasks.forEach((task, taskIndex) => {
      templateTasks.push({
        template_id: template.id,
        subject: task.subject,
        description_notes: task.description,
        phase: task.phase,
        sort_order: taskIndex,
        due_date_rule: {
          type: 'days_from_event',
          event: 'ratified_date',
          days: task.days_from_contract
        },
        is_agent_visible: true
      });
    });
  });

  if (templateTasks.length > 0) {
    const { error: taskError } = await supabase
      .from('template_tasks')
      .insert(templateTasks);

    if (taskError) {
      throw new Error(`Failed to create advanced Hampton Roads template tasks: ${taskError.message}`);
    }
  }

  console.log(`Created ${templates.length} advanced Hampton Roads workflow templates with ${templateTasks.length} tasks`);
};

const createHamptonRoadsTasks = async () => {
  console.log("Creating Hampton Roads tasks...");
  
  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, property_address, service_tier, closing_date');

  if (!transactions) return;

  const tasks = [];

  transactions.forEach((transaction) => {
    const baseAddress = transaction.property_address.split(',')[0];
    
    // Common Hampton Roads specific tasks
    const commonTasks = [
      {
        transaction_id: transaction.id,
        title: 'Flood Zone Verification',
        description: `Verify current FEMA flood zone designation for ${baseAddress} and obtain flood zone certificate`,
        priority: 'high' as const,
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_completed: Math.random() > 0.6,
        requires_agent_action: true,
        agent_action_prompt: 'Contact local surveyor for official flood zone determination and certificate.'
      },
      {
        transaction_id: transaction.id,
        title: 'Hurricane Season Preparation Review',
        description: `Review hurricane preparedness features and evacuation procedures for ${baseAddress}`,
        priority: 'medium' as const,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_completed: Math.random() > 0.7,
        requires_agent_action: true,
        agent_action_prompt: 'Provide hurricane preparedness checklist and evacuation route information to client.'
      },
      {
        transaction_id: transaction.id,
        title: 'Military Base Proximity Analysis',
        description: `Analyze commute times to major military installations from ${baseAddress}`,
        priority: 'medium' as const,
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_completed: Math.random() > 0.5,
        requires_agent_action: false,
        agent_action_prompt: null
      }
    ];

    // Service tier specific tasks
    if (transaction.service_tier?.includes('white_glove')) {
      commonTasks.push(
        {
          transaction_id: transaction.id,
          title: 'Waterfront Photography & Drone Session',
          description: `Schedule professional waterfront photography including aerial drone shots for ${baseAddress}`,
          priority: 'high' as const,
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          is_completed: Math.random() > 0.8,
          requires_agent_action: true,
          agent_action_prompt: 'Contact certified drone photographer familiar with waterfront properties.'
        },
        {
          transaction_id: transaction.id,
          title: 'Marina Access Documentation',
          description: `Document marina access rights and dock specifications for ${baseAddress}`,
          priority: 'medium' as const,
          due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          is_completed: Math.random() > 0.9,
          requires_agent_action: true,
          agent_action_prompt: 'Obtain marina association documents and dock lease agreements.'
        }
      );
    }

    // Add closing-related tasks with Hampton Roads specific considerations
    if (transaction.closing_date) {
      const closingDate = new Date(transaction.closing_date);
      const now = new Date();
      const daysToClosing = Math.ceil((closingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysToClosing <= 30 && daysToClosing > 0) {
        commonTasks.push({
          transaction_id: transaction.id,
          title: 'Hurricane Season Closing Coordination',
          description: `Monitor weather conditions and coordinate alternative closing arrangements if needed for ${baseAddress}`,
          priority: 'high' as const,
          due_date: new Date(closingDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          is_completed: false,
          requires_agent_action: true,
          agent_action_prompt: 'Establish backup closing location and communication plan in case of severe weather.'
        });
      }
    }

    tasks.push(...commonTasks);
  });

  const { error } = await supabase
    .from('tasks')
    .insert(tasks);

  if (error) {
    throw new Error(`Failed to create Hampton Roads tasks: ${error.message}`);
  }

  console.log(`Created ${tasks.length} Hampton Roads tasks`);
};

const createHamptonRoadsEnhancedCommunications = async (currentUserId: string) => {
  console.log("Creating enhanced Hampton Roads communication logs...");
  
  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, property_address');

  const { data: clients } = await supabase
    .from('clients')
    .select('id, transaction_id, full_name');

  if (!transactions || !clients) return;

  const communications = [];
  
  // Use enhanced communication data
  hamptonRoadsEnhancedCommunications.emailThreads.forEach(thread => {
    thread.messages.forEach(message => {
      // Find matching transaction
      const transaction = transactions.find(t => 
        t.property_address.includes('Riverside') && thread.subject.includes('Riverside') ||
        t.property_address.includes('Oceana') && thread.subject.includes('Oceana') ||
        t.property_address.includes('Bayshore') && thread.subject.includes('Bayshore')
      );
      
      if (transaction) {
        const client = clients.find(c => c.transaction_id === transaction.id);
        if (client) {
          communications.push({
            user_id: currentUserId,
            contact_type: 'client',
            contact_id: client.id,
            transaction_id: transaction.id,
            communication_type: 'email',
            subject: thread.subject,
            content: message.content,
            direction: message.from.includes('@bhhstowne.com') || message.from.includes('@howardhanna.com') ? 'outbound' : 'inbound',
            created_at: message.timestamp
          });
        }
      }
    });
  });

  // Add some additional standard communications
  transactions.forEach((transaction) => {
    const transactionClients = clients.filter(c => c.transaction_id === transaction.id);
    
    if (transactionClients.length > 0) {
      const client = transactionClients[0];
      const address = transaction.property_address.split(',')[0];
      
      // Add a few standard communications per transaction
      const standardCommunications = [
        {
          subject: `Property Update - ${address}`,
          content: `Quick update on your property search/listing at ${address}. Market conditions remain favorable and we're seeing good activity. Let me know if you have any questions.`,
          type: 'email',
          direction: 'outbound'
        },
        {
          subject: `Schedule Confirmation - ${address}`,
          content: `This confirms our appointment tomorrow at 2:00 PM for ${address}. Looking forward to showing you this excellent property!`,
          type: 'email',  
          direction: 'outbound'
        }
      ];

      standardCommunications.forEach(comm => {
        communications.push({
          user_id: currentUserId,
          contact_type: 'client',
          contact_id: client.id,
          transaction_id: transaction.id,
          communication_type: comm.type,
          subject: comm.subject,
          content: comm.content,
          direction: comm.direction,
          created_at: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString()
        });
      });
    }
  });

  const { error } = await supabase
    .from('communication_logs')
    .insert(communications);

  if (error) {
    throw new Error(`Failed to create enhanced Hampton Roads communications: ${error.message}`);
  }

  console.log(`Created ${communications.length} enhanced Hampton Roads communication logs`);
};

const createHamptonRoadsDocuments = async (currentUserId: string) => {
  console.log("Creating Hampton Roads document records...");
  
  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, property_address, service_tier');

  if (!transactions) return;

  const documents = [];
  
  transactions.forEach((transaction) => {
    const address = transaction.property_address.replace(/\s+/g, '_').replace(/,/g, '');
    
    // Hampton Roads specific documents
    const hamptonRoadsDocTypes = [
      `VA_Purchase_Agreement_${address}.pdf`,
      `Flood_Zone_Certificate_${address}.pdf`,
      `Hurricane_Preparedness_Disclosure_${address}.pdf`,
      `Military_PCS_Addendum_${address}.pdf`,
      `Chesapeake_Bay_Preservation_${address}.pdf`,
      `HOA_Hurricane_Policy_${address}.pdf`
    ];

    // Add waterfront specific documents for premium properties
    if (transaction.service_tier?.includes('white_glove')) {
      hamptonRoadsDocTypes.push(
        `Marina_Access_Agreement_${address}.pdf`,
        `Dock_Inspection_Report_${address}.pdf`,
        `Waterfront_Property_Survey_${address}.pdf`,
        `Bulkhead_Certification_${address}.pdf`
      );
    }

    hamptonRoadsDocTypes.forEach((docName) => {
      if (Math.random() > 0.3) { // 70% chance of document existing
        documents.push({
          transaction_id: transaction.id,
          file_name: docName,
          file_path: `/documents/${transaction.id}/${docName}`,
          uploaded_by_id: currentUserId,
          is_agent_visible: Math.random() > 0.4,
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    });
  });

  const { error } = await supabase
    .from('documents')
    .insert(documents);

  if (error) {
    throw new Error(`Failed to create Hampton Roads documents: ${error.message}`);
  }

  console.log(`Created ${documents.length} Hampton Roads document records`);
};

const createHamptonRoadsNotifications = async (currentUserId: string) => {
  console.log("Creating Hampton Roads notifications...");
  
  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, property_address');

  if (!transactions) return;

  const notifications = [];

  const hamptonRoadsNotificationTemplates = [
    'Hurricane watch issued - Review closing timeline for {address}',
    'Flood zone certificate ready for {address}',
    'Military PCS documentation received for {address}',
    'Waterfront inspection scheduled for {address}',
    'Base housing office referral for {address}',
    'Historic district approval needed for {address}',
    'Marina access documents uploaded for {address}',
    'VA loan approval confirmed for {address}',
    'Hurricane season checklist sent to client - {address}',
    'School district enrollment guide delivered for {address}'
  ];

  // Create notifications for current user only
  const numNotifications = Math.floor(Math.random() * 4) + 8; // 8-12 notifications
  
  for (let i = 0; i < numNotifications; i++) {
    const randomTransaction = transactions[Math.floor(Math.random() * transactions.length)];
    const template = hamptonRoadsNotificationTemplates[Math.floor(Math.random() * hamptonRoadsNotificationTemplates.length)];
    
    notifications.push({
      user_id: currentUserId,
      transaction_id: randomTransaction.id,
      message: template.replace('{address}', randomTransaction.property_address.split(',')[0]),
      is_read: Math.random() > 0.35, // 35% unread for realistic demo
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  const { error } = await supabase
    .from('notifications')
    .insert(notifications);

  if (error) {
    throw new Error(`Failed to create Hampton Roads notifications: ${error.message}`);
  }

  console.log(`Created ${notifications.length} Hampton Roads notifications`);
};
