
// Advanced Hampton Roads email templates and workflow enhancements
export const hamptonRoadsAdvancedEmailTemplates = [
  {
    name: 'Military PCS Welcome Package',
    category: 'Welcome',
    subject: 'Welcome to Hampton Roads - Your Military Relocation Specialists',
    body_html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">
          Welcome to Hampton Roads, {{client_name}}!
        </h2>
        
        <p>Thank you for choosing our services for your PCS move to the Hampton Roads area. As military family specialists with over 15 years of experience serving our military community, we understand the unique challenges and timeline pressures of military relocations.</p>
        
        <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">What Makes Us Different for Military Families:</h3>
          <ul style="line-height: 1.6;">
            <li>✓ VA Loan expertise and preferred lender network with same-day pre-approvals</li>
            <li>✓ Flexible scheduling around deployment and duty schedules</li>
            <li>✓ Deep knowledge of base proximity, commute times, and military-friendly communities</li>
            <li>✓ Hurricane preparedness guidance and flood zone expertise</li>
            <li>✓ School district information and military child program coordination</li>
            <li>✓ PCS timeline management with contingency planning</li>
          </ul>
        </div>
        
        <h3 style="color: #1e40af;">Your Dedicated Military Relocation Team:</h3>
        <p><strong>Primary Agent:</strong> {{agent_name}}<br>
        <strong>Transaction Coordinator:</strong> {{coordinator_name}}<br>
        <strong>Direct Phone:</strong> {{agent_phone}}<br>
        <strong>Emergency Contact:</strong> {{emergency_phone}}</p>
        
        <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #ea580c; margin-top: 0;">Critical Hampton Roads Military Information:</h3>
          <p><strong>Hurricane Season:</strong> June 1 - November 30<br>
          <small>We monitor all weather conditions and will proactively adjust timelines if needed</small></p>
          
          <p><strong>Base Commute Times (Normal/Rush Hour):</strong><br>
          • Naval Station Norfolk: 12/25 minutes<br>
          • Oceana Naval Air Station: 20/35 minutes<br>
          • Joint Base Langley-Eustis: 35/50 minutes<br>
          • Portsmouth Naval Shipyard: 18/30 minutes</p>
          
          <p><strong>Military Resources:</strong><br>
          We'll connect you with spouse groups, base services, and veteran communities</p>
          
          <p><strong>Flood Zones:</strong><br>
          We'll explain all flood insurance requirements and evacuation procedures</p>
        </div>
        
        <h3 style="color: #1e40af;">Your 30-Day Action Plan:</h3>
        <ol style="line-height: 1.8;">
          <li><strong>Days 1-3:</strong> Needs assessment and base proximity analysis</li>
          <li><strong>Days 4-7:</strong> School district research and enrollment coordination</li>
          <li><strong>Days 8-14:</strong> Property tours and neighborhood exploration</li>
          <li><strong>Days 15-21:</strong> Offer preparation and negotiation</li>
          <li><strong>Days 22-30:</strong> Contract to closing coordination</li>
        </ol>
        
        <p style="margin-top: 30px;">We're here to make your transition to Hampton Roads as smooth as possible. Your service to our country deserves nothing less than exceptional service from us.</p>
        
        <p style="color: #1e40af; font-weight: bold;">Semper Fi / Hooyah / Hooah / Semper Paratus,<br>{{agent_name}}<br>Your Hampton Roads Military Relocation Specialist</p>
      </div>
    `
  },
  {
    name: 'Waterfront Property Maintenance Guide',
    category: 'Property Care',
    subject: 'Your Complete Waterfront Property Maintenance Guide - {{property_address}}',
    body_html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0891b2; border-bottom: 2px solid #0891b2; padding-bottom: 10px;">
          Waterfront Living Maintenance Guide
        </h2>
        
        <p>Congratulations on your waterfront property purchase at {{property_address}}! Here's your comprehensive guide to maintaining your slice of Hampton Roads paradise:</p>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0891b2; margin-top: 0;">🏠 Your Property's Waterfront Features:</h3>
          <ul style="line-height: 1.6;">
            <li><strong>Dock Specifications:</strong> {{dock_details}}</li>
            <li><strong>Water Depth:</strong> {{water_depth}} at mean low tide</li>
            <li><strong>Bulkhead Type:</strong> {{bulkhead_type}}</li>
            <li><strong>Elevation:</strong> {{elevation_feet}} feet above sea level</li>
            <li><strong>Flood Zone:</strong> {{flood_zone}} ({{flood_zone_description}})</li>
          </ul>
        </div>
        
        <h3 style="color: #0891b2;">⚓ Monthly Maintenance Checklist:</h3>
        <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #0891b2; margin: 15px 0;">
          <h4>Dock & Marine Structures:</h4>
          <ul>
            <li>□ Inspect dock boards for loose nails or rot</li>
            <li>□ Check dock cleats and hardware for corrosion</li>
            <li>□ Examine piling caps and structural connections</li>
            <li>□ Clean marine growth from pilings and bulkhead</li>
            <li>□ Test dock lighting and electrical outlets (GFCI)</li>
          </ul>
          
          <h4>Home Exterior:</h4>
          <ul>
            <li>□ Rinse saltwater spray from windows and siding</li>
            <li>□ Inspect and clean gutters for salt buildup</li>
            <li>□ Check HVAC system for salt air impact</li>
            <li>□ Examine door and window seals</li>
            <li>□ Test hurricane shutters and storage</li>
          </ul>
        </div>
        
        <h3 style="color: #0891b2;">🌊 Seasonal Preparations:</h3>
        
        <h4>Hurricane Season (June - November):</h4>
        <ul style="line-height: 1.6;">
          <li>Install hurricane shutters or board-up materials</li>
          <li>Secure all outdoor furniture and decorations</li>
          <li>Test generator and ensure fuel supply</li>
          <li>Remove boat from water or secure in dry storage</li>
          <li>Trim trees and shrubs near house</li>
          <li>Review evacuation routes and emergency supplies</li>
        </ul>
        
        <h4>Winter Preparation:</h4>
        <ul style="line-height: 1.6;">
          <li>Winterize boat and dock equipment</li>
          <li>Inspect and seal any weather damage</li>
          <li>Service heating system for salt air conditions</li>
          <li>Check ice damage prevention for dock areas</li>
        </ul>
        
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #d97706; margin-top: 0;">🔧 Recommended Service Providers:</h3>
          <p><strong>Marine Contractors:</strong><br>
          Waterfront Maintenance Pros: (757) 555-2302<br>
          Chesapeake Marine Services: (757) 555-2304</p>
          
          <p><strong>Hurricane Preparation:</strong><br>
          Hampton Roads Storm Solutions: (757) 555-2301<br>
          Coastal Storm Protection: (757) 555-2305</p>
          
          <p><strong>HVAC (Salt Air Specialists):</strong><br>
          Coastal Climate Control: (757) 555-2306<br>
          Tidewater Air Solutions: (757) 555-2307</p>
        </div>
        
        <h3 style="color: #0891b2;">📋 Annual Professional Inspections:</h3>
        <ul style="line-height: 1.6;">
          <li>Dock structural inspection (recommended every 2 years)</li>
          <li>Bulkhead and shoreline assessment</li>
          <li>HVAC system deep cleaning and salt damage check</li>
          <li>Electrical system inspection (GFCIs and marine-rated components)</li>
          <li>Roof and siding inspection for salt damage</li>
        </ul>
        
        <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #16a34a; margin-top: 0;">🌱 Waterfront Landscaping Tips:</h3>
          <ul>
            <li>Choose salt-tolerant plants (recommendations available)</li>
            <li>Install proper drainage to prevent erosion</li>
            <li>Consider rain gardens for stormwater management</li>
            <li>Follow Chesapeake Bay Preservation Act guidelines</li>
          </ul>
        </div>
        
        <p><strong>Emergency Contacts:</strong><br>
        Your Agent: {{agent_name}} - {{agent_phone}}<br>
        Emergency Services: 911<br>
        Non-Emergency Marine Assistance: (757) 555-MARINE</p>
        
        <p>Enjoy your waterfront lifestyle! We're always here to help with any questions about maintaining your Hampton Roads waterfront property.</p>
        
        <p style="color: #0891b2; font-weight: bold;">Fair winds and following seas,<br>{{agent_name}}</p>
      </div>
    `
  },
  {
    name: 'Historic Ghent Property Guide',
    category: 'Property Info',
    subject: 'Your Historic Ghent Property Guide - Preservation & Living in Style',
    body_html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c2d12; border-bottom: 2px solid #7c2d12; padding-bottom: 10px;">
          Welcome to Historic Ghent District!
        </h2>
        
        <p>Congratulations on your purchase at {{property_address}} in Norfolk's prestigious Ghent Historic District! You're now part of a nationally recognized historic neighborhood that perfectly blends Victorian charm with modern Hampton Roads living.</p>
        
        <div style="background-color: #fef7f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #7c2d12; margin-top: 0;">🏛️ Your Home's Historic Significance:</h3>
          <p><strong>Built:</strong> {{construction_year}}<br>
          <strong>Architectural Style:</strong> {{architectural_style}}<br>
          <strong>Historic Designation:</strong> {{historic_designation}}<br>
          <strong>Original Features:</strong> {{original_features}}</p>
        </div>
        
        <h3 style="color: #7c2d12;">📋 Historic District Guidelines & Requirements:</h3>
        
        <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 15px 0;">
          <h4>⚠️ Architectural Review Board Approval Required For:</h4>
          <ul style="line-height: 1.6;">
            <li>Any exterior modifications or additions</li>
            <li>Window or door replacements</li>
            <li>Roof material changes</li>
            <li>Fence installation or modifications</li>
            <li>Signage or exterior lighting</li>
            <li>Landscaping that affects historic character</li>
          </ul>
        </div>
        
        <h4>🎨 Approved Historic Color Palette:</h4>
        <ul style="line-height: 1.6;">
          <li><strong>Body Colors:</strong> Cream, soft yellow, sage green, historic white</li>
          <li><strong>Trim Colors:</strong> Classic white, deep green, burgundy, navy blue</li>
          <li><strong>Accent Colors:</strong> Deep red, forest green, historic gold</li>
        </ul>
        
        <h4>🪟 Window Replacement Guidelines:</h4>
        <p>Original windows should be restored when possible. If replacement is necessary:</p>
        <ul style="line-height: 1.6;">
          <li>Must maintain original proportions and grid patterns</li>
          <li>Wood or wood-clad preferred materials</li>
          <li>Storm windows should be minimal and unobtrusive</li>
          <li>Energy efficiency improvements must preserve historic appearance</li>
        </ul>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">🌟 Ghent District Lifestyle Amenities:</h3>
          
          <h4>Within Walking Distance:</h4>
          <ul style="line-height: 1.6;">
            <li>🌺 Norfolk Botanical Garden (0.5 miles)</li>
            <li>🎨 Chrysler Museum of Art (0.8 miles)</li>
            <li>🍽️ Colley Avenue Restaurant District (0.3 miles)</li>
            <li>🛍️ Ghent Business District shops (0.4 miles)</li>
            <li>🏛️ Hermitage Museum & Gardens (1.2 miles)</li>
            <li>🌊 Elizabeth River waterfront (0.7 miles)</li>
          </ul>
          
          <h4>Community Events & Traditions:</h4>
          <ul>
            <li>Historic Ghent Home & Garden Tour (April)</li>
            <li>Ghent Night Market (Monthly, April-October)</li>
            <li>Holiday Historic Home Tours (December)</li>
            <li>Neighborhood Association meetings (First Thursday monthly)</li>
          </ul>
        </div>
        
        <h3 style="color: #7c2d12;">🔧 Recommended Historic Preservation Specialists:</h3>
        
        <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #7c2d12; margin: 15px 0;">
          <p><strong>Historic Preservation Contractor:</strong><br>
          Heritage Restoration Services: (757) 555-2401<br>
          <em>Specializes in Victorian-era restoration</em></p>
          
          <p><strong>Period-Appropriate Landscaping:</strong><br>
          Historic Gardens of Hampton Roads: (757) 555-2402<br>
          <em>Expert in historic landscape design</em></p>
          
          <p><strong>Antique Window Restoration:</strong><br>
          Tidewater Window Works: (757) 555-2403<br>
          <em>Certified in historic window restoration</em></p>
          
          <p><strong>Period Paint & Finishes:</strong><br>
          Historic Finishes Specialists: (757) 555-2404<br>
          <em>Authentic historic paint colors and techniques</em></p>
        </div>
        
        <h3 style="color: #7c2d12;">📞 Important Contacts:</h3>
        <ul style="line-height: 1.6;">
          <li><strong>Historic Preservation Office:</strong> (757) 664-4752</li>
          <li><strong>Architectural Review Board:</strong> (757) 664-4356</li>
          <li><strong>Ghent Neighborhood Association:</strong> (757) 555-GHENT</li>
          <li><strong>Norfolk Historic Preservation Society:</strong> (757) 625-1720</li>
        </div>
        
        <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #16a34a; margin-top: 0;">💡 Living Tips for Historic Homes:</h3>
          <ul style="line-height: 1.6;">
            <li>Document any original features you discover during renovations</li>
            <li>Keep detailed records of all preservation work for future owners</li>
            <li>Consider energy efficiency upgrades that preserve historic character</li>
            <li>Join the Ghent Neighborhood Association for community support</li>
            <li>Take advantage of historic preservation tax credits for major renovations</li>
          </ul>
        </div>
        
        <p>Your home is part of Hampton Roads' rich history. We're here to help you preserve and enjoy this architectural treasure while making it perfectly suited for modern living.</p>
        
        <p style="color: #7c2d12; font-weight: bold;">Preserving history, creating memories,<br>{{agent_name}}<br>Your Historic Ghent Specialist</p>
      </div>
    `
  }
];

export const hamptonRoadsAdvancedWorkflowTemplates = [
  {
    name: 'White Glove Waterfront Listing - Complete',
    type: 'Listing', // Changed from 'listing' to 'Listing'
    description: 'Comprehensive 25-task workflow for luxury waterfront properties requiring premium marketing, specialized disclosures, and concierge-level service',
    tasks: [
      {
        subject: 'Initial Luxury Property Assessment & Photography Planning',
        description: 'Complete detailed assessment including dock condition, bulkhead status, flood zone verification, hurricane preparedness features, and coordinate with luxury photography team for optimal lighting and tide conditions',
        days_from_contract: -10,
        phase: 'Pre-Listing Assessment'
      },
      {
        subject: 'Professional Marine & Aerial Photography Session',
        description: 'Execute comprehensive photography including drone footage, sunset/sunrise shots, dock and water access, interior luxury features, and 360-degree virtual tour creation',
        days_from_contract: -8,
        phase: 'Marketing Preparation'
      },
      {
        subject: 'Luxury Property Staging Consultation',
        description: 'Coordinate with luxury staging specialist to enhance waterfront views, highlight outdoor entertainment areas, and create aspirational waterfront lifestyle presentation',
        days_from_contract: -7,
        phase: 'Property Preparation'
      },
      {
        subject: 'Comprehensive Waterfront Documentation Package',
        description: 'Compile flood zone certificate, elevation certificate, dock engineering reports, marina access agreements, hurricane features documentation, and waterfront lifestyle amenities guide',
        days_from_contract: -6,
        phase: 'Documentation'
      },
      {
        subject: 'Premium Marketing Package Development',
        description: 'Create luxury marketing materials including professional brochures, virtual tours, social media content, and targeted advertising campaigns for high-net-worth individuals',
        days_from_contract: -5,
        phase: 'Marketing Creation'
      },
      {
        subject: 'Luxury Network & Marina Community Marketing Launch',
        description: 'Launch marketing through luxury networks, yacht clubs, marina communities, and affluent neighborhood associations',
        days_from_contract: -3,
        phase: 'Specialized Marketing'
      },
      {
        subject: 'MLS & Premium Portal Listings',
        description: 'List on MLS with premium placement, luxury real estate portals, and exclusive buyer networks',
        days_from_contract: 0,
        phase: 'Market Launch'
      },
      {
        subject: 'Luxury Showing Coordination & Concierge Services',
        description: 'Coordinate private showings with luxury amenities, provide waterfront lifestyle consultations, and offer concierge services for out-of-town buyers',
        days_from_contract: 1,
        phase: 'Showing Management'
      },
      {
        subject: 'Weekly Luxury Market Analysis & Strategy Review',
        description: 'Analyze luxury market conditions, showing feedback, and adjust pricing or marketing strategy as needed',
        days_from_contract: 7,
        phase: 'Ongoing Marketing'
      },
      {
        subject: 'Offer Presentation & Negotiation Strategy',
        description: 'Present all offers with detailed analysis, coordinate with luxury buyers\' representatives, and manage complex negotiation processes',
        days_from_contract: 14,
        phase: 'Offer Management'
      }
    ]
  },
  {
    name: 'Military PCS Buyer - Expedited',
    type: 'Buyer', // Changed from 'buyer' to 'Buyer'
    description: 'Streamlined 15-task workflow specifically designed for military families with tight PCS timelines, VA loan coordination, and base proximity requirements',
    tasks: [
      {
        subject: 'Military Welcome Call & Needs Assessment',
        description: 'Comprehensive welcome call covering PCS timeline, family needs, base proximity requirements, deployment considerations, spouse employment, and children\'s school needs',
        days_from_contract: 0,
        phase: 'Initial Military Consultation'
      },
      {
        subject: 'VA Loan Coordination & Military Lender Connection',
        description: 'Verify VA loan eligibility and entitlement, connect with military-experienced lenders, coordinate with military pay and LES documentation',
        days_from_contract: 1,
        phase: 'Military Financing'
      },
      {
        subject: 'Base Proximity Analysis & Commute Planning',
        description: 'Provide detailed analysis of commute times to relevant military installations, traffic patterns, and backup routes during base exercises or emergencies',
        days_from_contract: 2,
        phase: 'Location Strategy'
      },
      {
        subject: 'Military Family School District Package',
        description: 'Compile school district ratings, military child programs, special needs support, and enrollment procedures including military records transfer',
        days_from_contract: 3,
        phase: 'Family Services'
      },
      {
        subject: 'Hurricane Preparedness & Emergency Planning',
        description: 'Review hurricane season considerations, evacuation routes, emergency supplies, and home preparation requirements specific to military families',
        days_from_contract: 4,
        phase: 'Safety Planning'
      },
      {
        subject: 'Property Tour Strategy & Scheduling',
        description: 'Develop efficient property tour schedule accommodating military duty schedules, include virtual tours for deployed spouses, and prioritize military-friendly neighborhoods',
        days_from_contract: 5,
        phase: 'Property Search'
      },
      {
        subject: 'Military Community Integration Package',
        description: 'Connect with local military spouse groups, base family services, and veteran communities for social support network',
        days_from_contract: 7,
        phase: 'Community Integration'
      },
      {
        subject: 'Offer Strategy & Military Contingencies',
        description: 'Develop competitive offer strategy including military contingencies, PCS timeline considerations, and deployment clause options',
        days_from_contract: 10,
        phase: 'Offer Preparation'
      },
      {
        subject: 'Military Inspection Coordination',
        description: 'Schedule inspections with military-experienced inspectors, coordinate around duty schedules, and provide detailed reports for remote spouse review',
        days_from_contract: 12,
        phase: 'Due Diligence'
      },
      {
        subject: 'VA Appraisal Management',
        description: 'Coordinate VA appraisal process, manage timeline for PCS requirements, and handle any value issues with VA-approved methods',
        days_from_contract: 15,
        phase: 'Appraisal Process'
      },
      {
        subject: 'Military Closing Coordination',
        description: 'Coordinate closing around military schedules, arrange power of attorney if needed for deployed spouse, and ensure smooth transition',
        days_from_contract: 25,
        phase: 'Closing Preparation'
      },
      {
        subject: 'Post-Closing Military Support',
        description: 'Provide post-closing support including utility connections, base registration assistance, and ongoing community resource referrals',
        days_from_contract: 30,
        phase: 'Military Transition'
      }
    ]
  }
];
