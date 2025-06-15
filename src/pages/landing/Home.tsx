
import React from 'react';
import LandingHeader from '@/components/landing/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Users, Clock, Award } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-background via-brand-cream to-brand-background">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider mb-6 animate-fade-in">
                EXCELLENCE IS
                <br />
                <span className="text-brand-taupe-dark">INTENTIONAL</span>
              </h1>
              <div className="w-32 h-px bg-brand-taupe mx-auto mb-8"></div>
              <p className="text-xl md:text-2xl text-brand-charcoal/80 font-brand-body leading-relaxed max-w-3xl mx-auto animate-slide-up">
                White-glove transaction coordination and comprehensive support services 
                designed exclusively for discerning real estate professionals who demand excellence.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up">
              <Button 
                variant="brand" 
                size="lg"
                onClick={() => navigate('/contact')}
                className="text-lg px-10 py-6"
              >
                Book Your Consultation
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/services')}
                className="text-lg px-10 py-6"
              >
                Explore Services
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-6">
              PREMIUM SERVICE TIERS
            </h2>
            <p className="text-lg text-brand-charcoal/70 font-brand-body max-w-2xl mx-auto">
              Choose the level of support that matches your business needs and standards of excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-brand hover:scale-105 transition-all duration-500">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-brand-charcoal" />
                </div>
                <CardTitle className="text-2xl">BUYER CORE</CardTitle>
                <CardDescription className="text-base">Essential transaction coordination</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-brand-taupe-dark" />
                    <span className="font-brand-body text-brand-charcoal">Contract management</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-brand-taupe-dark" />
                    <span className="font-brand-body text-brand-charcoal">Timeline coordination</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-brand-taupe-dark" />
                    <span className="font-brand-body text-brand-charcoal">Deadline tracking</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate('/services')}>
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="card-brand hover:scale-105 transition-all duration-500 border-brand-taupe/50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-brand-charcoal" />
                </div>
                <CardTitle className="text-2xl">BUYER ELITE</CardTitle>
                <CardDescription className="text-base">Enhanced support & communication</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-brand-taupe-dark" />
                    <span className="font-brand-body text-brand-charcoal">Everything in Core</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-brand-taupe-dark" />
                    <span className="font-brand-body text-brand-charcoal">Client communication</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-brand-taupe-dark" />
                    <span className="font-brand-body text-brand-charcoal">Priority support</span>
                  </div>
                </div>
                <Button variant="brand" className="w-full" onClick={() => navigate('/services')}>
                  Most Popular
                </Button>
              </CardContent>
            </Card>

            <Card className="card-brand hover:scale-105 transition-all duration-500">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-brand-charcoal" />
                </div>
                <CardTitle className="text-2xl">WHITE-GLOVE</CardTitle>
                <CardDescription className="text-base">Complete concierge experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-brand-taupe-dark" />
                    <span className="font-brand-body text-brand-charcoal">Everything in Elite</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-brand-taupe-dark" />
                    <span className="font-brand-body text-brand-charcoal">Full transaction management</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-brand-taupe-dark" />
                    <span className="font-brand-body text-brand-charcoal">Dedicated coordinator</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate('/services')}>
                  Ultimate Service
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-6">
            READY TO ELEVATE YOUR PRACTICE?
          </h2>
          <p className="text-xl text-brand-charcoal/80 font-brand-body mb-8 max-w-2xl mx-auto">
            Experience the difference that intentional excellence makes in your real estate business.
          </p>
          <Button 
            variant="brand" 
            size="lg"
            onClick={() => navigate('/contact')}
            className="text-xl px-12 py-6"
          >
            Schedule Your Consultation
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-charcoal text-brand-background py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-brand-charcoal font-brand-heading font-bold text-2xl tracking-brand-wide">AC</span>
          </div>
          <h3 className="text-2xl font-brand-heading font-semibold tracking-brand-wide mb-2">
            THE AGENT CONCIERGE
          </h3>
          <p className="text-brand-background/70 font-brand-body mb-6">
            REALTOR SUPPORT & SUCCESS CO.
          </p>
          <p className="text-brand-background/60 font-brand-body italic">
            "Excellence is Intentional."
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
