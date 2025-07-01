
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings } from 'lucide-react';
import { TransactionListWithBulk } from '@/components/transactions/TransactionListWithBulk';
import { TransactionTemplateManager } from '@/components/transactions/TransactionTemplateManager';
import CreateTransactionDialog from '@/components/transactions/CreateTransactionDialog';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
  clients: Database['public']['Tables']['clients']['Row'][];
  tasks: Database['public']['Tables']['tasks']['Row'][];
};

type TransactionStatus = 'active' | 'intake' | 'closed';

const Transactions = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ['transactions'],
    queryFn: async (): Promise<Transaction[]> => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          clients (*),
          tasks (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load transactions",
        });
        throw error;
      }
      return data as Transaction[];
    },
  });

  const filteredTransactions = transactions?.filter(transaction => {
    const status = transaction.status as TransactionStatus;
    switch (activeTab) {
      case 'active':
        return status === 'active';
      case 'pending':
        return status === 'intake';
      case 'completed':
        return status === 'closed';
      default:
        return true;
    }
  }) || [];

  const handleTransactionCreate = () => {
    refetch();
    setCreateDialogOpen(false);
    toast({
      title: "Success",
      description: "Transaction created successfully",
    });
  };

  return (
    <div className="p-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-8">
        <Breadcrumb />
      </div>

      {/* Premium Header Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider uppercase mb-4">
              Transactions
            </h1>
            <p className="text-lg font-brand-body text-brand-charcoal/70 max-w-2xl">
              Manage all your real estate transactions with precision and elegance
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => setTemplateManagerOpen(true)}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Templates
            </Button>
            <Button 
              onClick={() => setCreateDialogOpen(true)} 
              className="bg-brand-charcoal hover:bg-brand-taupe-dark text-brand-background font-brand-heading tracking-wide px-8 py-4 rounded-xl shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-300 gap-3"
              size="lg"
            >
              <Plus className="h-5 w-5" />
              NEW TRANSACTION
            </Button>
          </div>
        </div>
        <div className="w-24 h-px bg-brand-taupe"></div>
      </div>

      {/* Template Manager Modal */}
      {templateManagerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-brand-glass max-w-7xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-brand-heading text-brand-charcoal">Transaction Templates</h2>
                <Button variant="ghost" onClick={() => setTemplateManagerOpen(false)}>
                  ×
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <TransactionTemplateManager />
            </div>
          </div>
        </div>
      )}

      {/* Premium Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="flex justify-center">
          <TabsList className="bg-white/80 backdrop-blur-sm border border-brand-taupe/30 rounded-2xl p-2 shadow-brand-subtle">
            <TabsTrigger 
              value="active"
              className="px-8 py-3 rounded-xl text-sm font-brand-heading tracking-brand-wide data-[state=active]:bg-brand-charcoal data-[state=active]:text-brand-background data-[state=active]:shadow-brand-elevation transition-all duration-300"
            >
              ACTIVE
            </TabsTrigger>
            <TabsTrigger 
              value="pending"
              className="px-8 py-3 rounded-xl text-sm font-brand-heading tracking-brand-wide data-[state=active]:bg-brand-charcoal data-[state=active]:text-brand-background data-[state=active]:shadow-brand-elevation transition-all duration-300"
            >
              PENDING
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className="px-8 py-3 rounded-xl text-sm font-brand-heading tracking-brand-wide data-[state=active]:bg-brand-charcoal data-[state=active]:text-brand-background data-[state=active]:shadow-brand-elevation transition-all duration-300"
            >
              COMPLETED
            </TabsTrigger>
            <TabsTrigger 
              value="all"
              className="px-8 py-3 rounded-xl text-sm font-brand-heading tracking-brand-wide data-[state=active]:bg-brand-charcoal data-[state=active]:text-brand-background data-[state=active]:shadow-brand-elevation transition-all duration-300"
            >
              ALL
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="space-y-6">
          <TransactionListWithBulk 
            transactions={filteredTransactions} 
            isLoading={isLoading}
            onTransactionClick={(id) => navigate(`/transactions/${id}`)}
            enableBulkActions={true}
          />
        </TabsContent>
      </Tabs>

      <CreateTransactionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleTransactionCreate}
      />
    </div>
  );
};

export default Transactions;
