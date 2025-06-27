import { supabase } from "@/integrations/supabase/client";
import { hamptonRoadsLocations, hamptonRoadsProfessionals, hamptonRoadsClients, hamptonRoadsCommunications, hamptonRoadsDocuments } from "./hamptonRoadsData";
import { hamptonRoadsEmailTemplates, hamptonRoadsWorkflowTemplates } from "./hamptonRoadsTemplates";

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
    
    // 1. Create professional profiles
    await createHamptonRoadsProfessionals();
    
    // 2. Create realistic Hampton Roads transactions
    await createHamptonRoadsTransactions();
    
    // 3. Create Hampton Roads specific clients
    await createHamptonRoadsClients();
    
    // 4. Create email templates
    await createHamptonRoadsEmailTemplates();
    
    // 5. Create workflow templates
    await createHamptonRoadsWorkflowTemplates();
    
    // 6. Create tasks for transactions
    await createHamptonRoadsTasks();
    
    // 7. Create communication logs
    await createHamptonRoadsCommunications(user.id);
    
    // 8. Create document records
    await createHamptonRoadsDocuments();
    
    // 9. Create notifications
    await createHamptonRoadsNotifications();

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
    await supabase.from('profiles').delete().eq('role', 'agent');
    await supabase.from('profiles').delete().eq('role', 'coordinator');
  } catch (error) {
    console.log("Note: Some data may not exist to clear, continuing...");
  }
};

const createHamptonRoadsProfessionals = async () => {
  console.log("Creating Hampton Roads professionals...");
  
  const profiles = [];
  
  // Add coordinators
  hamptonRoadsProfessionals.coordinators.forEach(coord => {
    profiles.push({
      id: crypto.randomUUID(),
      first_name: coord.first_name,
      last_name: coord.last_name,
      email: coord.email,
      phone_number: coord.phone,
      brokerage: coord.brokerage,
      license_number: coord.license_number,
      years_experience: coord.years_experience,
      specialties: coord.specialties,
      bio: coord.bio,
      role: 'coordinator' as const
    });
  });
  
  // Add agents
  hamptonRoadsProfessionals.agents.forEach(agent => {
    profiles.push({
      id: crypto.randomUUID(),
      first_name: agent.first_name,
      last_name: agent.last_name,
      email: agent.email,
      phone_number: agent.phone,
      brokerage: agent.brokerage,
      license_number: agent.license_number,
      years_experience: agent.years_experience,
      specialties: agent.specialties,
      bio: agent.bio,
      role: 'agent' as const
    });
  });

  const { error } = await supabase
    .from('profiles')
    .insert(profiles);

  if (error) {
    throw new Error(`Failed to create Hampton Roads professionals: ${error.message}`);
  }

  console.log(`Created ${profiles.length} Hampton Roads professionals`);
  return profiles;
};

const createHamptonRoadsTransactions = async () => {
  console.log("Creating Hampton Roads transactions...");
  
  // Get agents for assignment
  const { data: agents } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'agent');

  if (!agents || agents.length === 0) {
    throw new Error("No agents found. Please create agent profiles first.");
  }

  const getAgentId = (index: number) => agents[index % agents.length].id;
  
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
      agent_id: getAgentId(index),
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
      agent_id: getAgentId(index + 2),
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
      agent_id: getAgentId(index + 4),
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

