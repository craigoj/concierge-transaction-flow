
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ServiceTierSelector from '@/components/transactions/ServiceTierSelector';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';

const ServiceTierSelection = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();

  const { data: transaction, isLoading } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: async () => {
      if (!transactionId) throw new Error('Transaction ID is required');
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!transactionId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-background via-brand-background to-brand-taupe/10">
        <div className="p-8">
          <div className="mb-8">
            <Breadcrumb />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-96 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-background via-brand-background to-brand-taupe/10">
        <div className="p-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-brand-charcoal mb-2">Transaction not found</h2>
            <p className="text-brand-charcoal/60 mb-4">The transaction you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/transactions')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Transactions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const customBreadcrumbs = [
    { label: 'Dashboard', href: '/' },
    { label: 'Transactions', href: '/transactions' },
    { label: transaction.property_address, href: `/transactions/${transaction.id}` },
    { label: 'Service Tier', isCurrentPage: true }
  ];

  // Map transaction_type to the type expected by ServiceTierSelector
  const getTransactionType = (transactionType: string | null): 'buyer' | 'seller' => {
    if (transactionType === 'seller') return 'seller';
    // Default to buyer for 'buyer', 'dual', or null cases
    return 'buyer';
  };

  const transactionType = getTransactionType(transaction.transaction_type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-background via-brand-background to-brand-taupe/10">
      <div className="p-8">
        <div className="mb-8">
          <Breadcrumb items={customBreadcrumbs} />
        </div>

        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/transactions/${transaction.id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Transaction
          </Button>
          <div>
            <h1 className="text-3xl font-brand-heading font-semibold text-brand-charcoal tracking-wide">
              Service Tier Selection
            </h1>
            <p className="text-brand-charcoal/70">
              {transaction.property_address}
            </p>
          </div>
        </div>

        <ServiceTierSelector
          transactionId={transaction.id}
          transactionType={transactionType}
          currentTier={transaction.service_tier}
          onTierSelect={(tier) => {
            console.log('Tier selected:', tier);
          }}
        />
      </div>
    </div>
  );
};

export default ServiceTierSelection;
