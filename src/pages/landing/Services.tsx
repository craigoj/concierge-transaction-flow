
import React, { useState } from 'react';
import LandingHeader from '@/components/landing/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, Sparkles, Target, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const Services = () => {
  const navigate = useNavigate();
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  const buyerTiers = [
    {
      id: 'buyer-core',
      title: 'Buyer Core',
      price: '$545',
      description: 'Full Service TC',
      features: [
        'Broker Paperwork Prep',
        'Contract Writing',
        'Compliance',
        'Email Communication',
        'Timeline Management',
        'Inspection Scheduling',
        'Utility Transfer Guide',
        'Closing Client Surveys',
        'Agent Portal'
      ]
    },
    {
      id: 'buyer-elite',
      title: 'Buyer Elite',
      price: '$595',
      description: 'Additional Services',
      features: [
        'Social Media Posts',
        'Move In Clean Coordination',
        'Welcome to City Guide',
        'Taking Care of Your Home Guide'
      ]
    },
    {
      id: 'white-glove-buyer',
      title: 'White-Glove Buyer',
      price: '$895',
      description: 'Additional Services',
      features: [
        'Priority Showing Assistant Coordination',
        'Custom Closing Gift',
        'Welcome Home Celebration Install',
        'Post Closing Touchpoints'
      ]
    }
  ];

  const listingTiers = [
    {
      id: 'listing-core',
      title: 'Listing Core',
      price: '$645',
      description: 'Full Service TC',
      features: [
        'Listing and Broker Paperwork Prep',
        'MLS Management',
        'Compliance',
        'Photo and Staging Coordination',
        'Email Communication',
        'Timeline Management',
        'Inspection Scheduling',
        'Closing Client Surveys',
        'Agent Portal'
      ]
    },
    {
      id: 'listing-elite',
      title: 'Listing Elite',
      price: '$695',
      description: 'Additional Services',
      features: [
        'Social Media Posts',
        'Property Prep Coordination (Lawn Care, Cleaning)',
        'Market-Ready Prep Checklist',
        'Move Out Clean Coordination'
      ]
    },
    {
      id: 'white-glove-listing',
      title: 'White-Glove Listing',
      price: '$995',
      description: 'Additional Services',
      features: [
        'Lockbox Install and Pickup',
        'For Sale Sign Install and Pickup',
        'Priority Open House Hosting',
        'Custom Closing Gift and Delivery',
        'Post Closing Touchpoints'
      ]
    }
  ];

  const onDemandServices = [
    { service: 'Compliance Only', price: '$100' },
    { service: 'Lockbox Install or Pickup', price: '$35' },
    { service: 'For Sale Sign Install', price: '$75' },
    { service: 'Open House Set Up', price: '$95', note: 'Directional Signs, Printed Flyers, Indoor Prop, Light Snack and Drink Station' },
    { service: 'Welcome Home Celebration Install', price: '$150', note: 'Oversized Balloon Display, Champagne & Glasses' },
    { service: 'Mobile Notary Closing at Home', price: '$175' }
  ];

  const memberAccess = [
    'Open House Host Network',
    'Showing Support Network',
    'New Agent Coaching',
    'Agent Workshops',
    'Trusted Vendor Connections'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-background via-brand-cream to-brand-background">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-background/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
          <div className="space-y-6">
            <div className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full border border-brand-taupe/40 mb-4">
              <span className="text-sm font-brand-heading tracking-brand-wide text-brand-charcoal/70 uppercase">
                SERVICE TIERS
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-charcoal leading-tight">
              STRATEGIC SUPPORT
              <br />
              <span className="text-brand-taupe-dark">THAT SCALES.</span>
            </h1>
            <div className="w-24 h-px bg-brand-taupe mx-auto mb-6"></div>
            <p className="text-lg text-brand-charcoal/80 font-brand-body max-w-4xl mx-auto leading-relaxed">
              Our tiered service options are designed to grow with you - from foundational support 
              to fully personalized, white-glove coordination. Explore the package that meets your 
              current volume, client load, and business goals.
            </p>
          </div>
        </div>
      </section>

      {/* Buyer Service Tiers */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-4">
              BUYER SERVICES
            </h2>
            <div className="w-20 h-px bg-brand-taupe mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {buyerTiers.map((tier) => (
              <Card 
                key={tier.id}
                className={cn(
                  "card-brand group cursor-pointer transition-all duration-300",
                  tier.id === 'white-glove-buyer' && "ring-2 ring-brand-taupe-dark",
                  hoveredTier === tier.id && "scale-105 shadow-brand-elevation"
                )}
                onMouseEnter={() => setHoveredTier(tier.id)}
                onMouseLeave={() => setHoveredTier(null)}
                onClick={() => navigate('/contact')}
              >
                <CardContent className="p-6">
                  {tier.id === 'white-glove-buyer' && (
                    <div className="bg-brand-taupe-dark text-brand-background text-xs font-brand-heading px-3 py-1 rounded-full mb-4 inline-block">
                      PREMIUM
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-brand-heading font-semibold tracking-brand-wide uppercase text-brand-charcoal mb-2">
                      {tier.title}
                    </h3>
                    <div className="text-3xl font-bold text-brand-charcoal mb-2">{tier.price}</div>
                    <p className="text-brand-charcoal/70 font-brand-body text-sm">{tier.description}</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start text-sm">
                        <Check className="h-4 w-4 mr-3 text-brand-taupe-dark flex-shrink-0 mt-0.5" />
                        <span className="text-brand-charcoal/80 font-brand-body">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-center text-sm text-brand-taupe-dark font-medium group-hover:text-brand-charcoal transition-colors">
                    Book Consultation <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Listing Service Tiers */}
      <section className="py-16 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-4">
              LISTING SERVICES
            </h2>
            <div className="w-20 h-px bg-brand-taupe mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listingTiers.map((tier) => (
              <Card 
                key={tier.id}
                className={cn(
                  "card-brand group cursor-pointer transition-all duration-300",
                  tier.id === 'white-glove-listing' && "ring-2 ring-brand-taupe-dark",
                  hoveredTier === tier.id && "scale-105 shadow-brand-elevation"
                )}
                onMouseEnter={() => setHoveredTier(tier.id)}
                onMouseLeave={() => setHoveredTier(null)}
                onClick={() => navigate('/contact')}
              >
                <CardContent className="p-6">
                  {tier.id === 'white-glove-listing' && (
                    <div className="bg-brand-taupe-dark text-brand-background text-xs font-brand-heading px-3 py-1 rounded-full mb-4 inline-block">
                      PREMIUM
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-brand-heading font-semibold tracking-brand-wide uppercase text-brand-charcoal mb-2">
                      {tier.title}
                    </h3>
                    <div className="text-3xl font-bold text-brand-charcoal mb-2">{tier.price}</div>
                    <p className="text-brand-charcoal/70 font-brand-body text-sm">{tier.description}</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start text-sm">
                        <Check className="h-4 w-4 mr-3 text-brand-taupe-dark flex-shrink-0 mt-0.5" />
                        <span className="text-brand-charcoal/80 font-brand-body">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-center text-sm text-brand-taupe-dark font-medium group-hover:text-brand-charcoal transition-colors">
                    Book Consultation <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* On-Demand Services */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-4">
              ON-DEMAND SERVICES
            </h2>
            <div className="w-20 h-px bg-brand-taupe mx-auto"></div>
          </div>
          
          <Card className="card-brand">
            <CardContent className="p-8">
              <div className="bg-brand-taupe-dark text-brand-background p-8 rounded-lg">
                <div className="grid md:grid-cols-2 gap-6">
                  {onDemandServices.map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-brand-body text-brand-background">{item.service}</span>
                        <span className="font-brand-heading font-semibold text-brand-background">{item.price}</span>
                      </div>
                      {item.note && (
                        <p className="text-sm text-brand-background/80 font-brand-body italic">{item.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Beyond The Transaction */}
      <section className="py-16 bg-white/60 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-4 uppercase">
              Beyond The Transaction
            </h2>
            <div className="w-20 h-px bg-brand-taupe mx-auto mb-6"></div>
            <h3 className="text-xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-8 uppercase">
              All Member Access
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberAccess.map((service, index) => (
              <Card key={index} className="card-brand text-center group hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-brand-elevation transition-all duration-300">
                    {index === 0 && <Sparkles className="h-8 w-8 text-brand-charcoal" />}
                    {index === 1 && <Users className="h-8 w-8 text-brand-charcoal" />}
                    {index === 2 && <Target className="h-8 w-8 text-brand-charcoal" />}
                    {index === 3 && <Clock className="h-8 w-8 text-brand-charcoal" />}
                    {index === 4 && <Check className="h-8 w-8 text-brand-charcoal" />}
                  </div>
                  <h3 className="font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide text-sm">
                    {service}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* The Concierge Network */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-6 uppercase">
              The Concierge Network
            </h2>
            <div className="w-20 h-px bg-brand-taupe mx-auto"></div>
          </div>
          
          <Card className="card-brand">
            <CardContent className="p-8">
              <div className="space-y-6 font-brand-body text-brand-charcoal/80 leading-relaxed">
                <p className="text-lg">
                  At The Agent Concierge, we believe strategic support should extend beyond the contract. 
                  That's why we've cultivated a growing network of local licensed agents across the Hampton Roads 
                  area to provide seamless assistance when your time is needed elsewhere.
                </p>
                
                <div className="grid md:grid-cols-2 gap-8 mt-8">
                  <div>
                    <h4 className="font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-3 uppercase">
                      Showing Support
                    </h4>
                    <p className="text-sm leading-relaxed">
                      Need help covering a buyer showing? Simply let us know, and we'll reach out to our network 
                      to coordinate a match. You'll pay a straightforward, per-door fee once confirmed. Every showing 
                      assistant receives clear guidance to ensure a professional, respectful, and efficient experience 
                      for your client.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-3 uppercase">
                      Open House Hosting
                    </h4>
                    <p className="text-sm leading-relaxed">
                      Looking to generate momentum around a listing without giving up your weekend? We'll connect 
                      you with a local agent excited to host and represent your brand with care. All of our hosts 
                      receive guidance on how to conduct an effective, professional, and successful open house.
                    </p>
                  </div>
                </div>
                
                <p className="text-center text-brand-charcoal/70 italic mt-8">
                  While availability may vary, our expanding network offers flexible, coordinated solutions 
                  that help you protect your time - without compromising service.
                </p>
              </div>
              
              <div className="border-t border-brand-taupe/50 pt-8 mt-8 text-center">
                <h4 className="font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-2 uppercase">
                  Interested in Showing or Hosting Opportunities?
                </h4>
                <p className="font-brand-body text-brand-charcoal/70 mb-6 text-sm">
                  Licensed agents can request to join our network and get notified when opportunities become available.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/contact')}
                  className="group"
                >
                  Reach Out
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="bg-brand-charcoal text-brand-background py-12">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-6 p-2">
              <img 
                src="/lovable-uploads/5daf1e7a-db5b-46d0-bd10-afb6f64213b2.png"
                alt="The Agent Concierge Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-xl font-brand-heading font-semibold tracking-brand-wide mb-2">
              THE AGENT CONCIERGE LLC
            </h3>
            <p className="text-brand-background/70 font-brand-body mb-4 text-base">
              REALTOR SUPPORT & SUCCESS CO.
            </p>
            <div className="w-20 h-px bg-brand-taupe mx-auto mb-4"></div>
            <p className="text-brand-background/60 font-brand-body italic text-base">
              "Excellence is Intentional."
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Services;
