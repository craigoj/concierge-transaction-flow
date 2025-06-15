
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import TransactionProgressTracker from '@/components/agent/TransactionProgressTracker';
import ActionRequiredPanel from '@/components/agent/ActionRequiredPanel';
import WhatsNextPanel from '@/components/agent/WhatsNextPanel';
import AgentDocumentsList from '@/components/agent/AgentDocumentsList';
import { useAgentData } from '@/components/agent/SecureAgentDataProvider';

const TransactionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasAccess } = useAgentData();

  const { data: transaction, isLoading } = useQuery({
    queryKey: ['agent-transaction', id],
    queryFn: async () => {
      if (!id) throw new Error('Transaction ID is required');
      
      // With RLS policies, this will only return the transaction if the agent has access
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          clients (*),
          tasks (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="text-center py-12">
          <Shield className="h-16 w-16 text-brand-taupe mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-brand-charcoal mb-2">Access Denied</h2>
          <p className="text-brand-charcoal/60 mb-4">
            You don't have permission to view this transaction, or it doesn't exist.
          </p>
          <Button onClick={() => navigate('/agent/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Additional security check using the agent data context
  if (id && !hasAccess(id)) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="text-center py-12">
          <Shield className="h-16 w-16 text-brand-taupe mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-brand-charcoal mb-2">Access Restricted</h2>
          <p className="text-brand-charcoal/60 mb-4">
            This transaction is not assigned to you.
          </p>
          <Button onClick={() => navigate('/agent/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const pendingTasks = transaction.tasks?.filter(task => !task.is_completed) || [];

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/agent/dashboard')}
          className="text-brand-charcoal/60 hover:text-brand-charcoal"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-brand-heading font-semibold text-brand-charcoal tracking-wide">
            {transaction.property_address}
          </h1>
          <p className="text-brand-charcoal/60 font-brand-serif">
            {transaction.city}, {transaction.state} {transaction.zip_code}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Progress Tracker */}
        <div className="lg:col-span-2 space-y-8">
          <TransactionProgressTracker transaction={transaction} />
          <AgentDocumentsList transactionId={transaction.id} />
        </div>

        {/* Sidebar Panels */}
        <div className="space-y-6">
          <ActionRequiredPanel pendingTasks={pendingTasks} />
          <WhatsNextPanel transaction={transaction} />
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
