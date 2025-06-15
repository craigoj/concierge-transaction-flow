
import React, { useState, useEffect } from 'react';
import LandingHeader from '@/components/landing/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Users, Target, Sparkles, Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const Home = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);
  const [hoveredService, setHoveredService] = useState<number | null>(null);

  const features = [
    {
      title: "White-Glove Coordination",
      description: "Strategic transaction management that elevates every client interaction",
      icon: Sparkles,
      color: "from-amber-100 to-orange-100",
      benefits: ["Premium client experiences", "Strategic coordination", "Brand elevation"]
    },
    {
      title: "Time Freedom Creation", 
      description: "Structured systems that give you hours back for relationship building",
      icon: Clock,
      color: "from-blue-100 to-indigo-100",
      benefits: ["Reclaim 15+ hours/week", "Focus on relationships", "Scale efficiently"]
    },
    {
      title: "Network Leverage",
      description: "Access our curated professional network across Hampton Roads",
      icon: Users,
      color: "from-green-100 to-emerald-100",
      benefits: ["Trusted vendor network", "Local expertise", "Instant connections"]
    },
    {
      title: "Scalable Growth",
      description: "Business infrastructure that grows with your ambitions",
      icon: Target,
      color: "from-purple-100 to-pink-100",
      benefits: ["Systematic processes", "Growth-ready systems", "Strategic scaling"]
    }
  ];

  const premiumServices = [
    {
      tier: "Core",
      price: "$445",
      highlight: false,
      features: ["Full Service TC", "Contract Writing", "Timeline Management", "Inspection Scheduling"]
    },
    {
      tier: "Elite", 
      price: "$695",
      highlight: true,
      features: ["Everything in Core", "Social Media Posts", "Move Coordination", "City Guides"]
    },
    {
      tier: "White-Glove",
      price: "$895",
      highlight: false,
      features: ["Everything in Elite", "Priority Support", "Custom Gifts", "Post-Closing Care"]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = features[activeFeature].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-background via-brand-cream to-brand-background">
      <LandingHeader />
      
      {/* Hero Section - Reduced spacing, more premium feel */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-background/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Enhanced messaging */}
            <div className="space-y-6">
              <div className="space-y-5">
                <div className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full border border-brand-taupe/40">
                  <span className="text-sm font-brand-heading tracking-brand-wide text-brand-charcoal/70 uppercase">
                    REALTOR SUPPORT & SUCCESS CO.
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-charcoal leading-tight">
                  EXCELLENCE IS
                  <br />
                  <span className="text-brand-taupe-dark">INTENTIONAL.</span>
                </h1>
                <p className="text-lg text-brand-charcoal/80 leading-relaxed max-w-lg font-brand-body">
                  for agents who treat service like strategy
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="brand" 
                  size="lg"
                  className="text-base px-8 py-4 group"
                  onClick={() => navigate('/contact')}
                >
                  BOOK A CONSULTATION
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-base px-8 py-4"
                  onClick={() => navigate('/services')}
                >
                  EXPLORE SERVICES
                </Button>
              </div>
            </div>

            {/* Right Column - Interactive Feature Showcase */}
            <div className="relative">
              <div className="relative z-10">
                <Card className="card-brand p-6 mb-4">
                  <CardContent className="p-0">
                    <div className="flex items-start space-x-4 mb-5">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${features[activeFeature].color} flex items-center justify-center flex-shrink-0`}>
                        <CurrentIcon className="h-7 w-7 text-brand-charcoal" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-2">
                          {features[activeFeature].title}
                        </h3>
                        <p className="text-brand-charcoal/70 font-brand-body text-sm leading-relaxed mb-3">
                          {features[activeFeature].description}
                        </p>
                        <div className="space-y-1">
                          {features[activeFeature].benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center text-xs text-brand-charcoal/60">
                              <Check className="h-3 w-3 mr-2 text-brand-taupe-dark" />
                              {benefit}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Feature indicators */}
                    <div className="flex space-x-2">
                      {features.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveFeature(index)}
                          className={cn(
                            'h-2 rounded-full transition-all duration-300',
                            index === activeFeature
                              ? 'w-8 bg-brand-taupe-dark'
                              : 'w-2 bg-brand-taupe/50 hover:bg-brand-taupe'
                          )}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Professional workspace image */}
                <div className="aspect-[5/3] rounded-xl overflow-hidden shadow-brand-elevation">
                  <img 
                    src="/lovable-uploads/79d45d82-d96c-4867-a70b-9dfb661b73d9.png"
                    alt="Professional workspace representing excellence in real estate"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Background decoration - smaller, more subtle */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-brand-taupe/20 to-brand-taupe-dark/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-brand-taupe-light/30 to-brand-taupe/30 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Service Tiers Preview - New Section */}
      <section className="py-16 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-4">
              SERVICE TIER PREVIEW
            </h2>
            <p className="text-brand-charcoal/70 font-brand-body max-w-2xl mx-auto">
              Strategic support designed to scale with your success
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {premiumServices.map((service, index) => (
              <Card 
                key={index}
                className={cn(
                  "card-brand text-center group cursor-pointer transition-all duration-300",
                  service.highlight ? "ring-2 ring-brand-taupe-dark transform scale-105" : "hover:scale-102",
                  hoveredService === index && "shadow-brand-elevation"
                )}
                onMouseEnter={() => setHoveredService(index)}
                onMouseLeave={() => setHoveredService(null)}
                onClick={() => navigate('/services')}
              >
                <CardContent className="p-6">
                  {service.highlight && (
                    <div className="bg-brand-taupe-dark text-brand-background text-xs font-brand-heading px-3 py-1 rounded-full mb-4 inline-block">
                      MOST POPULAR
                    </div>
                  )}
                  <h3 className="text-lg font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-2">
                    {service.tier}
                  </h3>
                  <div className="text-2xl font-bold text-brand-charcoal mb-4">{service.price}</div>
                  <div className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-brand-charcoal/70">
                        <Check className="h-3 w-3 mr-2 text-brand-taupe-dark flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center text-sm text-brand-taupe-dark font-medium group-hover:text-brand-charcoal transition-colors">
                    View Details <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Partnership Section - Tightened spacing */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-4">
              BEYOND TRANSACTION MANAGEMENT
            </h2>
            <div className="w-24 h-px bg-brand-taupe mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="card-brand text-center group hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-brand-elevation transition-all duration-300">
                  <Sparkles className="h-8 w-8 text-brand-charcoal" />
                </div>
                <h3 className="text-lg font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-3">
                  WHITE-GLOVE EXPERIENCE
                </h3>
                <p className="font-brand-body text-brand-charcoal/70 leading-relaxed text-sm">
                  We don't just manage paperwork. We orchestrate exceptional client experiences that reflect your premium brand.
                </p>
              </CardContent>
            </Card>

            <Card className="card-brand text-center group hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-brand-elevation transition-all duration-300">
                  <Target className="h-8 w-8 text-brand-charcoal" />
                </div>
                <h3 className="text-lg font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-3">
                  STRATEGIC GROWTH
                </h3>
                <p className="font-brand-body text-brand-charcoal/70 leading-relaxed text-sm">
                  Scalable systems and processes that grow with your business, not basic administrative support.
                </p>
              </CardContent>
            </Card>

            <Card className="card-brand text-center group hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-brand-elevation transition-all duration-300">
                  <Clock className="h-8 w-8 text-brand-charcoal" />
                </div>
                <h3 className="text-lg font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-3">
                  TIME FREEDOM
                </h3>
                <p className="font-brand-body text-brand-charcoal/70 leading-relaxed text-sm">
                  Reclaim hours to focus on what matters: building relationships and growing your practice.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Value Proposition - Refined spacing and typography */}
      <section className="py-16 bg-white/60 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="space-y-6 font-brand-body text-lg text-brand-charcoal/80 leading-relaxed">
            <p className="text-xl font-medium text-brand-charcoal">
              At The Agent Concierge, we don't just manage paperwork.
            </p>
            <p>
              We streamline transactions, orchestrate client experiences, and 
              build the infrastructure that helps agents focus on what matters most: 
              serving clients with clarity and confidence.
            </p>
            <p className="text-lg font-medium italic text-brand-taupe-dark">
              You've built something special. Let's make it exceptional.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Service Preview - Redesigned */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-3">
              WHITE-GLOVE TRANSACTION COORDINATION
              <br />
              AND CUSTOMER EXPERIENCE
            </h2>
            <p className="text-brand-charcoal/70 text-base font-brand-body tracking-wide">
              LOCAL TO HAMILTON ROADS, VIRGINIA
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="card-brand group hover:scale-105 transition-all duration-300 cursor-pointer" 
                  onClick={() => navigate('/contact')}>
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:shadow-md transition-all duration-300">
                  <span className="text-xl">📞</span>
                </div>
                <h3 className="font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-2 text-sm">
                  CONSULTATION
                </h3>
                <p className="font-brand-body text-brand-charcoal/70 text-xs">
                  Strategic partnership discussion
                </p>
              </CardContent>
            </Card>

            <Card className="card-brand group hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate('/services')}>
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:shadow-md transition-all duration-300">
                  <span className="text-xl">📊</span>
                </div>
                <h3 className="font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-2 text-sm">
                  SERVICE TIERS
                </h3>
                <p className="font-brand-body text-brand-charcoal/70 text-xs">
                  Explore our comprehensive offerings
                </p>
              </CardContent>
            </Card>

            <Card className="card-brand group hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => window.open('https://instagram.com', '_blank')}>
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:shadow-md transition-all duration-300">
                  <span className="text-xl">📸</span>
                </div>
                <h3 className="font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-2 text-sm">
                  INSTAGRAM
                </h3>
                <p className="font-brand-body text-brand-charcoal/70 text-xs">
                  Behind-the-scenes insights
                </p>
              </CardContent>
            </Card>

            <Card className="card-brand group hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => window.open('https://facebook.com', '_blank')}>
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:shadow-md transition-all duration-300">
                  <span className="text-xl">📘</span>
                </div>
                <h3 className="font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-2 text-sm">
                  FACEBOOK
                </h3>
                <p className="font-brand-body text-brand-charcoal/70 text-xs">
                  Community and updates
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Premium Footer - Refined */}
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

export default Home;
