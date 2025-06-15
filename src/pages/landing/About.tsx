
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
              <h1 className="text-5xl md:text-6xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider mb-4">
                EILEEN MERCHANT
              </h1>
              <p className="text-2xl font-brand-heading text-brand-taupe-dark mb-6 tracking-wide">
                Founder & Lead Transaction Coordinator
              </p>
              <div className="w-24 h-px bg-brand-taupe mb-8"></div>
              <Button 
                variant="brand" 
                size="lg"
                onClick={() => navigate('/contact')}
              >
                Work With Eileen
              </Button>
            </div>
            <div className="relative">
              <div className="w-full h-[500px] rounded-2xl overflow-hidden shadow-brand-elevation">
                <img 
                  src="/lovable-uploads/878f5626-53d7-4407-ab51-df42b2f48eb8.png"
                  alt="Eileen - Founder of The Agent Concierge Co."
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white/60 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="space-y-8 font-brand-body text-lg text-brand-charcoal/80 leading-relaxed text-justify">
            <p>
              I created The Agent Concierge after seeing so many talented agents stretched thin - trying to grow, serve, and scale all at once, without the right support behind them. They envisioned luxury - but the administrative demands kept pulling them away.
            </p>
            <p>
              So I created the systems that would give them the structure and the space to get there.
            </p>
            <p>
              With a background in communication and a mind for strategy, I designed a service rooted in clarity, speed, and high standards. My role isn&apos;t just to manage transactions - it&apos;s to create leverage, bring calm to the chaos, and help my clients grow with intention.
            </p>
            <p>
              At the core of it all, my goal is simple: to <em>give agents their time back</em> - whether that means more moments with family, space to do what they love, or the freedom to focus on what they&apos;re best at: growing their business.
            </p>
            <p>
              That shift in their voice after our first closing together - when they realize they don&apos;t have to do it all alone anymore - is exactly why I do this.
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
                  We believe excellence is not an accident—it&apos;s the result of intentional, 
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
                  Your success is our success. We&apos;re not just service providers—we&apos;re 
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
                  Consistency and dependability aren&apos;t just nice-to-haves—they&apos;re 
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
