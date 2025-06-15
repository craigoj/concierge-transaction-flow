
import React from 'react';
import LandingHeader from '@/components/landing/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Award, Users, Clock, Heart, Star, Target, Zap, CheckCircle, ArrowRight } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Award,
      title: "Excellence",
      description: "We believe excellence is not an accident—it's the result of intentional, deliberate action in everything we do.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Heart,
      title: "Integrity", 
      description: "Trust is the foundation of every relationship. We operate with complete transparency and unwavering ethical standards.",
      color: "from-red-500 to-red-600"
    },
    {
      icon: Users,
      title: "Partnership",
      description: "Your success is our success. We're not just service providers—we're your dedicated partners in achievement.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Clock,
      title: "Reliability",
      description: "Consistency and dependability aren't just nice-to-haves—they're essential elements of professional service.",
      color: "from-purple-500 to-purple-600"
    }
  ];

  const journey = [
    {
      year: "2018",
      title: "The Vision",
      description: "Recognized the gap in premium transaction coordination services for elite agents."
    },
    {
      year: "2019", 
      title: "Foundation Built",
      description: "Developed our signature coordination methodology and recruited top talent."
    },
    {
      year: "2021",
      title: "Market Leadership",
      description: "Established as the premier coordination service for discerning real estate professionals."
    },
    {
      year: "2024",
      title: "Continued Innovation",
      description: "Expanding our technology platform and exclusive network of elite partners."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-background via-brand-cream to-brand-background">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full border border-brand-taupe/30 mb-8">
                <Heart className="h-5 w-5 text-brand-charcoal mr-3" />
                <span className="text-brand-charcoal font-brand-heading tracking-wide uppercase">Meet Our Founder</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider mb-4">
                EILEEN
                <br />
                <span className="text-brand-taupe-dark">MERCHANT</span>
              </h1>
              
              <p className="text-2xl font-brand-heading text-brand-taupe-dark mb-6 tracking-wide">
                Founder & Lead Transaction Coordinator
              </p>
              
              <div className="w-24 h-px bg-brand-taupe mb-8"></div>
              
              <Button 
                variant="outline"
                size="lg"
                onClick={() => navigate('/contact')}
                className="border-2 border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-brand-background font-brand-heading tracking-wide group"
              >
                Work With Eileen
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-taupe/20 to-brand-taupe-dark/20 rounded-3xl transform -rotate-2"></div>
              <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-brand-elevation">
                <img 
                  src="/lovable-uploads/878f5626-53d7-4407-ab51-df42b2f48eb8.png"
                  alt="Eileen - Founder of The Agent Concierge Co."
                  className="w-full h-full object-contain bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white/60 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wide mb-6">
              THE STORY BEHIND
              <br />
              <span className="text-brand-taupe-dark">THE CONCIERGE</span>
            </h2>
            <div className="w-24 h-px bg-brand-taupe mx-auto"></div>
          </div>
          
          <div className="space-y-8 font-brand-body text-lg text-brand-charcoal/80 leading-relaxed">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <p>
                  I created The Agent Concierge after seeing so many talented agents stretched thin - trying to grow, serve, and scale all at once, without the right support behind them. They envisioned luxury - but the administrative demands kept pulling them away.
                </p>
                <p>
                  So I created the systems that would give them the structure and the space to get there.
                </p>
              </div>
              <div className="space-y-6">
                <p>
                  With a background in communication and a mind for strategy, I designed a service rooted in clarity, speed, and high standards. My role isn't just to manage transactions - it's to create leverage, bring calm to the chaos, and help my clients grow with intention.
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-brand-taupe/10 to-brand-taupe-light/20 rounded-2xl p-8 my-12">
              <blockquote className="text-2xl font-brand-body italic text-brand-charcoal text-center leading-relaxed">
                "At the core of it all, my goal is simple: to give agents their time back - whether that means more moments with family, space to do what they love, or the freedom to focus on what they're best at: growing their business."
              </blockquote>
            </div>
            
            <p className="text-center">
              That shift in their voice after our first closing together - when they realize they don't have to do it all alone anymore - is exactly why I do this.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-6">
              OUR CORE VALUES
            </h2>
            <div className="w-24 h-px bg-brand-taupe mx-auto mb-6"></div>
            <p className="text-lg text-brand-charcoal/70 font-brand-body max-w-2xl mx-auto">
              The principles that guide every interaction and drive our commitment to excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="bg-white/90 backdrop-blur-sm border-brand-taupe/30 shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-300 group">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <value.icon className="h-8 w-8 text-brand-charcoal" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-3">
                        {value.title.toUpperCase()}
                      </h3>
                      <p className="font-brand-body text-brand-charcoal/70 leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-20 bg-white/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-6">
              OUR JOURNEY
            </h2>
            <div className="w-24 h-px bg-brand-taupe mx-auto mb-6"></div>
            <p className="text-lg text-brand-charcoal/70 font-brand-body max-w-2xl mx-auto">
              Building excellence, one milestone at a time.
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-brand-taupe/50"></div>
            
            <div className="space-y-16">
              {journey.map((milestone, index) => (
                <div key={index} className={`flex items-center gap-8 ${
                  index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                }`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/30 shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-300 inline-block">
                      <CardContent className="p-6">
                        <div className="text-3xl font-bold text-brand-taupe-dark mb-2">{milestone.year}</div>
                        <h3 className="text-xl font-brand-heading font-semibold text-brand-charcoal tracking-wide mb-3">
                          {milestone.title}
                        </h3>
                        <p className="font-brand-body text-brand-charcoal/70">
                          {milestone.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Timeline dot */}
                  <div className="w-6 h-6 bg-brand-taupe-dark rounded-full border-4 border-brand-background shadow-brand-subtle z-10"></div>
                  
                  <div className="flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recognition Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wide mb-8">
                RECOGNIZED
                <br />
                <span className="text-brand-taupe-dark">EXCELLENCE</span>
              </h2>
              
              <div className="space-y-6">
                {[
                  "Featured in Real Estate Professional Magazine",
                  "Top Transaction Coordinator - Regional Awards",
                  "Industry Innovation Recognition",
                  "Client Choice Award Winner"
                ].map((recognition, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Award className="h-6 w-6 text-brand-taupe-dark" />
                    <span className="font-brand-body text-brand-charcoal/80">
                      {recognition}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <Card className="bg-gradient-to-br from-brand-charcoal to-brand-taupe-dark text-brand-background shadow-brand-elevation">
                <CardContent className="p-12">
                  <div className="space-y-8">
                    <div className="flex justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-8 w-8 text-brand-taupe fill-current" />
                      ))}
                    </div>
                    
                    <div>
                      <div className="text-5xl font-bold text-brand-background mb-4">98%</div>
                      <div className="text-lg font-brand-heading tracking-wide text-brand-background/80 uppercase">
                        Client Satisfaction Rate
                      </div>
                    </div>
                    
                    <div className="text-brand-background/90 font-brand-body italic">
                      "The level of professionalism and attention to detail is unmatched in the industry."
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
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-brand-heading font-semibold text-brand-background tracking-brand-wide mb-6">
            EXPERIENCE THE DIFFERENCE
          </h2>
          
          <div className="w-32 h-1 bg-gradient-to-r from-brand-taupe to-brand-background mx-auto mb-8"></div>
          
          <p className="text-xl text-brand-background/80 font-brand-body mb-8 max-w-2xl mx-auto">
            Discover how intentional excellence can transform your real estate practice.
          </p>
          
          <Button 
            size="lg"
            onClick={() => navigate('/contact')}
            className="bg-brand-taupe hover:bg-brand-background text-brand-charcoal font-brand-heading tracking-wide text-xl px-12 py-6 group"
          >
            Start Your Journey
            <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default About;
