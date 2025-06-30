
import React from 'react';
import { useParams } from 'react-router-dom';
import ClientPortal from '@/components/portal/ClientPortal';

const ClientPortalPage = () => {
  const { transactionId } = useParams<{ transactionId: string }>();

  if (!transactionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-cream to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-charcoal mb-2">Invalid Portal Link</h1>
          <p className="text-brand-charcoal/60">The portal link you used is not valid.</p>
        </div>
      </div>
    );
  }

  return <ClientPortal transactionId={transactionId} />;
};

export default ClientPortalPage;
