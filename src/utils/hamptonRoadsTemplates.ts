
// Hampton Roads specific email templates and workflows
export const hamptonRoadsEmailTemplates = [
  {
    name: 'Welcome to Hampton Roads - Military Family',
    category: 'Welcome',
    subject: 'Welcome to Hampton Roads Real Estate Services - Military Family Specialists',
    body_html: `
      <h2>Welcome to Hampton Roads, {{client_name}}!</h2>
      <p>Thank you for choosing our services for your PCS move to the Hampton Roads area. As military family specialists, we understand the unique challenges and timeline pressures of military relocations.</p>
      
      <h3>What Makes Us Different for Military Families:</h3>
      <ul>
        <li>✓ VA Loan expertise and preferred lender network</li>
        <li>✓ Flexible scheduling around deployment and duty schedules</li>
        <li>✓ Knowledge of base proximity, commute times, and military-friendly communities</li>
        <li>✓ Hurricane preparedness and flood zone guidance</li>
        <li>✓ School district information for military children</li>
      </ul>
      
      <h3>Your Assigned Team:</h3>
      <p><strong>Agent:</strong> {{agent_name}}<br>
      <strong>Coordinator:</strong> {{coordinator_name}}<br>
      <strong>Direct Phone:</strong> {{agent_phone}}</p>
      
      <h3>Important Hampton Roads Information:</h3>
      <p><strong>Hurricane Season:</strong> June 1 - November 30 (We'll keep you informed of any impacts)<br>
      <strong>Local Military Resources:</strong> We'll connect you with spouse groups and base services<br>
      <strong>Flood Zones:</strong> We'll explain flood insurance requirements for your area</p>
      
      <p>We're here to make your transition to Hampton Roads as smooth as possible. Welcome to your new duty station!</p>
      
      <p>Semper Fi,<br>{{agent_name}}</p>
    `
  },
  {
    name: 'Hurricane Season Preparation Checklist',
    category: 'Safety',
    subject: 'Important: Hurricane Season Preparation for {{property_address}}',
    body_html: `
      <h2>Hurricane Season Preparation - {{property_address}}</h2>
      <p>Dear {{client_name}},</p>
      
      <p>Hurricane season is upon us (June 1 - November 30), and we want to ensure you're prepared. Your property at {{property_address}} is located in flood zone {{flood_zone}}.</p>
      
      <h3>Immediate Action Items:</h3>
      <ul>
        <li>□ Verify flood insurance coverage is active and adequate</li>
        <li>□ Test generator and ensure fuel supply (if applicable)</li>
        <li>□ Inspect hurricane shutters or boarding materials</li>
        <li>□ Review evacuation routes for your area</li>
        <li>□ Update emergency contact information</li>
      </ul>
      
      <h3>Important Contact Information:</h3>
      <p><strong>City Emergency Management:</strong> {{city_emergency}}<br>
      <strong>Flood Insurance Agent:</strong> {{insurance_contact}}<br>
      <strong>Preferred Contractors:</strong> Available upon request</p>
      
      <h3>Your Property's Hurricane Features:</h3>
      <p>{{hurricane_features}}</p>
      
      <p>We monitor all weather conditions and will proactively communicate any impacts to your closing timeline.</p>
      
      <p>Stay safe,<br>{{agent_name}}</p>
    `
  },
  {
    name: 'Waterfront Property Owner Guide',
    category: 'Property Info',
    subject: 'Your Waterfront Property Guide - {{property_address}}',
    body_html: `
      <h2>Congratulations on Your Waterfront Property Purchase!</h2>
      <p>Dear {{client_name}},</p>
      
      <p>Welcome to waterfront living at {{property_address}}! Here's essential information for your new waterfront lifestyle:</p>
      
      <h3>Dock and Marina Information:</h3>
      <ul>
        <li><strong>Dock Specifications:</strong> {{dock_details}}</li>
        <li><strong>Marina Access:</strong> {{marina_info}}</li>
        <li><strong>Boat Launch:</strong> {{boat_launch_location}}</li>
        <li><strong>Tide Charts:</strong> Available at {{tide_chart_source}}</li>
      </ul>
      
      <h3>Waterfront Maintenance Essentials:</h3>
      <ul>
        <li>□ Annual dock inspection (recommended contractors available)</li>
        <li>□ Bulkhead maintenance and inspection</li>
        <li>□ HVAC salt air considerations</li>
        <li>□ Window and door seal maintenance</li>
        <li>□ Landscape salt tolerance planning</li>
      </ul>
      
      <h3>Local Waterfront Resources:</h3>
      <p><strong>Marine Services:</strong> {{marine_services}}<br>
      <strong>Boat Storage:</strong> {{boat_storage_options}}<br>
      <strong>Waterfront Contractors:</strong> {{preferred_contractors}}</p>
      
      <h3>Environmental Considerations:</h3>
      <p>Your property is subject to Chesapeake Bay Preservation Act regulations. Please contact us before any landscaping or dock modifications.</p>
      
      <p>Enjoy your waterfront lifestyle!<br>{{agent_name}}</p>
    `
  },
  {
    name: 'Historic Ghent District Property Information',
    category: 'Property Info',
    subject: 'Your Historic Ghent Property - Preservation Guidelines',
    body_html: `
      <h2>Welcome to Historic Ghent District!</h2>
      <p>Dear {{client_name}},</p>
      
      <p>Congratulations on your purchase in Norfolk's prestigious Ghent Historic District! Your property at {{property_address}} is part of a nationally recognized historic neighborhood.</p>
      
      <h3>Historic District Guidelines:</h3>
      <ul>
        <li><strong>Architectural Review Board:</strong> Required for exterior modifications</li>
        <li><strong>Window Replacements:</strong> Must maintain historic character</li>
        <li><strong>Paint Colors:</strong> Historic color palette recommendations available</li>
        <li><strong>Landscaping:</strong> Period-appropriate plantings encouraged</li>
      </ul>
      
      <h3>Ghent District Amenities:</h3>
      <ul>
        <li>✓ Walkable to Norfolk Botanical Garden</li>
        <li>✓ Chrysler Museum of Art nearby</li>
        <li>✓ Ghent Business District restaurants and shops</li>
        <li>✓ Historic home tours and community events</li>
      </ul>
      
      <h3>Important Contacts:</h3>
      <p><strong>Historic Preservation:</strong> {{preservation_contact}}<br>
      <strong>Ghent Neighborhood Association:</strong> {{neighborhood_contact}}<br>
      <strong>Historic Contractor Network:</strong> Available upon request</p>
      
      <p>Your home is part of Hampton Roads' rich history. We're here to help you preserve and enjoy it!</p>
      
      <p>Best regards,<br>{{agent_name}}</p>
    `
  }
];

