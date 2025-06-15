
import React from 'react';
import LandingHeader from '@/components/landing/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 to-neutral-200">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-800 leading-tight mb-6">
                  EXCELLENCE IS
                  <br />
                  <span className="text-neutral-600">INTENTIONAL.</span>
                </h1>
                <p className="text-lg text-neutral-600 leading-relaxed mb-8 max-w-lg">
                  for agents who treat service like strategy
                </p>
                <Button 
                  variant="default" 
                  className="bg-neutral-800 hover:bg-neutral-900 text-white px-8 py-3 text-sm font-medium tracking-wide"
                  onClick={() => navigate('/contact')}
                >
                  BOOK A CONSULTATION
                </Button>
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-2xl">
                <img 
                  src="/lovable-uploads/79d45d82-d96c-4867-a70b-9dfb661b73d9.png"
                  alt="Professional workspace representing excellence in real estate"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <p className="text-lg text-neutral-700 leading-relaxed">
              At The Agent Concierge, we don't just manage paperwork.
            </p>
            <p className="text-lg text-neutral-700 leading-relaxed">
              We streamline transactions, manage the client experience, and 
              help agents focus on what matters most: serving clients with 
              clarity and confidence.
            </p>
            <p className="text-lg text-neutral-700 leading-relaxed">
              You've built something special. Let's make it exceptional.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-800 mb-4 tracking-wide">
              WHITE-GLOVE TRANSACTION COORDINATION
              <br />
              AND CUSTOMER EXPERIENCE
            </h2>
            <p className="text-neutral-600 text-lg">
              LOCAL TO HAMILTON ROADS, VIRGINIA
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <Button 
                variant="outline" 
                className="w-full border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                onClick={() => navigate('/contact')}
              >
                Book a Consultation
              </Button>
            </div>
            <div className="text-center">
              <Button 
                variant="outline" 
                className="w-full border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                onClick={() => navigate('/services')}
              >
                Ongoing Sales Info
              </Button>
            </div>
            <div className="text-center">
              <Button 
                variant="outline" 
                className="w-full border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                onClick={() => navigate('/services')}
              >
                Instagram
              </Button>
            </div>
            <div className="text-center">
              <Button 
                variant="outline" 
                className="w-full border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                onClick={() => navigate('/contact')}
              >
                Facebook
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-6">
            <span className="text-neutral-800 font-bold text-2xl tracking-wide">AC</span>
          </div>
          <h3 className="text-xl font-semibold tracking-wide mb-2">
            The Agent Concierge LLC
          </h3>
        </div>
      </footer>
    </div>
  );
};

export default Home;
