
// Enhanced Hampton Roads data with comprehensive client profiles and professional contacts
export const hamptonRoadsEnhancedClients = [
  // Military Buyers/Sellers with PCS Orders
  {
    full_name: 'Commander James & Sarah Mitchell',
    email: 'james.mitchell.navy@gmail.com',
    phone: '(757) 555-1001',
    type: 'buyer' as const,
    preferred_contact_method: 'email',
    referral_source: 'Naval Station Norfolk Military Housing Office',
    notes: 'Navy Commander with PCS orders to Norfolk Naval Base. Wife is a nurse at Sentara Norfolk General. Need home within 20 minutes of base, preferably with boat access. VA loan approved up to $750K. Deployment schedule requires flexible showing times. Hurricane preparedness features are priority.',
    military_branch: 'Navy',
    security_clearance: 'Secret',
    deployment_schedule: 'Deploying December 2024 for 6 months',
    va_loan_entitlement: 750000,
    base_assignment: 'Naval Station Norfolk',
    pcs_timeline: 'Report date: September 15, 2024'
  },
  {
    full_name: 'Master Sergeant Michael & Jennifer Hayes',
    email: 'mhayes.usaf@gmail.com',
    phone: '(757) 555-1003',
    type: 'buyer' as const,
    preferred_contact_method: 'text',
    referral_source: 'Joint Base Langley-Eustis Housing Office',
    notes: 'Air Force family relocating from Colorado Springs. Three school-age children need excellent schools. Prefer newer construction with storm safety features. VA loan pre-approved. Husband deploys frequently, wife handles most decisions. Need flood zone X or higher.',
    military_branch: 'Air Force',
    security_clearance: 'Top Secret',
    deployment_schedule: 'Home for 18 months',
    va_loan_entitlement: 500000,
    base_assignment: 'Joint Base Langley-Eustis',
    pcs_timeline: 'Report date: October 1, 2024',
    children_ages: [8, 12, 15],
    school_district_priority: 'High'
  },
  // Local Professionals
  {
    full_name: 'Dr. Patricia & Robert Thornton',
    email: 'patricia.thornton.md@evms.edu',
    phone: '(757) 555-1002',
    type: 'seller' as const,
    preferred_contact_method: 'phone',
    referral_source: 'EVMS Faculty Referral',
    notes: 'EVMS physician couple relocating to Johns Hopkins. Selling waterfront home in Larchmont. Want quick sale but need maximum value. Property has private dock and hurricane upgrades. Prefer weekday showings due to medical schedules.',
    profession: 'Medical - EVMS Faculty',
    work_schedule: 'Weekdays 7AM-6PM, On-call weekends',
    property_features: ['Private dock', 'Hurricane shutters', 'Elevation certificate', 'Generator'],
    timeline: 'Must close by December 31, 2024'
  },
  {
    full_name: 'Thomas & Rebecca Chen-Williams',
    email: 'thomas.chenwilliams@huntingtoningalls.com',
    phone: '(757) 555-1005',
    type: 'seller' as const,
    preferred_contact_method: 'email',
    referral_source: 'Newport News Shipbuilding Employee Referral',
    notes: 'Shipyard engineer and ODU professor couple. Upgrading to larger home for growing family. Current home is well-maintained with hurricane shutters and generator. Need coordination with purchase of new home.',
    profession: 'Shipyard Engineer / University Professor',
    work_schedule: 'Shift work - flexible evenings',
    property_features: ['Hurricane shutters', 'Backup generator', 'Flood zone X', 'Recently renovated'],
    timeline: 'Simultaneous close preferred'
  },
  // Military Retirees
  {
    full_name: 'Captain (Ret.) William & Margaret Foster',
    email: 'bill.foster.ret@navy.mil',
    phone: '(757) 555-1004',
    type: 'buyer' as const,
    preferred_contact_method: 'phone',
    referral_source: 'Military Retiree Association',
    notes: 'Navy retiree couple staying in Hampton Roads after 30-year career. Want waterfront retirement home with single-level living. Budget up to $1.2M. Interested in boating communities and proximity to military medical facilities.',
    military_branch: 'Navy (Retired)',
    retirement_date: 'July 2024',
    military_benefits: ['Tricare', 'VA disability', 'Military pension'],
    lifestyle_preferences: ['Waterfront', 'Boating', 'Golf', 'Single-level living'],
    medical_needs: 'Proximity to Portsmouth Naval Medical Center'
  },
  // Northern Transplants
  {
    full_name: 'David & Susan Richardson',
    email: 'drichardson@gmail.com',
    phone: '(757) 555-1009',
    type: 'buyer' as const,
    preferred_contact_method: 'email',
    referral_source: 'Corporate Relocation',
    notes: 'New York transplants seeking waterfront lifestyle. Husband is remote financial consultant, wife is artist. Want historic charm with modern amenities. Interested in Ghent district for walkability and culture. Budget $800K-1.2M.',
    previous_location: 'Westchester County, NY',
    work_situation: 'Remote work / Self-employed',
    lifestyle_preferences: ['Historic character', 'Walkable neighborhoods', 'Cultural amenities', 'Waterfront access'],
    timeline: 'Flexible - seeking perfect property'
  }
];

