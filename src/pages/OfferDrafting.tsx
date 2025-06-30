
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { OfferDraftingForm } from '@/components/forms/OfferDraftingForm';
import Breadcrumb from '@/components/navigation/Breadcrumb';

const OfferDrafting = () => {
  const navigate = useNavigate();
  const { transactionId } = useParams();

  const handleSuccess = () => {
    navigate(transactionId ? `/transactions/${transactionId}` : '/transactions');
  };

  const handleCancel = () => {
    navigate(transactionId ? `/transactions/${transactionId}` : '/transactions');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-background via-brand-background to-brand-taupe/10">
      <div className="p-8">
        <div className="mb-8">
          <Breadcrumb />
        </div>
        
        <OfferDraftingForm
          transactionId={transactionId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default OfferDrafting;
