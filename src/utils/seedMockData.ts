
import { supabase } from "@/integrations/supabase/client";

// Mock data generators
export const generateMockData = async () => {
  console.log("Starting mock data generation...");
  
  try {
    // Get existing coordinators to use as creators
    const { data: coordinators } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'coordinator')
      .limit(2);

    if (!coordinators || coordinators.length === 0) {
      throw new Error("No coordinators found. Please create coordinator profiles first.");
    }

    const coordinatorId = coordinators[0].id;

    // 1. Create realistic transactions
    await createTransactions(coordinatorId);
    
    // 2. Create clients for each transaction
    await createClients();
    
    // 3. Create tasks for transactions
    await createTasks();
    
    // 4. Create communication logs
    await createCommunications();
    
    // 5. Create document records
    await createDocuments();
    
    // 6. Create notifications
    await createNotifications();
    
    // 7. Create automation rules
    await createAutomationRules(coordinatorId);

    console.log("Mock data generation completed successfully!");
    return { success: true, message: "All mock data has been created successfully!" };
    
  } catch (error) {
    console.error("Error generating mock data:", error);
    return { success: false, message: `Error: ${error.message}` };
  }
};

const createTransactions = async (coordinatorId: string) => {
  console.log("Creating transactions...");
  
  // Get existing agent profiles to assign transactions to
  const { data: agents } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .eq('role', 'agent');

  if (!agents || agents.length === 0) {
    throw new Error("No agents found. Please create agent profiles first.");
  }

  const transactions = [
    // WHITE GLOVE LISTINGS
    {
      property_address: '1847 Hillcrest Manor Drive',
      city: 'Beverly Hills',
      state: 'CA',
      zip_code: '90210',
      purchase_price: 3250000,
      closing_date: '2024-07-15',
      status: 'active',
      transaction_type: 'seller',
      service_tier: 'white_glove_listing',
      commission_rate: 2.8,
      agent_id: agents[0]?.id,
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      property_address: '2156 Ocean View Terrace',
      city: 'Malibu',
      state: 'CA',
      zip_code: '90265',
      purchase_price: 4750000,
      closing_date: '2024-07-28',
      status: 'active',
      transaction_type: 'seller',
      service_tier: 'white_glove_listing',
      commission_rate: 3.0,
      agent_id: agents[1]?.id,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      property_address: '789 Sunset Plaza Drive',
      city: 'West Hollywood',
      state: 'CA',
      zip_code: '90069',
      purchase_price: 2850000,
      closing_date: '2024-06-20',
      status: 'intake',
      transaction_type: 'seller',
      service_tier: 'white_glove_listing',
      commission_rate: 2.5,
      agent_id: agents[0]?.id,
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      property_address: '1234 Rodeo Collection Way',
      city: 'Beverly Hills',
      state: 'CA',
      zip_code: '90212',
      purchase_price: 5200000,
      closing_date: '2024-07-05',
      status: 'contract',
      transaction_type: 'seller',
      service_tier: 'white_glove_listing',
      commission_rate: 3.0,
      agent_id: agents[1]?.id,
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    },

    // ELITE TRANSACTIONS
    {
      property_address: '456 Oak Valley Drive',
      city: 'Scottsdale',
      state: 'AZ',
      zip_code: '85251',
      purchase_price: 1350000,
      closing_date: '2024-07-22',
      status: 'active',
      transaction_type: 'buyer',
      service_tier: 'listing_elite',
      commission_rate: 2.5,
      agent_id: agents[2]?.id,
      created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      property_address: '2234 Riverside Lane',
      city: 'Nashville',
      state: 'TN',
      zip_code: '37215',
      purchase_price: 950000,
      closing_date: '2024-08-10',
      status: 'contract',
      transaction_type: 'seller',
      service_tier: 'listing_elite',
      commission_rate: 2.5,
      agent_id: agents[3]?.id,
      created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      property_address: '678 Harbor View Circle',
      city: 'San Diego',
      state: 'CA',
      zip_code: '92101',
      purchase_price: 1650000,
      closing_date: '2024-07-18',
      status: 'active',
      transaction_type: 'seller',
      service_tier: 'listing_elite',
      commission_rate: 2.5,
      agent_id: agents[4]?.id,
      created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      property_address: '1456 Mountain Ridge Court',
      city: 'Denver',
      state: 'CO',
      zip_code: '80218',
      purchase_price: 875000,
      closing_date: '2024-06-15',
      status: 'intake',
      transaction_type: 'buyer',
      service_tier: 'buyer_elite',
      commission_rate: 2.5,
      agent_id: agents[2]?.id,
      created_at: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      property_address: '3344 Lakefront Drive',
      city: 'Austin',
      state: 'TX',
      zip_code: '78746',
      purchase_price: 1125000,
      closing_date: '2024-08-05',
      status: 'contract',
      transaction_type: 'dual',
      service_tier: 'listing_elite',
      commission_rate: 5.0,
      agent_id: agents[3]?.id,
      created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
    },

    // CORE TRANSACTIONS
    {
      property_address: '789 Maple Street',
      city: 'Plano',
      state: 'TX',
      zip_code: '75023',
      purchase_price: 485000,
      closing_date: '2024-07-25',
      status: 'active',
      transaction_type: 'buyer',
      service_tier: 'buyer_core',
      commission_rate: 2.0,
      agent_id: agents[5]?.id,
      created_at: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      property_address: '1567 Pine Avenue',
      city: 'Irvine',
      state: 'CA',
      zip_code: '92602',
      purchase_price: 650000,
      closing_date: '2024-08-12',
      status: 'contract',
      transaction_type: 'seller',
      service_tier: 'listing_core',
      commission_rate: 2.0,
      agent_id: agents[4]?.id,
      created_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      property_address: '2345 Elm Court',
      city: 'Frisco',
      state: 'TX',
      zip_code: '75034',
      purchase_price: 425000,
      closing_date: '2024-06-30',
      status: 'intake',
      transaction_type: 'buyer',
      service_tier: 'buyer_core',
      commission_rate: 2.0,
      agent_id: agents[5]?.id,
      created_at: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      property_address: '4567 Birch Lane',
      city: 'Gilbert',
      state: 'AZ',
      zip_code: '85234',
      purchase_price: 535000,
      closing_date: '2024-07-30',
      status: 'active',
      transaction_type: 'seller',
      service_tier: 'listing_core',
      commission_rate: 2.0,
      agent_id: agents[6]?.id,
      created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      property_address: '6789 Cedar Drive',
      city: 'Chandler',
      state: 'AZ',
      zip_code: '85225',
      purchase_price: 395000,
      closing_date: '2024-08-08',
      status: 'contract',
      transaction_type: 'buyer',
      service_tier: 'buyer_core',
      commission_rate: 2.0,
      agent_id: agents[5]?.id,
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      property_address: '8901 Willow Way',
      city: 'Henderson',
      state: 'NV',
      zip_code: '89052',
      purchase_price: 475000,
      closing_date: '2024-07-12',
      status: 'active',
      transaction_type: 'seller',
      service_tier: 'listing_core',
      commission_rate: 2.0,
      agent_id: agents[4]?.id,
      created_at: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000).toISOString()
    },

    // DUAL TRANSACTIONS
    {
      property_address: '1122 Valley View Drive',
      city: 'Phoenix',
      state: 'AZ',
      zip_code: '85016',
      purchase_price: 725000,
      closing_date: '2024-08-15',
      status: 'contract',
      transaction_type: 'dual',
      service_tier: 'listing_core',
      commission_rate: 4.0,
      agent_id: agents[6]?.id,
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      property_address: '3344 Desert Bloom Lane',
      city: 'Las Vegas',
      state: 'NV',
      zip_code: '89129',
      purchase_price: 625000,
      closing_date: '2024-07-08',
      status: 'active',
      transaction_type: 'dual',
      service_tier: 'listing_elite',
      commission_rate: 5.0,
      agent_id: agents[2]?.id,
      created_at: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const { error } = await supabase
    .from('transactions')
    .insert(transactions);

  if (error) {
    throw new Error(`Failed to create transactions: ${error.message}`);
  }

  console.log(`Created ${transactions.length} transactions`);
};

const createClients = async () => {
  console.log("Creating clients...");
  
  // Get all transactions to create clients for
  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, property_address, transaction_type, service_tier');

  if (!transactions) return;

  const clients = [];

  // Create realistic client data for each transaction
  const clientData = [
    {
      full_name: 'Harrison & Victoria Ashworth',
      email: 'harrison.ashworth@gmail.com',
      phone: '(555) 111-2222',
      type: 'seller',
      preferred_contact_method: 'email',
      referral_source: 'Referral from previous client',
      notes: 'High-profile entertainment industry clients seeking discretion. Flexible on timing but want premium marketing package.'
    },
    {
      full_name: 'Alexandra Petrov',
      email: 'a.petrov@petrovinvestments.com',
      phone: '(555) 222-3333',
      type: 'seller',
      preferred_contact_method: 'phone',
      referral_source: 'Luxury broker network',
      notes: 'International investor downsizing US portfolio. Motivated seller, cash preferred but will consider qualified buyers.'
    },
    {
      full_name: 'Marcus & Sarah Chen-Williams',
      email: 'marcus.chen.williams@techcorp.com',
      phone: '(555) 333-4444',
      type: 'buyer',
      preferred_contact_method: 'text',
      referral_source: 'Corporate relocation',
      notes: 'Tech executive couple relocating from NYC. Need quick close, all-cash offer, looking for modern luxury with ocean proximity.'
    },
    {
      full_name: 'Richard Montgomery III',
      email: 'r.montgomery@montgomerylaw.com',
      phone: '(555) 444-5555',
      type: 'seller',
      preferred_contact_method: 'email',
      referral_source: 'Attorney referral network',
      notes: 'Estate sale - deceased parents property. Heirs motivated to sell quickly but want maximum value. Some family coordination required.'
    },
    {
      full_name: 'Dr. James & Linda Rodriguez',
      email: 'jrodriguez.md@scottsdalemed.com',
      phone: '(555) 555-6666',
      type: 'buyer',
      preferred_contact_method: 'email',
      referral_source: 'Physician referral',
      notes: 'Surgeon and pediatrician couple seeking luxury home near Scottsdale hospitals. Need 4+ bedrooms, home office space, pool.'
    },
    {
      full_name: 'Country Music Star Blake Taylor',
      email: 'blake@blaketalormusic.com',
      phone: '(555) 666-7777',
      type: 'seller',
      preferred_contact_method: 'phone',
      referral_source: 'Celebrity management company',
      notes: 'Recording artist upgrading to larger estate. Flexible timing, wants strong marketing to fans/collectors. Privacy important.'
    },
    {
      full_name: 'Kevin & Michelle Zhang',
      email: 'kevin.zhang@biotech.com',
      phone: '(555) 777-8888',
      type: 'seller',
      preferred_contact_method: 'email',
      referral_source: 'Company referral program',
      notes: 'Biotech executive couple relocating to Boston. Need quick sale, priced competitively, excellent condition property.'
    },
    {
      full_name: 'Thomas & Jennifer Walsh',
      email: 'tom.walsh@investmentfirm.com',
      phone: '(555) 888-9999',
      type: 'buyer',
      preferred_contact_method: 'phone',
      referral_source: 'Investment firm network',
      notes: 'Finance executive family relocating from Chicago. Need good schools, mountain views, move-in ready. Timeline flexible.'
    },
    {
      full_name: 'Austin & Diana Foster',
      email: 'austin.d.foster@gmail.com',
      phone: '(555) 999-0000',
      type: 'buyer',
      preferred_contact_method: 'text',
      referral_source: 'Neighborhood referral',
      notes: 'Local couple upgrading to lakefront. Selling current home first, need coordination. Love entertaining, want dock access.'
    },
    {
      full_name: 'Miguel & Rosa Hernandez',
      email: 'miguel.hernandez@email.com',
      phone: '(555) 101-2020',
      type: 'buyer',
      preferred_contact_method: 'phone',
      referral_source: 'First-time buyer program',
      notes: 'Young family, first-time buyers, teacher and nurse. Pre-approved FHA loan, need good schools, safe neighborhood. Very excited!'
    },
    {
      full_name: 'Robert & Janet Kim',
      email: 'robertkim@outlook.com',
      phone: '(555) 202-3030',
      type: 'seller',
      preferred_contact_method: 'email',
      referral_source: 'Previous client referral',
      notes: 'Empty nesters downsizing. Well-maintained home, original owners. Want to help young family, priced fairly.'
    },
    {
      full_name: 'Amanda & Steve Johnson',
      email: 'ajohnson.steve@gmail.com',
      phone: '(555) 303-4040',
      type: 'buyer',
      preferred_contact_method: 'text',
      referral_source: 'Military relocation service',
      notes: 'Military family, VA loan approved. Husband deploying soon, need to close quickly. Wife will handle most showings.'
    },
    {
      full_name: 'Eleanor Martinez',
      email: 'eleanor.martinez@retired.com',
      phone: '(555) 404-5050',
      type: 'seller',
      preferred_contact_method: 'email',
      referral_source: 'Senior referral service',
      notes: 'Widow moving to assisted living. Family helping with sale. Well-maintained home, sentimental attachment.'
    },
    {
      full_name: 'Gregory Patterson',
      email: 'greg.patterson@construction.com',
      phone: '(555) 505-6060',
      type: 'buyer',
      preferred_contact_method: 'phone',
      referral_source: 'Construction company referral',
      notes: 'General contractor buying investment property. Cash buyer, quick close possible. May want to make improvements.'
    },
    {
      full_name: 'David & Lisa Chen',
      email: 'david.chen@startup.com',
      phone: '(555) 606-7070',
      type: 'buyer',
      preferred_contact_method: 'email',
      referral_source: 'Tech company network',
      notes: 'Startup founders looking for family home. Recently went public, flexible budget. Want modern amenities and good schools.'
    },
    {
      full_name: 'Patricia Williams',
      email: 'patricia.williams@law.com',
      phone: '(555) 707-8080',
      type: 'seller',
      preferred_contact_method: 'phone',
      referral_source: 'Legal professional network',
      notes: 'Partner at law firm relocating to London office. Needs to sell quickly, will consider reasonable offers.'
    },
    {
      full_name: 'Michael & Jennifer Smith',
      email: 'mj.smith@finance.com',
      phone: '(555) 808-9090',
      type: 'buyer',
      preferred_contact_method: 'text',
      referral_source: 'Corporate relocation',
      notes: 'Banking executives relocating from New York. High-end taste, want luxury amenities. Timeline is flexible.'
    },
    {
      full_name: 'Sarah Thompson',
      email: 'sarah.thompson@design.com',
      phone: '(555) 909-1010',
      type: 'seller',
      preferred_contact_method: 'email',
      referral_source: 'Interior design network',
      notes: 'Interior designer selling showcase home. Professionally designed, move-in ready. Wants buyer who appreciates the design.'
    }
  ];

  transactions.forEach((transaction, index) => {
    if (clientData[index]) {
      const client = {
        ...clientData[index],
        transaction_id: transaction.id,
        address: `Currently at ${transaction.property_address.replace(/\d+/, 'temp location near')}`
      };
      
      // For dual transactions, create both buyer and seller
      if (transaction.transaction_type === 'dual') {
        clients.push({
          ...client,
          type: 'seller',
          full_name: clientData[index].full_name + ' (Seller)',
          notes: client.notes + ' [Seller side of dual transaction]'
        });
        clients.push({
          ...client,
          type: 'buyer',
          full_name: clientData[index + 1]?.full_name || 'John & Jane Buyer',
          email: clientData[index + 1]?.email || 'buyer@email.com',
          phone: clientData[index + 1]?.phone || '(555) 000-0000',
          notes: (clientData[index + 1]?.notes || 'Buyer in dual transaction') + ' [Buyer side of dual transaction]'
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
    throw new Error(`Failed to create clients: ${error.message}`);
  }

  console.log(`Created ${clients.length} clients`);
};

const createTasks = async () => {
  console.log("Creating tasks...");
  
  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, property_address, status, service_tier, closing_date');

  if (!transactions) return;

  const tasks = [];

  // Create realistic tasks for each transaction based on service tier
  transactions.forEach((transaction) => {
    // Common tasks for all transactions
    const commonTasks = [
      {
        transaction_id: transaction.id,
        title: 'Initial Client Welcome Call',
        description: `Welcome call with client for ${transaction.property_address}`,
        priority: 'high',
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_completed: Math.random() > 0.3,
        requires_agent_action: true,
        agent_action_prompt: 'Schedule and complete welcome call with client to review transaction timeline and answer questions.'
      },
      {
        transaction_id: transaction.id,
        title: 'Contract Review',
        description: `Review and verify all contract details for ${transaction.property_address}`,
        priority: 'high',
        due_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_completed: Math.random() > 0.4,
        requires_agent_action: false
      },
      {
        transaction_id: transaction.id,
        title: 'Schedule Home Inspection',
        description: `Coordinate home inspection for ${transaction.property_address}`,
        priority: 'medium',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_completed: Math.random() > 0.5,
        requires_agent_action: true,
        agent_action_prompt: 'Contact preferred inspection companies and schedule inspection within contract timeline.'
      }
    ];

    // Service tier specific tasks
    if (transaction.service_tier?.includes('white_glove')) {
      commonTasks.push(
        {
          transaction_id: transaction.id,
          title: 'Professional Photography Session',
          description: `Luxury photography for ${transaction.property_address}`,
          priority: 'high',
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          is_completed: Math.random() > 0.6,
          requires_agent_action: true,
          agent_action_prompt: 'Schedule professional photographer for luxury property marketing.'
        },
        {
          transaction_id: transaction.id,
          title: 'Staging Consultation',
          description: `Home staging consultation for ${transaction.property_address}`,
          priority: 'medium',
          due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          is_completed: Math.random() > 0.7,
          requires_agent_action: true,
          agent_action_prompt: 'Coordinate with professional stager to enhance property presentation.'
        },
        {
          transaction_id: transaction.id,
          title: 'Premium Marketing Materials',
          description: `Create luxury marketing materials for ${transaction.property_address}`,
          priority: 'medium',
          due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          is_completed: Math.random() > 0.8,
          requires_agent_action: false
        }
      );
    } else if (transaction.service_tier?.includes('elite')) {
      commonTasks.push(
        {
          transaction_id: transaction.id,
          title: 'Enhanced Marketing Package',
          description: `Create comprehensive marketing for ${transaction.property_address}`,
          priority: 'medium',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          is_completed: Math.random() > 0.5,
          requires_agent_action: false
        },
        {
          transaction_id: transaction.id,
          title: 'Weekly Client Update',
          description: `Send weekly progress update for ${transaction.property_address}`,
          priority: 'low',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          is_completed: Math.random() > 0.4,
          requires_agent_action: true,
          agent_action_prompt: 'Prepare and send weekly transaction update to client.'
        }
      );
    }

    // Add closing-related tasks if close to closing date
    if (transaction.closing_date) {
      const closingDate = new Date(transaction.closing_date);
      const now = new Date();
      const daysToClosing = Math.ceil((closingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysToClosing <= 30 && daysToClosing > 0) {
        commonTasks.push(
          {
            transaction_id: transaction.id,
            title: 'Final Walk-Through',
            description: `Schedule final walk-through for ${transaction.property_address}`,
            priority: 'high',
            due_date: new Date(closingDate.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            is_completed: false,
            requires_agent_action: true,
            agent_action_prompt: 'Coordinate final walk-through with all parties 24 hours before closing.'
          },
          {
            transaction_id: transaction.id,
            title: 'Closing Coordination',
            description: `Coordinate closing details for ${transaction.property_address}`,
            priority: 'high',
            due_date: new Date(closingDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            is_completed: daysToClosing > 7 ? Math.random() > 0.3 : false,
            requires_agent_action: false
          }
        );
      }
    }

    // Add some overdue tasks for realism
    if (Math.random() > 0.8) {
      commonTasks.push({
        transaction_id: transaction.id,
        title: 'Follow-up Required',
        description: `Important follow-up needed for ${transaction.property_address}`,
        priority: 'high',
        due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_completed: false,
        requires_agent_action: true,
        agent_action_prompt: 'Urgent follow-up required - contact client immediately.'
      });
    }

    tasks.push(...commonTasks);
  });

  const { error } = await supabase
    .from('tasks')
    .insert(tasks);

  if (error) {
    throw new Error(`Failed to create tasks: ${error.message}`);
  }

  console.log(`Created ${tasks.length} tasks`);
};

const createCommunications = async () => {
  console.log("Creating communication logs...");
  
  const { data: agents } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'agent');

  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, property_address');

  const { data: clients } = await supabase
    .from('clients')
    .select('id, transaction_id, full_name');

  if (!agents || !transactions || !clients) return;

  const communications = [];
  
  // Create realistic communication logs
  const communicationTemplates = [
    {
      subject: 'Property Showing Feedback',
      content: 'Great showing today! The buyers were very impressed with the kitchen renovation and the master suite. They mentioned they love the neighborhood and school district. Expecting an offer within 48 hours.',
      type: 'email',
      direction: 'inbound'
    },
    {
      subject: 'Inspection Report Review',
      content: 'Attached is the inspection report. Overall very positive - just minor items noted. The roof, HVAC, and electrical systems all checked out perfectly. Buyers are satisfied and moving forward.',
      type: 'email',
      direction: 'outbound'
    },
    {
      subject: 'Appraisal Update',
      content: 'Good news! The appraisal came in at asking price. This removes a major contingency and we are on track for the scheduled closing date.',
      type: 'email',
      direction: 'outbound'
    },
    {
      subject: 'Closing Preparation',
      content: 'Quick call to confirm closing details and final walk-through timing.',
      type: 'phone',
      direction: 'outbound'
    },
    {
      subject: 'Contract Negotiation',
      content: 'Buyer has submitted a strong offer. Terms look good but they are asking for $5,000 in closing costs. Recommend accepting given current market conditions.',
      type: 'text',
      direction: 'inbound'
    },
    {
      subject: 'Marketing Update',
      content: 'Listing is performing well! We have had 15 showings this week and 3 second showings. The professional photos are getting great engagement on the MLS.',
      type: 'email',
      direction: 'outbound'
    }
  ];

  transactions.forEach((transaction) => {
    const transactionClients = clients.filter(c => c.transaction_id === transaction.id);
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];
    
    // Create 3-5 communications per transaction
    const numCommunications = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < numCommunications; i++) {
      const template = communicationTemplates[Math.floor(Math.random() * communicationTemplates.length)];
      const client = transactionClients[Math.floor(Math.random() * transactionClients.length)];
      
      if (client) {
        communications.push({
          user_id: randomAgent.id,
          contact_type: 'client',
          contact_id: client.id,
          transaction_id: transaction.id,
          communication_type: template.type,
          subject: template.subject,
          content: template.content.replace(/buyers?|sellers?/gi, client.full_name),
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
    throw new Error(`Failed to create communications: ${error.message}`);
  }

  console.log(`Created ${communications.length} communication logs`);
};

const createDocuments = async () => {
  console.log("Creating document records...");
  
  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, property_address, service_tier');

  const { data: agents } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'agent');

  if (!transactions || !agents) return;

  const documents = [];
  
  // Document templates based on service tier
  const documentTemplates = {
    contract: [
      'Purchase_Agreement.pdf',
      'Listing_Agreement.pdf',
      'Disclosure_Statement.pdf',
      'HOA_Documents.pdf'
    ],
    financial: [
      'Pre_Approval_Letter.pdf',
      'Bank_Statements.pdf',
      'Tax_Returns.pdf',
      'Financial_Verification.pdf'
    ],
    inspection: [
      'Home_Inspection_Report.pdf',
      'Pest_Inspection.pdf',
      'Roof_Certification.pdf',
      'HVAC_Inspection.pdf'
    ],
    closing: [
      'Title_Report.pdf',
      'Closing_Statement.pdf',
      'Deed_Transfer.pdf',
      'Insurance_Policy.pdf'
    ],
    marketing: [
      'Professional_Photos.zip',
      'Virtual_Tour_Link.pdf',
      'Marketing_Brochure.pdf',
      'Property_Description.pdf'
    ]
  };

  transactions.forEach((transaction) => {
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];
    const address = transaction.property_address.replace(/\s+/g, '_').replace(/,/g, '');
    
    // Add contract documents (always present)
    documentTemplates.contract.forEach((template) => {
      documents.push({
        transaction_id: transaction.id,
        file_name: template.replace('.pdf', `_${address}.pdf`),
        file_path: `/documents/${transaction.id}/${template.replace('.pdf', `_${address}.pdf`)}`,
        uploaded_by_id: randomAgent.id,
        is_agent_visible: Math.random() > 0.3,
        created_at: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000).toISOString()
      });
    });

    // Add financial documents
    documentTemplates.financial.forEach((template) => {
      if (Math.random() > 0.4) {
        documents.push({
          transaction_id: transaction.id,
          file_name: template.replace('.pdf', `_${address}.pdf`),
          file_path: `/documents/${transaction.id}/${template.replace('.pdf', `_${address}.pdf`)}`,
          uploaded_by_id: randomAgent.id,
          is_agent_visible: false, // Financial docs usually not agent visible
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    });

    // Add inspection documents
    documentTemplates.inspection.forEach((template) => {
      if (Math.random() > 0.5) {
        documents.push({
          transaction_id: transaction.id,
          file_name: template.replace('.pdf', `_${address}.pdf`),
          file_path: `/documents/${transaction.id}/${template.replace('.pdf', `_${address}.pdf`)}`,
          uploaded_by_id: randomAgent.id,
          is_agent_visible: true,
          created_at: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    });

    // Add marketing documents for white glove and elite tiers
    if (transaction.service_tier?.includes('white_glove') || transaction.service_tier?.includes('elite')) {
      documentTemplates.marketing.forEach((template) => {
        if (Math.random() > 0.3) {
          documents.push({
            transaction_id: transaction.id,
            file_name: template.replace('.pdf', `_${address}.pdf`).replace('.zip', `_${address}.zip`),
            file_path: `/documents/${transaction.id}/marketing/${template.replace('.pdf', `_${address}.pdf`).replace('.zip', `_${address}.zip`)}`,
            uploaded_by_id: randomAgent.id,
            is_agent_visible: true,
            created_at: new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      });
    }

    // Add closing documents for transactions close to closing
    const now = new Date();
    const transactionAge = Math.random() * 60; // Days since transaction started
    if (transactionAge > 20) {
      documentTemplates.closing.forEach((template) => {
        if (Math.random() > 0.6) {
          documents.push({
            transaction_id: transaction.id,
            file_name: template.replace('.pdf', `_${address}.pdf`),
            file_path: `/documents/${transaction.id}/closing/${template.replace('.pdf', `_${address}.pdf`)}`,
            uploaded_by_id: randomAgent.id,
            is_agent_visible: Math.random() > 0.4,
            created_at: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      });
    }
  });

  const { error } = await supabase
    .from('documents')
    .insert(documents);

  if (error) {
    throw new Error(`Failed to create documents: ${error.message}`);
  }

  console.log(`Created ${documents.length} document records`);
};

const createNotifications = async () => {
  console.log("Creating notifications...");
  
  const { data: agents } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'agent');

  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, property_address, status');

  if (!agents || !transactions) return;

  const notifications = [];

  const notificationTemplates = [
    'New task assigned: Home inspection for {address}',
    'Document uploaded: Contract signed for {address}',
    'Status update: {address} moved to contract status',
    'Reminder: Final walk-through scheduled for {address}',
    'Alert: Closing date approaching for {address}',
    'Update: New showing request for {address}',
    'Action required: Review inspection report for {address}',
    'Milestone: Appraisal completed for {address}',
    'Communication: New message from client regarding {address}',
    'Deadline: Task due tomorrow for {address}'
  ];

  agents.forEach((agent) => {
    // Create 5-10 notifications per agent
    const numNotifications = Math.floor(Math.random() * 6) + 5;
    
    for (let i = 0; i < numNotifications; i++) {
      const randomTransaction = transactions[Math.floor(Math.random() * transactions.length)];
      const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
      
      notifications.push({
        user_id: agent.id,
        transaction_id: randomTransaction.id,
        message: template.replace('{address}', randomTransaction.property_address),
        is_read: Math.random() > 0.4, // 40% unread
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  });

  const { error } = await supabase
    .from('notifications')
    .insert(notifications);

  if (error) {
    throw new Error(`Failed to create notifications: ${error.message}`);
  }

  console.log(`Created ${notifications.length} notifications`);
};

const createAutomationRules = async (coordinatorId: string) => {
  console.log("Creating automation rules...");
  
  // Get email templates to link to automation rules
  const { data: emailTemplates } = await supabase
    .from('email_templates')
    .select('id, name');

  if (!emailTemplates) return;

  const automationRules = [
    {
      name: 'Welcome Email on Contract Acceptance',
      trigger_event: 'status_changed',
      trigger_condition: { status: 'contract' },
      template_id: emailTemplates.find(t => t.name === 'Contract Acceptance Notification')?.id,
      is_active: true,
      created_by: coordinatorId
    },
    {
      name: 'Weekly Updates for Active Transactions',
      trigger_event: 'task_completed',
      trigger_condition: { task_type: 'weekly_update' },
      template_id: emailTemplates.find(t => t.name === 'Weekly Transaction Update')?.id,
      is_active: true,
      created_by: coordinatorId
    },
    {
      name: 'Inspection Reminder',
      trigger_event: 'task_completed',
      trigger_condition: { task_type: 'schedule_inspection' },
      template_id: emailTemplates.find(t => t.name === 'Inspection Reminder')?.id,
      is_active: true,
      created_by: coordinatorId
    },
    {
      name: 'Closing Preparation Notification',
      trigger_event: 'document_signed',
      trigger_condition: { document_type: 'final_walkthrough' },
      template_id: emailTemplates.find(t => t.name === 'Closing Reminder')?.id,
      is_active: true,
      created_by: coordinatorId
    }
  ].filter(rule => rule.template_id); // Only include rules with valid template IDs

  if (automationRules.length > 0) {
    const { error } = await supabase
      .from('automation_rules')
      .insert(automationRules);

    if (error) {
      throw new Error(`Failed to create automation rules: ${error.message}`);
    }

    console.log(`Created ${automationRules.length} automation rules`);
  }
};
