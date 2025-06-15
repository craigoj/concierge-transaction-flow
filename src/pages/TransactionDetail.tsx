
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AppHeader from '@/components/AppHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TransactionOverview from '@/components/transactions/TransactionOverview';
import TransactionTimeline from '@/components/transactions/TransactionTimeline';
import TransactionDocuments from '@/components/transactions/TransactionDocuments';
import TransactionTasks from '@/components/transactions/TransactionTasks';
import TransactionCommunications from '@/components/transactions/TransactionCommunications';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/components/navigation/Breadcrumb';

const TransactionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: transaction, isLoading } = useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      if (!id) throw new Error('Transaction ID is required');
      
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          clients (*),
          tasks (*),
          documents (*)
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
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-7xl mx-auto px-8 py-10">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-7xl mx-auto px-8 py-10">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Transaction not found</h2>
            <p className="text-muted-foreground mb-4">The transaction you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/transactions')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Transactions
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const customBreadcrumbs = [
    { label: 'Dashboard', href: '/' },
    { label: 'Transactions', href: '/transactions' },
    { label: transaction.property_address, isCurrentPage: true }
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-8 py-10">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb items={customBreadcrumbs} />
        </div>

        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Transactions
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-foreground tracking-tight">
              {transaction.property_address}
            </h1>
            <p className="text-muted-foreground">
              {transaction.city}, {transaction.state} {transaction.zip_code}
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <TransactionOverview transaction={transaction} />
          </TabsContent>

          <TabsContent value="timeline">
            <TransactionTimeline transaction={transaction} />
          </TabsContent>

          <TabsContent value="tasks">
            <TransactionTasks transactionId={transaction.id} />
          </TabsContent>

          <TabsContent value="documents">
            <TransactionDocuments transactionId={transaction.id} />
          </TabsContent>

          <TabsContent value="communications">
            <TransactionCommunications transactionId={transaction.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TransactionDetail;