export const hamptonRoadsWorkflowTemplates = [
  {
    name: 'White Glove Waterfront Listing Workflow',
    type: 'Listing', // Changed from 'listing' to 'Listing'
    description: 'Comprehensive workflow for luxury waterfront properties requiring premium marketing and specialized disclosures',
    tasks: [
      {
        subject: 'Initial Waterfront Property Assessment',
        description: 'Complete detailed assessment including dock condition, bulkhead status, flood zone verification, and hurricane preparedness features',
        days_from_contract: -5,
        phase: 'Pre-Listing'
      },
      {
        subject: 'Professional Marine Photography',
        description: 'Schedule drone and marine photography to capture water views, dock access, and aerial perspectives',
        days_from_contract: -3,
        phase: 'Marketing Preparation'
      },
      {
        subject: 'Flood Zone Documentation',
        description: 'Obtain current flood zone certificate and flood insurance requirements documentation',
        days_from_contract: -2,
        phase: 'Documentation'
      },
      {
        subject: 'Hurricane Preparedness Report',
        description: 'Document all hurricane-rated features including impact windows, generator, elevation certificates',
        days_from_contract: -2,
        phase: 'Documentation'
      },
      {
        subject: 'Luxury Marketing Package Creation',
        description: 'Develop premium marketing materials highlighting waterfront lifestyle and luxury amenities',
        days_from_contract: 0,
        phase: 'Marketing Launch'
      },
      {
        subject: 'Marina and Boating Community Outreach',
        description: 'Market to local marina networks and boating communities for targeted exposure',
        days_from_contract: 1,
        phase: 'Specialized Marketing'
      }
    ]
  },
  {
    name: 'Military PCS Buyer Workflow',
    type: 'Buyer', // Changed from 'buyer' to 'Buyer'
    description: 'Streamlined workflow for military families with PCS timelines and VA loan requirements',
    tasks: [
      {
        subject: 'Military Welcome and Needs Assessment',
        description: 'Welcome call covering PCS timeline, family needs, base proximity requirements, and deployment considerations',
        days_from_contract: 0,
        phase: 'Initial Consultation'
      },
      {
        subject: 'VA Loan Pre-qualification Verification',
        description: 'Verify VA loan eligibility, entitlement, and connect with military-experienced lenders',
        days_from_contract: 1,
        phase: 'Financing'
      },
      {
        subject: 'Base Proximity and Commute Analysis',
        description: 'Provide detailed analysis of commute times to relevant military installations and traffic patterns',
        days_from_contract: 2,
        phase: 'Location Analysis'
      },
      {
        subject: 'School District Information Package',
        description: 'Compile school district ratings, military child programs, and enrollment procedures',
        days_from_contract: 3,
        phase: 'Family Services'
      },
      {
        subject: 'Hurricane Preparedness Education',
        description: 'Review hurricane season considerations, evacuation routes, and home preparation requirements',
        days_from_contract: 5,
        phase: 'Safety Education'
      },
      {
        subject: 'Military Spouse Network Introduction',
        description: 'Connect with local military spouse groups and base family services',
        days_from_contract: 7,
        phase: 'Community Integration'
      }
    ]
  },
  {
    name: 'Historic District Property Workflow',
    type: 'Listing', // Changed from 'listing' to 'Listing'
    description: 'Specialized workflow for historic properties in Ghent and other preservation districts',
    tasks: [
      {
        subject: 'Historic Property Documentation',
        description: 'Research property history, architectural significance, and historic district guidelines',
        days_from_contract: -7,
        phase: 'Historic Research'
      },
      {
        subject: 'Architectural Photography Specialist',
        description: 'Schedule photographer experienced in historic properties to highlight architectural details',
        days_from_contract: -5,
        phase: 'Photography'
      },
      {
        subject: 'Historic Preservation Compliance Review',
        description: 'Review any needed disclosures regarding historic preservation restrictions',
        days_from_contract: -3,
        phase: 'Compliance'
      },
      {
        subject: 'Historic Home Marketing Strategy',
        description: 'Develop marketing highlighting historic character while appealing to modern buyers',
        days_from_contract: -1,
        phase: 'Marketing Strategy'
      },
      {
        subject: 'Historic District Network Marketing',
        description: 'Market through historic preservation societies and architecture enthusiast networks',
        days_from_contract: 2,
        phase: 'Specialized Marketing'
      }
    ]
  }
];
