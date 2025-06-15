
import React from 'react';
import LandingHeader from '@/components/landing/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Clock, 
  Star, 
  CheckCircle, 
  ArrowRight,
  Shield,
  Zap,
  Target,
  TrendingUp,
  Calendar,
  Award,
  ChevronDown
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const stats = [
    { value: "500+", label: "Transactions Coordinated", icon: Building2 },
    { value: "98%", label: "Client Satisfaction", icon: Star },
    { value: "18", label: "Average Days to Close", icon: Clock },
    { value: "24/7", label: "Elite Support Available", icon: Shield }
  ];

  const services = [
    {
      tier: "Essential Coordination",
      description: "Perfect for growing agents who need reliable transaction management",
      features: ["Document coordination", "Timeline management", "Client communication", "Basic reporting"],
      price: "From $495",
      highlight: false
    },
    {
      tier: "Premium Coordination", 
      description: "Complete white-glove service for established professionals",
      features: ["Full transaction management", "Priority support", "Advanced analytics", "Custom workflows"],
      price: "From $795",
      highlight: true
    },
    {
      tier: "Elite Concierge",
      description: "Luxury-level coordination for top-tier agents and teams",
      features: ["Dedicated coordinator", "24/7 availability", "Exclusive network access", "Personal consultation"],
      price: "Custom pricing",
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-background via-brand-cream to-brand-taupe-light">
      <LandingHeader />
      
      {/* Hero Section - Unique Layout */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-background/90 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7">
              <div className="space-y-8">
                <div className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-brand-taupe/30 mb-6">
                  <Award className="h-4 w-4 text-brand-charcoal mr-2" />
                  <span className="text-sm font-brand-heading tracking-wide text-brand-charcoal uppercase">Elite Transaction Coordination</span>
                </div>
                
                <h1 className="text-6xl lg:text-7xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider leading-tight">
                  ELEVATE
                  <br />
                  <span className="text-brand-taupe-dark">YOUR PRACTICE</span>
                </h1>
                
                <div className="w-32 h-1 bg-gradient-to-r from-brand-taupe to-brand-taupe-dark"></div>
                
                <p className="text-xl font-brand-body text-brand-charcoal/80 leading-relaxed max-w-xl">
                  Sophisticated transaction coordination for discerning real estate professionals. 
                  Experience the difference when every detail is managed with precision and care.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg"
                    onClick={() => navigate('/contact')}
                    className="bg-brand-charcoal hover:bg-brand-taupe-dark text-brand-background font-brand-heading tracking-wide text-lg px-8 py-4 group"
                  >
                    Begin Your Journey
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/services')}
                    className="border-2 border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-brand-background font-brand-heading tracking-wide text-lg px-8 py-4"
                  >
                    Explore Services
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-taupe/20 to-brand-taupe-dark/20 rounded-3xl transform rotate-3"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl border border-brand-taupe/30 shadow-brand-elevation p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-brand-heading text-brand-charcoal uppercase tracking-wide text-lg">Live Coordination</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-brand-body text-brand-charcoal/70">Active</span>
                      </div>
                    </div>
                    
                    {[
                      { property: "Luxury Estate - Beverly Hills", status: "Inspection Scheduled", progress: 75 },
                      { property: "Modern Condo - Downtown", status: "Documentation Review", progress: 45 },
                      { property: "Family Home - Suburb", status: "Closing Prep", progress: 90 }
                    ].map((item, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-brand-heading text-sm text-brand-charcoal uppercase tracking-wide">{item.property}</p>
                            <p className="text-xs text-brand-charcoal/60 font-brand-body">{item.status}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-brand-charcoal">{item.progress}%</p>
                          </div>
                        </div>
                        <div className="w-full bg-brand-taupe/30 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-brand-taupe to-brand-taupe-dark h-2 rounded-full transition-all duration-500"
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Unique Grid */}
      <section className="py-20 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-4">
              PROVEN EXCELLENCE
            </h2>
            <div className="w-24 h-px bg-brand-taupe mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="h-8 w-8 text-brand-charcoal" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-charcoal rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-brand-background" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-brand-charcoal mb-2">{stat.value}</div>
                <div className="text-sm font-brand-heading tracking-wide text-brand-charcoal/70 uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview - Asymmetric Layout */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className={`relative overflow-hidden transition-all duration-500 hover:scale-105 ${
                service.highlight 
                  ? 'bg-brand-charcoal text-brand-background border-brand-charcoal shadow-brand-elevation' 
                  : 'bg-white/80 backdrop-blur-sm border-brand-taupe/30 shadow-brand-subtle hover:shadow-brand-elevation'
              }`}>
                {service.highlight && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-brand-taupe px-4 py-1 rounded-bl-lg">
                      <span className="text-xs font-brand-heading tracking-wide text-brand-charcoal uppercase">Most Popular</span>
                    </div>
                  </div>
                )}
                
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className={`text-2xl font-brand-heading font-semibold tracking-brand-wide mb-3 ${
                        service.highlight ? 'text-brand-background' : 'text-brand-charcoal'
                      }`}>
                        {service.tier.toUpperCase()}
                      </h3>
                      <p className={`font-brand-body ${
                        service.highlight ? 'text-brand-background/80' : 'text-brand-charcoal/70'
                      }`}>
                        {service.description}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {service.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-3">
                          <CheckCircle className={`h-5 w-5 ${
                            service.highlight ? 'text-brand-taupe' : 'text-brand-taupe-dark'
                          }`} />
                          <span className={`font-brand-body ${
                            service.highlight ? 'text-brand-background/90' : 'text-brand-charcoal/80'
                          }`}>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4">
                      <div className={`text-3xl font-bold mb-4 ${
                        service.highlight ? 'text-brand-background' : 'text-brand-charcoal'
                      }`}>
                        {service.price}
                      </div>
                      <Button 
                        className={`w-full ${
                          service.highlight 
                            ? 'bg-brand-background text-brand-charcoal hover:bg-brand-taupe' 
                            : 'bg-brand-charcoal text-brand-background hover:bg-brand-taupe-dark'
                        } font-brand-heading tracking-wide`}
                        onClick={() => navigate('/contact')}
                      >
                        Learn More
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us - Diagonal Layout */}
      <section className="py-20 bg-gradient-to-br from-brand-taupe-light/30 to-brand-background/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-y-1"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider mb-8">
                WHY ELITE AGENTS
                <br />
                <span className="text-brand-taupe-dark">CHOOSE US</span>
              </h2>
              
              <div className="space-y-8">
                {[
                  {
                    icon: Target,
                    title: "Precision Focus",
                    description: "Every detail matters. We manage your transactions with the attention they deserve."
                  },
                  {
                    icon: Zap,
                    title: "Seamless Efficiency", 
                    description: "Streamlined processes that save time while maintaining the highest standards."
                  },
                  {
                    icon: TrendingUp,
                    title: "Proven Results",
                    description: "Our track record speaks for itself - faster closings, happier clients, more business."
                  }
                ].map((benefit, index) => (
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
              <div className="absolute inset-0 bg-gradient-to-br from-brand-charcoal/10 to-brand-taupe/20 rounded-3xl transform -rotate-2"></div>
              <Card className="relative bg-white/90 backdrop-blur-sm border-brand-taupe/30 shadow-brand-elevation">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-brand-heading font-semibold text-brand-charcoal tracking-wide">
                        CLIENT TESTIMONIAL
                      </h3>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    
                    <blockquote className="text-lg font-brand-body text-brand-charcoal/80 italic leading-relaxed">
                      "The Agent Concierge transformed how I run my practice. Every transaction flows seamlessly, 
                      and my clients consistently comment on the professional coordination. It's like having a 
                      luxury experience built into every deal."
                    </blockquote>
                    
                    <div className="pt-4 border-t border-brand-taupe/30">
                      <p className="font-brand-heading text-brand-charcoal tracking-wide">Sarah Mitchell</p>
                      <p className="text-sm text-brand-charcoal/60 font-brand-body">Top Producer, Beverly Hills</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Unique Geometric Design */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-charcoal via-brand-taupe-dark to-brand-charcoal"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-brand-taupe/10 to-transparent"></div>
        
        <div className="max-w-5xl mx-auto px-6 lg:px-8 relative text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-6 py-3 bg-brand-taupe/20 backdrop-blur-sm rounded-full border border-brand-taupe/30 mb-8">
              <Calendar className="h-5 w-5 text-brand-background mr-3" />
              <span className="text-brand-background font-brand-heading tracking-wide uppercase">Ready to Transform Your Practice?</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-brand-heading font-bold text-brand-background tracking-brand-wider leading-tight">
              EXPERIENCE THE
              <br />
              <span className="text-brand-taupe">CONCIERGE DIFFERENCE</span>
            </h2>
            
            <div className="w-32 h-1 bg-gradient-to-r from-brand-taupe to-brand-background mx-auto"></div>
            
            <p className="text-xl text-brand-background/90 font-brand-body leading-relaxed max-w-3xl mx-auto">
              Join the ranks of elite agents who have discovered what true transaction coordination excellence looks like. 
              Your practice deserves nothing less than perfection.
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
                Agent Access
              </Button>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <ChevronDown className="h-6 w-6 text-brand-background/50 animate-bounce" />
        </div>
      </section>
    </div>
  );
};

export default Home;
