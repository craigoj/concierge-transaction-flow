
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AppHeader from '@/components/AppHeader';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import TransactionList from '@/components/transactions/TransactionList';
import CreateTransactionDialog from '@/components/transactions/CreateTransactionDialog';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Transactions = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
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
      return data;
    },
  });

  const filteredTransactions = transactions?.filter(transaction => {
    switch (activeTab) {
      case 'active':
        return transaction.status === 'active';
      case 'pending':
        return transaction.status === 'intake';
      case 'completed':
        return transaction.status === 'closed';
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
    <>
      <AppSidebar />
      <SidebarInset className="flex-1">
        <AppHeader />
        
        <main className="p-8">
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
              <Button 
                onClick={() => setCreateDialogOpen(true)} 
                className="bg-brand-charcoal hover:bg-brand-taupe-dark text-brand-background font-brand-heading tracking-wide px-8 py-4 rounded-xl shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-300 gap-3"
                size="lg"
              >
                <Plus className="h-5 w-5" />
                NEW TRANSACTION
              </Button>
            </div>
            <div className="w-24 h-px bg-brand-taupe"></div>
          </div>

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
              <TransactionList 
                transactions={filteredTransactions} 
                isLoading={isLoading}
                onTransactionClick={(id) => navigate(`/transactions/${id}`)}
              />
            </TabsContent>
          </Tabs>

          <CreateTransactionDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onSuccess={handleTransactionCreate}
          />
        </main>
      </SidebarInset>
    </>
  );
};

export default Transactions;
