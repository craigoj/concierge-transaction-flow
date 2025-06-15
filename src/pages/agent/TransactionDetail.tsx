
import React from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import TransactionProgressTracker from '@/components/agent/TransactionProgressTracker';
import PremiumActionRequiredPanel from '@/components/agent/PremiumActionRequiredPanel';
import PremiumWhatsNextPanel from '@/components/agent/PremiumWhatsNextPanel';
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
      <div className="min-h-screen bg-gradient-to-br from-brand-background via-brand-cream/30 to-brand-background">
        <div className="container mx-auto px-6 md:px-8 py-12 max-w-7xl">
          <div className="space-y-8">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-background via-brand-cream/30 to-brand-background">
        <div className="container mx-auto px-6 md:px-8 py-12 max-w-7xl">
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Shield className="h-20 w-20 text-brand-taupe mx-auto mb-6" />
            <h2 className="text-3xl font-brand-heading font-semibold text-brand-charcoal mb-4 tracking-wide">
              Access Denied
            </h2>
            <p className="text-brand-charcoal/60 font-brand-body text-lg mb-8 max-w-md mx-auto leading-relaxed">
              You don't have permission to view this transaction, or it doesn't exist.
            </p>
            <Button 
              onClick={() => navigate('/agent/dashboard')}
              className="bg-brand-charcoal hover:bg-brand-taupe-dark text-white font-brand-heading tracking-wide uppercase"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (id && !hasAccess(id)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-background via-brand-cream/30 to-brand-background">
        <div className="container mx-auto px-6 md:px-8 py-12 max-w-7xl">
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Shield className="h-20 w-20 text-brand-taupe mx-auto mb-6" />
            <h2 className="text-3xl font-brand-heading font-semibold text-brand-charcoal mb-4 tracking-wide">
              Access Restricted
            </h2>
            <p className="text-brand-charcoal/60 font-brand-body text-lg mb-8 max-w-md mx-auto leading-relaxed">
              This transaction is not assigned to you.
            </p>
            <Button 
              onClick={() => navigate('/agent/dashboard')}
              className="bg-brand-charcoal hover:bg-brand-taupe-dark text-white font-brand-heading tracking-wide uppercase"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  const pendingTasks = transaction.tasks?.filter(task => !task.is_completed) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-background via-brand-cream/30 to-brand-background">
      <div className="container mx-auto px-6 md:px-8 py-12 max-w-7xl">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row items-start gap-6 mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/agent/dashboard')}
            className="text-brand-charcoal/60 hover:text-brand-charcoal hover:bg-brand-taupe/10 font-brand-heading tracking-wide uppercase self-start"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-brand-heading font-semibold text-brand-charcoal tracking-wide mb-2">
              {transaction.property_address}
            </h1>
            <p className="text-brand-charcoal/60 font-brand-body text-lg">
              {transaction.city}, {transaction.state} {transaction.zip_code}
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          {/* Main Progress Tracker */}
          <motion.div 
            className="xl:col-span-2 space-y-10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <TransactionProgressTracker transaction={transaction} />
            <AgentDocumentsList transactionId={transaction.id} />
          </motion.div>

          {/* Premium Sidebar Panels */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <PremiumActionRequiredPanel pendingTasks={pendingTasks} />
            <PremiumWhatsNextPanel transaction={transaction} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
