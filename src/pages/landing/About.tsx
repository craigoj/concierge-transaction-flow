
import React from 'react';
import LandingHeader from '@/components/landing/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Award, Users, Clock, Heart } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-background via-brand-cream to-brand-background">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider mb-6">
                MEET EILEEN
              </h1>
              <div className="w-24 h-px bg-brand-taupe mb-8"></div>
              <p className="text-xl text-brand-charcoal/80 font-brand-body leading-relaxed mb-8">
                The visionary behind The Agent Concierge Co., bringing decades of real estate expertise 
                and an unwavering commitment to excellence in every transaction.
              </p>
              <Button 
                variant="brand" 
                size="lg"
                onClick={() => navigate('/contact')}
              >
                Work With Eileen
              </Button>
            </div>
            <div className="relative">
              <div className="w-full h-96 rounded-2xl overflow-hidden shadow-brand-elevation">
                <img 
                  src="/lovable-uploads/c1b9f5b7-fb45-4434-9475-bc103e34c663.png"
                  alt="Eileen - Founder of The Agent Concierge Co."
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white/60 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-6">
              A JOURNEY OF EXCELLENCE
            </h2>
            <div className="w-24 h-px bg-brand-taupe mx-auto"></div>
          </div>

          <div className="space-y-8 font-brand-body text-lg text-brand-charcoal/80 leading-relaxed">
            <p>
              With over two decades in the real estate industry, Eileen has witnessed firsthand 
              the challenges that agents face in managing complex transactions while maintaining 
              the highest standards of client service.
            </p>
            <p>
              Born from a passion for operational excellence and a deep understanding of the 
              real estate process, The Agent Concierge Co. was founded on a simple yet powerful 
              principle: <em>Excellence is Intentional</em>.
            </p>
            <p>
              Every system, every process, and every interaction has been carefully designed 
              to elevate the real estate experience for both agents and their clients. This 
              isn't just about transaction coordination—it's about creating a partnership 
              that amplifies your success.
            </p>
            <p>
              Today, Eileen and her team of dedicated professionals continue to set new 
              standards in the industry, providing white-glove service that allows agents 
              to focus on what they do best: building relationships and closing deals.
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
            <p className="text-lg text-brand-charcoal/70 font-brand-body max-w-2xl mx-auto">
              The principles that guide every interaction and drive our commitment to excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="card-brand text-center">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Award className="h-8 w-8 text-brand-charcoal" />
                </div>
                <h3 className="text-xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-4">
                  EXCELLENCE
                </h3>
                <p className="font-brand-body text-brand-charcoal/70">
                  We believe excellence is not an accident—it's the result of intentional, 
                  deliberate action in everything we do.
                </p>
              </CardContent>
            </Card>

            <Card className="card-brand text-center">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-8 w-8 text-brand-charcoal" />
                </div>
                <h3 className="text-xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-4">
                  INTEGRITY
                </h3>
                <p className="font-brand-body text-brand-charcoal/70">
                  Trust is the foundation of every relationship. We operate with complete 
                  transparency and unwavering ethical standards.
                </p>
              </CardContent>
            </Card>

            <Card className="card-brand text-center">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-brand-charcoal" />
                </div>
                <h3 className="text-xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-4">
                  PARTNERSHIP
                </h3>
                <p className="font-brand-body text-brand-charcoal/70">
                  Your success is our success. We're not just service providers—we're 
                  your dedicated partners in achievement.
                </p>
              </CardContent>
            </Card>

            <Card className="card-brand text-center">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-8 w-8 text-brand-charcoal" />
                </div>
                <h3 className="text-xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-4">
                  RELIABILITY
                </h3>
                <p className="font-brand-body text-brand-charcoal/70">
                  Consistency and dependability aren't just nice-to-haves—they're 
                  essential elements of professional service.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white/60 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-6">
            EXPERIENCE THE DIFFERENCE
          </h2>
          <p className="text-xl text-brand-charcoal/80 font-brand-body mb-8 max-w-2xl mx-auto">
            Discover how intentional excellence can transform your real estate practice.
          </p>
          <Button 
            variant="brand" 
            size="lg"
            onClick={() => navigate('/contact')}
            className="text-xl px-12 py-6"
          >
            Start Your Journey
          </Button>
        </div>
      </section>
    </div>
  );
};

export default About;