const createHamptonRoadsClients = async () => {
  console.log("Creating Hampton Roads clients...");
  
  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, property_address, transaction_type');

  if (!transactions) return;

  const clients = [];

  transactions.forEach((transaction, index) => {
    if (hamptonRoadsClients[index]) {
      const client = {
        ...hamptonRoadsClients[index],
        transaction_id: transaction.id,
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
        
        const nextClient = hamptonRoadsClients[index + 1] || hamptonRoadsClients[0];
        clients.push({
          ...nextClient,
          transaction_id: transaction.id,
          type: 'buyer' as const,
          full_name: nextClient.full_name + ' (Buyer)',
          notes: nextClient.notes + ' [Buyer side of dual transaction]',
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
    throw new Error(`Failed to create Hampton Roads clients: ${error.message}`);
  }

  console.log(`Created ${clients.length} Hampton Roads clients`);
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

const createHamptonRoadsCommunications = async (currentUserId: string) => {
  console.log("Creating Hampton Roads communication logs...");
  
  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, property_address');

  const { data: clients } = await supabase
    .from('clients')
    .select('id, transaction_id, full_name');

  if (!transactions || !clients) return;

  const communications = [];
  
  // Hampton Roads specific communication templates
  const hamptonRoadsCommunicationTemplates = [
    {
      subject: 'Flood Zone Analysis - {{address}}',
      content: 'I\'ve completed the flood zone analysis for {{address}}. The property is located in Zone {{zone}} which requires flood insurance. I\'ve attached the elevation certificate and contacted three insurance providers for quotes. The annual premium should range from $800-1,200 depending on coverage level.',
      type: 'email',
      direction: 'outbound'
    },
    {
      subject: 'Hurricane Preparedness Features',
      content: 'Great question about hurricane preparedness! The property at {{address}} includes impact-resistant windows rated for 150mph winds, a whole-house generator with 7-day fuel capacity, and elevation 3 feet above base flood elevation. The neighborhood has excellent drainage and established evacuation routes.',
      type: 'email',
      direction: 'outbound'
    },
    {
      subject: 'Military Base Commute Analysis',
      content: 'Here\'s the commute analysis you requested: Norfolk Naval Base - 12 minutes during normal traffic, 18 minutes during rush hour. Oceana Naval Air Station - 25 minutes via Shore Drive. Joint Base Langley-Eustis - 35 minutes via tunnel. All routes avoid major traffic bottlenecks.',
      type: 'email',
      direction: 'outbound'
    },
    {
      subject: 'Waterfront Inspection Results',
      content: 'Excellent news on the marine inspection! The dock is in excellent condition with recent piling replacement. The bulkhead shows normal wear but no structural concerns. Depth at dock is 6 feet at mean low tide - perfect for most recreational boats. No required repairs.',
      type: 'email',
      direction: 'outbound'
    },
    {
      subject: 'School District Information',
      content: 'I\'ve researched the school options for your children. The neighborhood feeds into highly-rated schools with strong military family support programs. Elementary: 9/10 rating, Middle: 8/10, High School: 9/10. All have established programs for military children including deployment support services.',
      type: 'email',
      direction: 'outbound'
    }
  ];

  transactions.forEach((transaction) => {
    const transactionClients = clients.filter(c => c.transaction_id === transaction.id);
    
    // Create 3-5 communications per transaction
    const numCommunications = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < numCommunications; i++) {
      const template = hamptonRoadsCommunicationTemplates[Math.floor(Math.random() * hamptonRoadsCommunicationTemplates.length)];
      const client = transactionClients[Math.floor(Math.random() * transactionClients.length)];
      
      if (client) {
        const address = transaction.property_address.split(',')[0];
        communications.push({
          user_id: currentUserId,
          contact_type: 'client',
          contact_id: client.id,
          transaction_id: transaction.id,
          communication_type: template.type,
          subject: template.subject.replace('{{address}}', address),
          content: template.content.replace(/{{address}}/g, address).replace('{{zone}}', Math.random() > 0.5 ? 'AE' : 'VE'),
          direction: template.direction,
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    }
  });

  const { error } = await supabase
    .from('communication_logs')
    .insert(communications);

  if (error) {
    throw new Error(`Failed to create Hampton Roads communications: ${error.message}`);
  }

  console.log(`Created ${communications.length} Hampton Roads communication logs`);
};

const createHamptonRoadsDocuments = async () => {
  console.log("Creating Hampton Roads document records...");
  
  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, property_address, service_tier');

  const { data: agents } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'agent');

  if (!transactions || !agents) return;

  const documents = [];
  
  transactions.forEach((transaction) => {
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];
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
          uploaded_by_id: randomAgent.id,
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

const createHamptonRoadsNotifications = async () => {
  console.log("Creating Hampton Roads notifications...");
  
  const { data: agents } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'agent');

  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, property_address');

  if (!agents || !transactions) return;

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

  agents.forEach((agent) => {
    // Create 5-8 notifications per agent
    const numNotifications = Math.floor(Math.random() * 4) + 5;
    
    for (let i = 0; i < numNotifications; i++) {
      const randomTransaction = transactions[Math.floor(Math.random() * transactions.length)];
      const template = hamptonRoadsNotificationTemplates[Math.floor(Math.random() * hamptonRoadsNotificationTemplates.length)];
      
      notifications.push({
        user_id: agent.id,
        transaction_id: randomTransaction.id,
        message: template.replace('{address}', randomTransaction.property_address.split(',')[0]),
        is_read: Math.random() > 0.35, // 35% unread for realistic demo
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  });

  const { error } = await supabase
    .from('notifications')
    .insert(notifications);

  if (error) {
    throw new Error(`Failed to create Hampton Roads notifications: ${error.message}`);
  }

  console.log(`Created ${notifications.length} Hampton Roads notifications`);
};
