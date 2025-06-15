
import React, { useState, useEffect } from 'react';
import LandingHeader from '@/components/landing/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Users, Target, Sparkles } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: "White-Glove Coordination",
      description: "Strategic transaction management that elevates every client interaction",
      icon: Sparkles,
      color: "from-amber-100 to-orange-100"
    },
    {
      title: "Time Freedom Creation", 
      description: "Structured systems that give you hours back for relationship building",
      icon: Clock,
      color: "from-blue-100 to-indigo-100"
    },
    {
      title: "Network Leverage",
      description: "Access our curated professional network across Hampton Roads",
      icon: Users,
      color: "from-green-100 to-emerald-100"
    },
    {
      title: "Scalable Growth",
      description: "Business infrastructure that grows with your ambitions",
      icon: Target,
      color: "from-purple-100 to-pink-100"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-background via-brand-cream to-brand-background">
      <LandingHeader />
      
      {/* Hero Section - Sophisticated Business Partnership */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-background/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Premium Messaging */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-brand-taupe/30">
                  <span className="text-sm font-brand-heading tracking-brand-wide text-brand-charcoal/70 uppercase">
                    REALTOR SUPPORT & SUCCESS CO.
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-brand-charcoal leading-tight">
                  EXCELLENCE IS
                  <br />
                  <span className="text-brand-taupe-dark">INTENTIONAL.</span>
                </h1>
                <p className="text-xl text-brand-charcoal/80 leading-relaxed max-w-lg font-brand-body">
                  for agents who treat service like strategy
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="brand" 
                  size="lg"
                  className="text-lg px-8 py-6"
                  onClick={() => navigate('/contact')}
                >
                  BOOK A CONSULTATION
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-lg px-8 py-6"
                  onClick={() => navigate('/services')}
                >
                  EXPLORE SERVICES
                </Button>
              </div>
            </div>

            {/* Right Column - Interactive Feature Showcase */}
            <div className="relative">
              <div className="relative z-10">
                <Card className="card-brand p-8 mb-6">
                  <CardContent className="p-0">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${features[activeFeature].color} flex items-center justify-center`}>
                        <features[activeFeature].icon className="h-8 w-8 text-brand-charcoal" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide">
                          {features[activeFeature].title}
                        </h3>
                        <p className="text-brand-charcoal/70 font-brand-body">
                          {features[activeFeature].description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Feature indicators */}
                    <div className="flex space-x-2">
                      {features.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveFeature(index)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index === activeFeature 
                              ? 'w-8 bg-brand-taupe-dark' 
                              : 'w-2 bg-brand-taupe/50 hover:bg-brand-taupe'
                          }`}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Professional workspace image */}
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-brand-elevation">
                  <img 
                    src="/lovable-uploads/79d45d82-d96c-4867-a70b-9dfb661b73d9.png"
                    alt="Professional workspace representing excellence in real estate"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Background decoration */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-brand-taupe/20 to-brand-taupe-dark/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-brand-taupe-light/30 to-brand-taupe/30 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Partnership Section */}
      <section className="py-20 bg-white/60 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-6">
              BEYOND TRANSACTION MANAGEMENT
            </h2>
            <div className="w-32 h-px bg-brand-taupe mx-auto mb-8"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-brand text-center group hover:scale-105 transition-all duration-300">
              <CardContent className="pt-8">
                <div className="w-20 h-20 bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-brand-elevation transition-all duration-300">
                  <Sparkles className="h-10 w-10 text-brand-charcoal" />
                </div>
                <h3 className="text-xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-4">
                  WHITE-GLOVE EXPERIENCE
                </h3>
                <p className="font-brand-body text-brand-charcoal/70 leading-relaxed">
                  We don't just manage paperwork. We orchestrate exceptional client experiences that reflect your premium brand.
                </p>
              </CardContent>
            </Card>

            <Card className="card-brand text-center group hover:scale-105 transition-all duration-300">
              <CardContent className="pt-8">
                <div className="w-20 h-20 bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-brand-elevation transition-all duration-300">
                  <Target className="h-10 w-10 text-brand-charcoal" />
                </div>
                <h3 className="text-xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-4">
                  STRATEGIC GROWTH
                </h3>
                <p className="font-brand-body text-brand-charcoal/70 leading-relaxed">
                  Scalable systems and processes that grow with your business, not basic administrative support.
                </p>
              </CardContent>
            </Card>

            <Card className="card-brand text-center group hover:scale-105 transition-all duration-300">
              <CardContent className="pt-8">
                <div className="w-20 h-20 bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-brand-elevation transition-all duration-300">
                  <Clock className="h-10 w-10 text-brand-charcoal" />
                </div>
                <h3 className="text-xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-4">
                  TIME FREEDOM
                </h3>
                <p className="font-brand-body text-brand-charcoal/70 leading-relaxed">
                  Reclaim hours to focus on what matters: building relationships and growing your practice.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Value Proposition - Sophisticated Messaging */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="space-y-8 font-brand-body text-xl text-brand-charcoal/80 leading-relaxed">
            <p className="text-2xl font-medium">
              At The Agent Concierge, we don't just manage paperwork.
            </p>
            <p>
              We streamline transactions, orchestrate client experiences, and 
              build the infrastructure that helps agents focus on what matters most: 
              serving clients with clarity and confidence.
            </p>
            <p className="text-xl font-medium italic">
              You've built something special. Let's make it exceptional.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Service Preview */}
      <section className="py-20 bg-brand-background/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-4">
              WHITE-GLOVE TRANSACTION COORDINATION
              <br />
              AND CUSTOMER EXPERIENCE
            </h2>
            <p className="text-brand-charcoal/70 text-lg font-brand-body tracking-wide">
              LOCAL TO HAMILTON ROADS, VIRGINIA
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-brand group hover:scale-105 transition-all duration-300 cursor-pointer" 
                  onClick={() => navigate('/contact')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-md transition-all duration-300">
                  <span className="text-2xl">📞</span>
                </div>
                <h3 className="font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-2">
                  CONSULTATION
                </h3>
                <p className="font-brand-body text-brand-charcoal/70 text-sm">
                  Strategic partnership discussion
                </p>
              </CardContent>
            </Card>

            <Card className="card-brand group hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate('/services')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-md transition-all duration-300">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-2">
                  SERVICE TIERS
                </h3>
                <p className="font-brand-body text-brand-charcoal/70 text-sm">
                  Explore our comprehensive offerings
                </p>
              </CardContent>
            </Card>

            <Card className="card-brand group hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => window.open('https://instagram.com', '_blank')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-md transition-all duration-300">
                  <span className="text-2xl">📸</span>
                </div>
                <h3 className="font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-2">
                  INSTAGRAM
                </h3>
                <p className="font-brand-body text-brand-charcoal/70 text-sm">
                  Behind-the-scenes insights
                </p>
              </CardContent>
            </Card>

            <Card className="card-brand group hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => window.open('https://facebook.com', '_blank')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-md transition-all duration-300">
                  <span className="text-2xl">📘</span>
                </div>
                <h3 className="font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-2">
                  FACEBOOK
                </h3>
                <p className="font-brand-body text-brand-charcoal/70 text-sm">
                  Community and updates
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="bg-brand-charcoal text-brand-background py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8 p-2">
              <img 
                src="/lovable-uploads/5daf1e7a-db5b-46d0-bd10-afb6f64213b2.png"
                alt="The Agent Concierge Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-2xl font-brand-heading font-semibold tracking-brand-wide mb-2">
              THE AGENT CONCIERGE LLC
            </h3>
            <p className="text-brand-background/70 font-brand-body mb-6 text-lg">
              REALTOR SUPPORT & SUCCESS CO.
            </p>
            <div className="w-24 h-px bg-brand-taupe mx-auto mb-6"></div>
            <p className="text-brand-background/60 font-brand-body italic text-lg">
              "Excellence is Intentional."
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