export const hamptonRoadsProfessionalContacts = {
  lenders: [
    {
      name: 'Sarah Thompson',
      company: 'Navy Federal Credit Union',
      title: 'Senior VA Loan Specialist',
      phone: '(757) 555-2001',
      email: 'sarah.thompson@navyfederal.org',
      specialties: ['VA Loans', 'Military Relocations', 'Jumbo VA Loans'],
      military_experience: 'Former Navy spouse',
      response_time: '2 hours',
      rating: 5.0,
      notes: 'Exceptional with military families. Understands deployment schedules and PCS timelines.'
    },
    {
      name: 'Mark Rodriguez',
      company: 'TowneBank Mortgage',
      title: 'Jumbo Loan Specialist',
      phone: '(757) 555-2002',
      email: 'mark.rodriguez@townebank.com',
      specialties: ['Jumbo Loans', 'Luxury Properties', 'Portfolio Lending'],
      experience_years: 12,
      response_time: '4 hours',
      rating: 4.8,
      notes: 'Expert in luxury waterfront financing. Strong relationships with private banking.'
    },
    {
      name: 'Jennifer Walsh',
      company: 'First Citizens Bank',
      title: 'FHA/VA Loan Manager',
      phone: '(757) 555-2003',
      email: 'jennifer.walsh@firstcitizens.com',
      specialties: ['FHA Loans', 'VA Loans', 'First-Time Buyers'],
      military_friendly: true,
      response_time: '3 hours',
      rating: 4.9,
      notes: 'Excellent with first-time military buyers. Explains process thoroughly.'
    }
  ],
  inspectors: [
    {
      name: 'Robert Chen',
      company: 'Tidewater Home Inspections',
      title: 'Certified Home Inspector',
      phone: '(757) 555-2101',
      email: 'robert.chen@tidewaterinspections.com',
      specialties: ['Hurricane Damage Assessment', 'Flood Zone Inspections', 'Waterfront Properties'],
      certifications: ['ASHI Certified', 'Hurricane Mitigation Specialist', 'Mold Assessment'],
      experience_years: 15,
      response_time: '24 hours',
      rating: 4.9,
      notes: 'Thorough waterfront inspector. Excellent hurricane preparedness reports.'
    },
    {
      name: 'Michael Davis',
      company: 'Coastal Property Inspections',
      title: 'Master Inspector',
      phone: '(757) 555-2102',
      email: 'michael.davis@coastalinspections.com',
      specialties: ['Luxury Homes', 'Historic Properties', 'Dock Inspections'],
      certifications: ['NAHI Certified', 'Pool/Spa Inspector', 'Historic Preservation'],
      experience_years: 20,
      response_time: '12 hours',
      rating: 5.0,
      notes: 'Specialized in luxury and historic properties. Detailed dock and waterfront assessments.'
    }
  ],
  attorneys: [
    {
      name: 'Patricia Williams',
      company: 'Williams & Associates',
      title: 'Real Estate Attorney',
      phone: '(757) 555-2201',
      email: 'patricia.williams@williamslawva.com',
      specialties: ['Military Real Estate', 'VA Loan Closings', 'PCS Complications'],
      military_experience: 'Former JAG Officer',
      response_time: '4 hours',
      rating: 4.9,
      notes: 'Former military attorney specializing in military real estate issues.'
    },
    {
      name: 'James Mitchell',
      company: 'Tidewater Title & Escrow',
      title: 'Closing Attorney',
      phone: '(757) 555-2202',
      email: 'james.mitchell@tidewattertitle.com',
      specialties: ['Luxury Closings', 'Waterfront Properties', 'Complex Transactions'],
      experience_years: 18,
      response_time: '2 hours',
      rating: 4.8,
      notes: 'Handles complex waterfront and luxury property closings efficiently.'
    }
  ],
  contractors: [
    {
      name: 'Hampton Roads Storm Solutions',
      contact: 'David Thompson',
      phone: '(757) 555-2301',
      email: 'david@hrstormsolutions.com',
      specialties: ['Hurricane Shutters', 'Generator Installation', 'Flood Mitigation'],
      certifications: ['Storm Certified', 'FEMA Approved', 'Licensed Electrician'],
      response_time: '6 hours',
      rating: 4.9,
      notes: 'Leading hurricane preparation contractor. Fast emergency response.'
    },
    {
      name: 'Waterfront Maintenance Pros',
      contact: 'Lisa Rodriguez',
      phone: '(757) 555-2302',
      email: 'lisa@waterfrontmaintenance.com',
      specialties: ['Dock Repair', 'Bulkhead Maintenance', 'Marine Construction'],
      certifications: ['Marine Contractor License', 'Chesapeake Bay Certified'],
      response_time: '4 hours',
      rating: 4.7,
      notes: 'Specialized in waterfront property maintenance and repair.'
    }
  ]
};

