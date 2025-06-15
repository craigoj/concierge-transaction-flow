
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AppHeader from '@/components/AppHeader';
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
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-8 py-10">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb />
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-foreground tracking-tight">
              Transactions
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage all your real estate transactions
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Transaction
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
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
    </div>
  );
};

export default Transactions;
