
import React from 'react';
import LandingHeader from '@/components/landing/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Star, 
  Clock, 
  Shield, 
  Zap,
  Users,
  Target,
  Award,
  Calendar,
  FileText,
  Phone,
  Building2,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

const Services = () => {
  const navigate = useNavigate();

  const serviceTiers = [
    {
      name: "Essential Coordination",
      tagline: "Foundation for Growth",
      price: "Starting at $495",
      description: "Perfect for growing agents who need reliable transaction management without the complexity.",
      features: [
        "Complete transaction timeline management",
        "Document coordination and tracking", 
        "Client communication management",
        "Basic compliance monitoring",
        "Standard reporting dashboard",
        "Email and phone support",
        "5-day turnaround on requests"
      ],
      highlight: false,
      badge: null
    },
    {
      name: "Premium Coordination", 
      tagline: "Complete Excellence",
      price: "Starting at $795",
      description: "White-glove service for established professionals who demand sophistication in every detail.",
      features: [
        "Everything in Essential, plus:",
        "Dedicated coordination specialist",
        "Priority 24-hour response time",
        "Advanced analytics and insights",
        "Custom workflow development",
        "Proactive deadline management",
        "Client experience enhancement",
        "Quality assurance reviews"
      ],
      highlight: true,
      badge: "Most Popular"
    },
    {
      name: "Elite Concierge",
      tagline: "Luxury Redefined", 
      price: "Custom Pricing",
      description: "The pinnacle of transaction coordination for top-tier agents and exclusive teams.",
      features: [
        "Everything in Premium, plus:",
        "Personal coordination concierge",
        "24/7 availability and support",
        "Exclusive network access",
        "White-label coordination services",
        "Personal consultation sessions",
        "Custom technology integrations",
        "Executive-level reporting"
      ],
      highlight: false,
      badge: "Exclusive"
    }
  ];

  const onDemandServices = [
    {
      icon: FileText,
      title: "Document Management",
      description: "Professional document coordination and compliance review",
      price: "From $150"
    },
    {
      icon: Calendar,
      title: "Inspection Coordination",
      description: "Complete inspection scheduling and management",
      price: "From $200"
    },
    {
      icon: Phone,
      title: "Client Communication",
      description: "Professional client update and communication services",
      price: "From $100"
    },
    {
      icon: Building2,
      title: "Closing Coordination",
      description: "End-to-end closing process management",
      price: "From $300"
    }
  ];

  const memberBenefits = [
    {
      icon: Zap,
      title: "Lightning Response",
      description: "Priority access ensures your urgent needs are handled immediately"
    },
    {
      icon: Shield,
      title: "Compliance Assurance", 
      description: "Every transaction reviewed for complete regulatory compliance"
    },
    {
      icon: Target,
      title: "Precision Execution",
      description: "Meticulous attention to detail in every aspect of coordination"
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Detailed insights to optimize your transaction velocity"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-background via-brand-cream to-brand-background">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full border border-brand-taupe/30 mb-8">
              <Award className="h-5 w-5 text-brand-charcoal mr-3" />
              <span className="text-brand-charcoal font-brand-heading tracking-wide uppercase">Premium Coordination Services</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider mb-6">
              ELEVATED
              <br />
              <span className="text-brand-taupe-dark">COORDINATION</span>
            </h1>
            
            <div className="w-32 h-1 bg-gradient-to-r from-brand-taupe to-brand-taupe-dark mx-auto mb-8"></div>
            
            <p className="text-xl font-brand-body text-brand-charcoal/80 leading-relaxed max-w-3xl mx-auto">
              Choose from our curated selection of coordination services, each designed to elevate 
              your practice and deliver the sophisticated experience your clients deserve.
            </p>
          </div>
        </div>
      </section>

      {/* Service Tiers */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {serviceTiers.map((tier, index) => (
              <Card key={index} className={`relative overflow-hidden transition-all duration-500 hover:scale-105 ${
                tier.highlight 
                  ? 'bg-brand-charcoal text-brand-background border-brand-charcoal shadow-brand-elevation ring-4 ring-brand-taupe/30' 
                  : 'bg-white/90 backdrop-blur-sm border-brand-taupe/30 shadow-brand-subtle hover:shadow-brand-elevation'
              }`}>
                {tier.badge && (
                  <div className="absolute top-0 right-0">
                    <div className={`px-4 py-2 rounded-bl-xl ${
                      tier.highlight ? 'bg-brand-taupe text-brand-charcoal' : 'bg-brand-charcoal text-brand-background'
                    }`}>
                      <span className="text-xs font-brand-heading tracking-wide uppercase">{tier.badge}</span>
                    </div>
                  </div>
                )}
                
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className={`text-2xl font-brand-heading font-bold tracking-brand-wide mb-2 ${
                        tier.highlight ? 'text-brand-background' : 'text-brand-charcoal'
                      }`}>
                        {tier.name.toUpperCase()}
                      </h3>
                      <p className={`text-sm font-brand-heading tracking-wide ${
                        tier.highlight ? 'text-brand-taupe' : 'text-brand-taupe-dark'
                      }`}>
                        {tier.tagline}
                      </p>
                      <div className={`text-3xl font-bold mt-4 ${
                        tier.highlight ? 'text-brand-background' : 'text-brand-charcoal'
                      }`}>
                        {tier.price}
                      </div>
                    </div>
                    
                    <p className={`font-brand-body text-center ${
                      tier.highlight ? 'text-brand-background/90' : 'text-brand-charcoal/70'
                    }`}>
                      {tier.description}
                    </p>
                    
                    <div className="space-y-3">
                      {tier.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-3">
                          {feature.startsWith('Everything') ? (
                            <Star className={`h-5 w-5 mt-0.5 ${
                              tier.highlight ? 'text-brand-taupe' : 'text-brand-taupe-dark'
                            }`} />
                          ) : (
                            <CheckCircle className={`h-5 w-5 mt-0.5 ${
                              tier.highlight ? 'text-brand-taupe' : 'text-brand-taupe-dark'
                            }`} />
                          )}
                          <span className={`font-brand-body text-sm ${
                            tier.highlight ? 'text-brand-background/90' : 'text-brand-charcoal/80'
                          } ${feature.startsWith('Everything') ? 'font-semibold' : ''}`}>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      className={`w-full ${
                        tier.highlight 
                          ? 'bg-brand-background text-brand-charcoal hover:bg-brand-taupe' 
                          : 'bg-brand-charcoal text-brand-background hover:bg-brand-taupe-dark'
                      } font-brand-heading tracking-wide`}
                      onClick={() => navigate('/contact')}
                    >
                      Get Started
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* On-Demand Services */}
      <section className="py-20 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wide mb-4">
              ON-DEMAND COORDINATION
            </h2>
            <div className="w-24 h-px bg-brand-taupe mx-auto mb-6"></div>
            <p className="text-lg font-brand-body text-brand-charcoal/70 max-w-2xl mx-auto">
              Individual services for specific coordination needs. Perfect for one-off requirements or testing our capabilities.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {onDemandServices.map((service, index) => (
              <Card key={index} className="bg-white/90 backdrop-blur-sm border-brand-taupe/30 shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="h-8 w-8 text-brand-charcoal" />
                  </div>
                  <h3 className="text-lg font-brand-heading font-semibold text-brand-charcoal tracking-wide mb-2">
                    {service.title}
                  </h3>
                  <p className="font-brand-body text-brand-charcoal/70 text-sm mb-4">
                    {service.description}
                  </p>
                  <div className="text-xl font-bold text-brand-charcoal mb-4">
                    {service.price}
                  </div>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="border-brand-taupe text-brand-charcoal hover:bg-brand-taupe/20 font-brand-heading tracking-wide text-xs"
                    onClick={() => navigate('/contact')}
                  >
                    Request Service
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Member Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wide mb-8">
                MEMBER ACCESS
                <br />
                <span className="text-brand-taupe-dark">& BENEFITS</span>
              </h2>
              
              <div className="space-y-8">
                {memberBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-6 group">
                    <div className="w-14 h-14 bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <benefit.icon className="h-7 w-7 text-brand-charcoal" />
                    </div>
                    <div>
                      <h3 className="text-xl font-brand-heading font-semibold text-brand-charcoal tracking-wide mb-2">
                        {benefit.title}
                      </h3>
                      <p className="font-brand-body text-brand-charcoal/70 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-charcoal/10 to-brand-taupe/20 rounded-3xl transform rotate-3"></div>
              <Card className="relative bg-white/90 backdrop-blur-sm border-brand-taupe/30 shadow-brand-elevation">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-brand-heading font-semibold text-brand-charcoal tracking-wide mb-4">
                        EXCLUSIVE NETWORK
                      </h3>
                      <div className="flex justify-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {[
                        "Priority vendor relationships",
                        "Exclusive market insights", 
                        "Advanced coordination tools",
                        "Peer networking opportunities"
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-brand-taupe-dark" />
                          <span className="font-brand-body text-brand-charcoal/80">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-6 border-t border-brand-taupe/30 text-center">
                      <Button
                        className="bg-brand-charcoal text-brand-background hover:bg-brand-taupe-dark font-brand-heading tracking-wide"
                        onClick={() => navigate('/contact')}
                      >
                        Join Network
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-brand-charcoal via-brand-taupe-dark to-brand-charcoal">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-brand-heading font-bold text-brand-background tracking-brand-wider leading-tight">
              READY TO ELEVATE
              <br />
              <span className="text-brand-taupe">YOUR PRACTICE?</span>
            </h2>
            
            <div className="w-32 h-1 bg-gradient-to-r from-brand-taupe to-brand-background mx-auto"></div>
            
            <p className="text-xl text-brand-background/90 font-brand-body leading-relaxed max-w-3xl mx-auto">
              Experience the difference that premium coordination makes. Your clients will notice, 
              your peers will ask, and your practice will transform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Button 
                size="lg"
                onClick={() => navigate('/contact')}
                className="bg-brand-taupe hover:bg-brand-background text-brand-charcoal font-brand-heading tracking-wide text-xl px-12 py-6 group"
              >
                Schedule Consultation
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => navigate('/auth')}
                className="border-2 border-brand-background text-brand-background hover:bg-brand-background hover:text-brand-charcoal font-brand-heading tracking-wide text-xl px-12 py-6"
              >
                Member Access
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