export const hamptonRoadsEnhancedCommunications = {
  emailThreads: [
    {
      subject: 'Hurricane Preparedness - Riverside Drive Property',
      participants: ['Patricia Williamson', 'Commander Mitchell', 'Sarah Mitchell'],
      messages: [
        {
          from: 'Patricia Williamson <patricia.williamson@bhhstowne.com>',
          to: 'Commander Mitchell <james.mitchell.navy@gmail.com>',
          cc: 'Sarah Mitchell <sarah.mitchell.rn@gmail.com>',
          timestamp: '2024-06-15 09:30:00',
          content: 'Commander Mitchell, with hurricane season approaching, I wanted to review the hurricane preparedness features of 2847 Riverside Drive. The property includes impact-resistant windows rated for 150mph winds, a 20kW whole-house generator with 7-day fuel capacity, and elevated construction 3 feet above flood zone requirements. The dock has been engineered to withstand Category 3 storms with reinforced pilings replaced in 2023.',
          attachments: ['Hurricane_Features_Riverside_Dr.pdf', 'Generator_Specs.pdf', 'Dock_Engineering_Report.pdf']
        },
        {
          from: 'Commander Mitchell <james.mitchell.navy@gmail.com>',
          to: 'Patricia Williamson <patricia.williamson@bhhstowne.com>',
          cc: 'Sarah Mitchell <sarah.mitchell.rn@gmail.com>',
          timestamp: '2024-06-15 11:45:00',
          content: 'Patricia, excellent information. As Navy personnel, we understand the importance of storm preparedness. Can you provide documentation on the generator capacity and flood insurance requirements? Also, what evacuation routes are recommended for this area? We need to ensure our family can safely evacuate if I\'m deployed during hurricane season.',
          attachments: []
        },
        {
          from: 'Patricia Williamson <patricia.williamson@bhhstowne.com>',
          to: 'Commander Mitchell <james.mitchell.navy@gmail.com>',
          cc: 'Sarah Mitchell <sarah.mitchell.rn@gmail.com>',
          timestamp: '2024-06-15 14:20:00',
          content: 'Commander, I\'ve attached the generator specifications showing full-house coverage including HVAC, all outlets, and hardwired systems. The property is in Flood Zone AE with a Base Flood Elevation of 8 feet - the house is built at 11 feet. For evacuation, you have three routes: Route 1: Hampton Blvd to I-64 West (primary), Route 2: Granby Street to I-264 West (alternate), Route 3: Military Highway to I-464 North (backup). I\'ve also included the Norfolk Emergency Management contact for military families.',
          attachments: ['Generator_Full_Specs.pdf', 'Evacuation_Routes_Map.pdf', 'Flood_Zone_Certificate.pdf', 'Military_Emergency_Contacts.pdf']
        }
      ]
    },
    {
      subject: 'VA Loan Coordination - Oceana Boulevard Property',
      participants: ['Sarah Thompson (Agent)', 'Master Sergeant Hayes', 'Sarah Thompson (Navy Federal)', 'Jennifer Hayes'],
      messages: [
        {
          from: 'Sarah Thompson <sarah.thompson@howardhanna.com>',
          to: 'Master Sergeant Hayes <mhayes.usaf@gmail.com>',
          cc: 'Jennifer Hayes <jhayes.spouse@gmail.com>',
          timestamp: '2024-06-18 08:30:00',
          content: 'Master Sergeant Hayes, I\'ve coordinated with Sarah Thompson at Navy Federal (your lender) regarding the Oceana Boulevard property. The VA appraisal is scheduled for Thursday, and all documentation is ready. Since you mentioned potential deployment, I\'ve ensured your wife Jennifer has power of attorney privileges for closing. The property is 0.8 miles from Oceana Naval Air Station main gate.',
          attachments: ['VA_Appraisal_Schedule.pdf', 'Power_of_Attorney_Forms.pdf']
        },
        {
          from: 'Sarah Thompson <sarah.thompson@navyfederal.org>',
          to: 'Master Sergeant Hayes <mhayes.usaf@gmail.com>',
          cc: 'Sarah Thompson <sarah.thompson@howardhanna.com>, Jennifer Hayes <jhayes.spouse@gmail.com>',
          timestamp: '2024-06-18 14:20:00',
          content: 'Master Sergeant Hayes, great news! Your VA loan has been approved for the full asking price of $425K for 1234 Oceana Boulevard. The property appraisal came in at $430K, and the VA inspection noted no required repairs. Your Certificate of Eligibility shows remaining entitlement of $325K after this purchase. We can proceed to closing as scheduled for July 15th. If deployment orders change, we have 30-day extension options available.',
          attachments: ['VA_Loan_Approval.pdf', 'Appraisal_Report.pdf', 'Remaining_Entitlement.pdf']
        }
      ]
    },
    {
      subject: 'Flood Zone Certification - Bayshore Lane',
      participants: ['David Rodriguez', 'Dr. Patricia Thornton', 'Flood Zone Specialist'],
      messages: [
        {
          from: 'David Rodriguez <david.rodriguez@cblegacy.com>',
          to: 'Dr. Patricia Thornton <patricia.thornton.md@evms.edu>',
          timestamp: '2024-06-20 10:15:00',
          content: 'Dr. Thornton, I\'ve completed the flood zone analysis for 1234 Bayshore Lane. The property is located in Zone VE (high-risk coastal area) which requires flood insurance. The elevation certificate shows the lowest floor is 2 feet above Base Flood Elevation, which is excellent for insurance rates. I\'ve contacted three insurance providers for quotes - annual premiums range from $1,200-$1,800 depending on coverage level.',
          attachments: ['Elevation_Certificate.pdf', 'Flood_Insurance_Quotes.pdf', 'FEMA_Flood_Map.pdf']
        }
      ]
    }
  ],
  phoneCallLogs: [
    {
      date: '2024-06-20',
      time: '14:30',
      duration: '25 minutes',
      participants: ['Michael Chen (Coordinator)', 'Dr. Patricia Thornton'],
      call_type: 'Listing Strategy Discussion',
      notes: 'Discussed listing strategy for Larchmont waterfront property at 789 Larchmont Crescent. Dr. Thornton emphasized need for quick sale due to Hopkins start date in January 2025. Reviewed comparative market analysis showing similar waterfront properties averaging 45 days on market. Recommended strategic pricing at $725K to attract multiple offers. Discussed staging recommendations to highlight water views and dock access. Dr. Thornton approved professional photography and drone videography. Concerned about hurricane season impact on showings - developed backup virtual tour strategy.',
      follow_up_actions: [
        'Schedule professional photography within 48 hours',
        'Prepare staging recommendations for water view emphasis',
        'Create virtual tour backup plan for hurricane season',
        'Provide CMA report with 6-month market projection'
      ],
      next_contact: '2024-06-22 (Photography coordination)'
    },
    {
      date: '2024-06-21',
      time: '09:00',
      duration: '18 minutes',
      participants: ['Jennifer Wilson (Agent)', 'Commander Mitchell', 'Sarah Mitchell'],
      call_type: 'Military Deployment Coordination',
      notes: 'Discussed showing flexibility for Ghent Historic District properties. Commander Mitchell\'s deployment schedule requires evening and weekend showings. Sarah (spouse) will handle most day showings. Family particularly interested in historic charm but needs modern updates for medical equipment (Sarah\'s nursing supplies). Discussed historic district renovation restrictions and pre-approved contractor list. Emphasized importance of hurricane-safe features and generator backup for medical equipment.',
      follow_up_actions: [
        'Provide historic district renovation guidelines',
        'Share pre-approved contractor contact list',
        'Schedule evening showings for properties of interest',
        'Research properties with medical equipment considerations'
      ],
      next_contact: '2024-06-23 (Property showing schedule)'
    },
    {
      date: '2024-06-22',
      time: '16:45',
      duration: '12 minutes',
      participants: ['Robert Martinez (Agent)', 'Captain Foster (Ret.)'],
      call_type: 'Retirement Home Consultation',
      notes: 'Discussed waterfront retirement home preferences. Captain Foster (Ret.) wants single-level living with water access for his boat. Wife Margaret needs proximity to Portsmouth Naval Medical Center for ongoing care. Budget up to $1.2M allows for luxury waterfront condos or ranch-style homes. Interested in boating communities with amenities. Discussed HOA fees vs maintenance responsibilities. Emphasized importance of military medical facility proximity and veteran community.',
      follow_up_actions: [
        'Research single-level waterfront properties',
        'Compile list of veteran-friendly communities',
        'Calculate commute times to Portsmouth Naval Medical',
        'Prepare marina access and boat slip availability report'
      ],
      next_contact: '2024-06-25 (Property tour planning)'
    }
  ],
  textThreads: [
    {
      date: '2024-06-22',
      participants: ['Jennifer Wilson (Agent)', 'Thomas Chen-Williams'],
      messages: [
        {
          time: '14:30',
          from: 'Jennifer Wilson',
          message: 'Thomas, the inspection report for 567 Colonial Avenue came back clean! Just minor items noted - loose handrail and GFCI outlet in master bath. Nothing major for a 1920s historic home.'
        },
        {
          time: '14:35',
          from: 'Thomas Chen-Williams',
          message: 'Excellent news! The handrail we can fix ourselves. When can we schedule the final walkthrough? Rebecca\'s schedule is tight with ODU classes.'
        },
        {
          time: '14:37',
          from: 'Jennifer Wilson',
          message: 'How about next Tuesday at 4 PM? That gives us time before the Friday closing and works with Rebecca\'s afternoon schedule.'
        },
        {
          time: '14:40',
          from: 'Thomas Chen-Williams',
          message: 'Perfect. Rebecca and I will both be there. Should we bring anything specific? Also, the shipyard approved my time off for closing.'
        },
        {
          time: '14:42',
          from: 'Jennifer Wilson',
          message: 'Just bring photo ID and any questions about the property. Great news about the time off approval! I\'ll send a walkthrough checklist later today.'
        }
      ]
    },
    {
      date: '2024-06-23',
      participants: ['Sarah Thompson (Agent)', 'Jennifer Hayes'],
      messages: [
        {
          time: '10:15',
          from: 'Jennifer Hayes',
          message: 'Sarah, Mike got his deployment orders. He\'s leaving earlier than expected - Oct 15th instead of Nov 1st. Does this affect our closing timeline?'
        },
        {
          time: '10:18',
          from: 'Sarah Thompson',
          message: 'We can definitely work with that! Our closing is scheduled for Oct 5th, so you\'ll have 10 days to settle in. I\'ll coordinate with the lender to ensure everything is ready.'
        },
        {
          time: '10:20',
          from: 'Jennifer Hayes',
          message: 'Thank you! That\'s a relief. The kids are excited about the new schools. Are you still able to help with the base housing coordination?'
        },
        {
          time: '10:25',
          from: 'Sarah Thompson',
          message: 'Absolutely! I\'ve already contacted the sponsor coordinator at Langley-Eustis. They\'ll help with base access and school enrollment. I\'ll send you the contact info.'
        }
      ]
    }
  ]
};
