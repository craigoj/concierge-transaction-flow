
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LandingHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-brand-background/95 backdrop-blur-sm border-b border-brand-taupe/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div 
            className="flex items-center space-x-4 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-brand-subtle group-hover:shadow-brand-elevation transition-all duration-300 p-1">
              <img 
                src="/lovable-uploads/5daf1e7a-db5b-46d0-bd10-afb6f64213b2.png"
                alt="The Agent Concierge Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide">
                THE AGENT CONCIERGE
              </h1>
              <p className="text-xs text-brand-charcoal/70 font-brand-body tracking-wider">
                REALTOR SUPPORT & SUCCESS CO.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigate('/')}
              className="text-brand-charcoal font-brand-heading text-sm tracking-brand-wide uppercase hover:text-brand-taupe-dark transition-colors duration-300 relative group"
            >
              HOME
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-taupe-dark transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button
              onClick={() => navigate('/services')}
              className="text-brand-charcoal font-brand-heading text-sm tracking-brand-wide uppercase hover:text-brand-taupe-dark transition-colors duration-300 relative group"
            >
              SERVICES
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-taupe-dark transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button
              onClick={() => navigate('/about')}
              className="text-brand-charcoal font-brand-heading text-sm tracking-brand-wide uppercase hover:text-brand-taupe-dark transition-colors duration-300 relative group"
            >
              ABOUT
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-taupe-dark transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="text-brand-charcoal font-brand-heading text-sm tracking-brand-wide uppercase hover:text-brand-taupe-dark transition-colors duration-300 relative group"
            >
              CONTACT
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-taupe-dark transition-all duration-300 group-hover:w-full"></span>
            </button>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/auth')}
              className="text-brand-charcoal/70 hover:text-brand-charcoal font-brand-body text-sm"
            >
              Agent Login
            </Button>
            <Button 
              variant="brand" 
              size="default"
              onClick={() => navigate('/contact')}
            >
              Book a Consultation
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
