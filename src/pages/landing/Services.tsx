
import React from 'react';
import LandingHeader from '@/components/landing/LandingHeader';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Services = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-background via-brand-cream to-brand-background">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider mb-6">
            SERVICE TIERS
          </h1>
          <div className="w-32 h-px bg-brand-taupe mx-auto mb-8"></div>
          <p className="text-xl text-brand-charcoal/80 font-brand-body max-w-4xl mx-auto">
            Our tiered service options are designed to grow with you - from foundational support to fully personalized, white-glove coordination. Explore the package that meets your current volume, client load, and business goals.
          </p>
        </div>
      </section>

      {/* Service Tiers */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            
            {/* Buyer Core */}
            <div className="flex flex-col text-center">
              <h3 className="text-2xl font-brand-heading font-semibold tracking-brand-wide uppercase text-brand-charcoal">Buyer Core</h3>
              <div className="font-brand-body text-brand-charcoal/90 mt-6 space-y-1 flex-grow">
                <p className="font-semibold">Full Service TC:</p>
                <p>Broker Paperwork Prep</p>
                <p>Contract Writing</p>
                <p>Compliance</p>
                <p>Email Communication</p>
                <p>Timeline Management</p>
                <p>Inspection Scheduling</p>
                <p>Utility Transfer Guide</p>
                <p>Closing Client Surveys</p>
                <p>Agent Portal</p>
              </div>
              <div className="text-3xl font-brand-heading font-bold text-brand-charcoal mt-6">$545</div>
            </div>

            {/* Buyer Elite */}
            <div className="flex flex-col text-center">
              <h3 className="text-2xl font-brand-heading font-semibold tracking-brand-wide uppercase text-brand-charcoal">Buyer Elite</h3>
              <div className="font-brand-body text-brand-charcoal/90 mt-6 space-y-1 flex-grow">
                <p className="font-semibold">Additional Services:</p>
                <p>Social Media Posts</p>
                <p>Move In Clean Coordination</p>
                <p>Welcome to City Guide</p>
                <p>Taking Care of Your Home Guide</p>
              </div>
              <div className="text-3xl font-brand-heading font-bold text-brand-charcoal mt-6">$595</div>
            </div>

            {/* White-Glove Buyer */}
            <div className="flex flex-col text-center">
              <h3 className="text-2xl font-brand-heading font-semibold tracking-brand-wide uppercase text-brand-charcoal">White-Glove Buyer</h3>
              <div className="font-brand-body text-brand-charcoal/90 mt-6 space-y-1 flex-grow">
                <p className="font-semibold">Additional Services:</p>
                <p>Priority Showing Assistant Coordination</p>
                <p>Custom Closing Gift</p>
                <p>Welcome Home Celebration Install</p>
                <p>Post Closing Touchpoints</p>
              </div>
              <div className="text-3xl font-brand-heading font-bold text-brand-charcoal mt-6 invisible">Price</div>
            </div>

            {/* Listing Core */}
            <div className="flex flex-col text-center">
              <h3 className="text-2xl font-brand-heading font-semibold tracking-brand-wide uppercase text-brand-charcoal">Listing Core</h3>
              <div className="font-brand-body text-brand-charcoal/90 mt-6 space-y-1 flex-grow">
                <p className="font-semibold">Full Service TC:</p>
                <p>Listing and Broker Paperwork Prep</p>
                <p>MLS Management</p>
                <p>Compliance</p>
                <p>Photo and Staging Coordination</p>
                <p>Email Communication</p>
                <p>Timeline Management</p>
                <p>Inspection Scheduling</p>
                <p>Closing Client Surveys</p>
                <p>Agent Portal</p>
              </div>
              <div className="text-3xl font-brand-heading font-bold text-brand-charcoal mt-6">$645</div>
            </div>
            
            {/* Listing Elite */}
            <div className="flex flex-col text-center">
              <h3 className="text-2xl font-brand-heading font-semibold tracking-brand-wide uppercase text-brand-charcoal">Listing Elite</h3>
              <div className="font-brand-body text-brand-charcoal/90 mt-6 space-y-1 flex-grow">
                <p className="font-semibold">Additional Services:</p>
                <p>Social Media Posts</p>
                <p>Property Prep Coordination (Lawn Care, Cleaning)</p>
                <p>Market-Ready Prep Checklist</p>
                <p>Move Out Clean Coordination</p>
              </div>
              <div className="text-3xl font-brand-heading font-bold text-brand-charcoal mt-6">$695</div>
            </div>
            
            {/* White-Glove Listing */}
            <div className="flex flex-col text-center">
              <h3 className="text-2xl font-brand-heading font-semibold tracking-brand-wide uppercase text-brand-charcoal">White-Glove Listing</h3>
              <div className="font-brand-body text-brand-charcoal/90 mt-6 space-y-1 flex-grow">
                <p className="font-semibold">Additional Services:</p>
                <p>Lockbox Install and Pickup</p>
                <p>For Sale Sign Install and Pickup</p>
                <p>Priority Open House Hosting</p>
                <p>Custom Closing Gift and Delivery</p>
                <p>Post Closing Touchpoints</p>
              </div>
              <div className="text-3xl font-brand-heading font-bold text-brand-charcoal mt-6">$995</div>
            </div>
          </div>
        </div>
      </section>

      {/* On-Demand Services */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="bg-brand-taupe-dark text-brand-background p-12 rounded-lg text-center">
            <h2 className="text-3xl md:text-4xl font-brand-heading font-semibold tracking-brand-wide mb-8 uppercase">
              ON-DEMAND SERVICES
            </h2>
            <div className="font-brand-body text-lg space-y-3">
              <p>Compliance Only - $100</p>
              <p>Lockbox Install or Pickup - $35</p>
              <p>For Sale Sign Install - $75</p>
              <p>Open House Set Up - $95</p>
              <p className="text-sm opacity-80 max-w-md mx-auto">Directional Signs, Printed Flyers, Indoor Prop, Light Snack and Drink Station</p>
              <p>Welcome Home Celebration Install - $150</p>
              <p className="text-sm opacity-80">Oversized Balloon Display, Champagne & Glasses</p>
              <p>Mobile Notary Closing at Home - $175</p>
            </div>
          </div>
        </div>
      </section>

      {/* Beyond The Transaction */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-10 uppercase">
            Beyond The Transaction
          </h2>
          <div className="font-brand-body text-xl text-brand-charcoal/90 space-y-4 tracking-wider">
            <p className='font-semibold'>ALL MEMBER ACCESS</p>
            <p>Open House Host Network</p>
            <p>Showing Support Network</p>
            <p>New Agent Coaching</p>
            <p>Agent Workshops</p>
            <p>Trusted Vendor Connections</p>
          </div>
        </div>
      </section>

      {/* The Concierge Network */}
      <section className="py-20 bg-white/60 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-10 uppercase">
            The Concierge Network
          </h2>
          <div className="space-y-6 font-brand-body text-lg text-brand-charcoal/80 leading-relaxed text-justify">
            <p>At The Agent Concierge, we believe strategic support should extend beyond the contract. That's why we've cultivated a growing network of local licensed agents across the Hampton Roads area to provide seamless assistance when your time is needed elsewhere.</p>
            <div>
              <h4 className="font-bold text-left mb-2 text-brand-charcoal">Showing Support</h4>
              <p>Need help covering a buyer showing? Simply let us know, and we'll reach out to our network to coordinate a match. You'll pay a straightforward, per-door fee once confirmed. Every showing assistant receives clear guidance to ensure a professional, respectful, and efficient experience for your client.</p>
            </div>
            <div>
              <h4 className="font-bold text-left mb-2 text-brand-charcoal">Open House Hosting</h4>
              <p>Looking to generate momentum around a listing without giving up your weekend? We'll connect you with a local agent excited to host and represent your brand with care. All of our hosts receive guidance on how to conduct an effective, professional, and successful open house.</p>
            </div>
            <p>While availability may vary, our expanding network offers flexible, coordinated solutions that help you protect your time - without compromising service.</p>
          </div>
          <div className="mt-12 border-t border-brand-taupe/50 pt-8">
            <h4 className="font-brand-heading tracking-wide text-brand-charcoal">INTERESTED IN SHOWING OR HOSTING OPPORTUNITIES?</h4>
            <p className="font-brand-body text-brand-charcoal/80 my-4">LICENSED AGENTS CAN REQUEST TO JOIN OUR NETWORK AND GET NOTIFIED WHEN OPPORTUNITIES BECOME AVAILABLE.</p>
            <Button variant="outline" onClick={() => navigate('/contact')}>
              Reach Out
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
