
import React from 'react';
import { OfferDraftingForm } from '@/components/forms/OfferDraftingForm';
import Breadcrumb from '@/components/navigation/Breadcrumb';

const OfferDrafting = () => {
  return (
    <div className="min-h-screen bg-brand-background">
      {/* Breadcrumb Navigation */}
      <div className="p-8 pb-0">
        <Breadcrumb />
      </div>

      {/* Premium Header Section */}
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider uppercase mb-4">
            Digital Offer Drafting
          </h1>
          <p className="text-lg font-brand-body text-brand-charcoal/70 max-w-2xl">
            Create professional offer requests with our streamlined digital process
          </p>
          <div className="w-24 h-px bg-brand-taupe mt-6"></div>
        </div>

        <OfferDraftingForm />
      </div>
    </div>
  );
};

export default OfferDrafting;
