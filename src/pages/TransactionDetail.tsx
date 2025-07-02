
import React from 'react';
import { useParams } from 'react-router-dom';
import { useTransactionData } from '@/hooks/queries/useTransactionData';
import AppHeader from '@/components/AppHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TransactionOverview from '@/components/transactions/TransactionOverview';
import TransactionTimeline from '@/components/transactions/TransactionTimeline';
import TransactionDocuments from '@/components/transactions/TransactionDocuments';
import TransactionTasks from '@/components/transactions/TransactionTasks';
import TransactionCommunications from '@/components/transactions/TransactionCommunications';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { useUserRole } from '@/hooks/useUserRole';

const TransactionDetail = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useUserRole();

  // Use the existing hook that properly handles authentication
  const { data: transaction, isLoading, error } = useTransactionData(transactionId || '');

  // Show loading while checking user role
  if (roleLoading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-7xl mx-auto px-8 py-10">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-red-800 mb-2">Access Error</h2>
              <p className="text-red-700 mb-4">
                {error.message.includes('Row Level Security') 
                  ? `You don't have permission to access this transaction. This may be because you're not assigned to it or there's an authentication issue.`
                  : `Error loading transaction: ${error.message}`
                }
              </p>
              <div className="space-y-2 text-sm text-red-600 mb-6">
                <p><strong>Transaction ID:</strong> {transactionId}</p>
                <p><strong>Your Role:</strong> {role}</p>
                <p><strong>Error Details:</strong> {error.message}</p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/transactions')}
                  variant="outline"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Transactions
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  variant="default"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-7xl mx-auto px-8 py-10">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Transaction Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The transaction you're looking for doesn't exist or you don't have access to it.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground mb-6">
                <p><strong>Transaction ID:</strong> {transactionId}</p>
                <p><strong>Your Role:</strong> {role}</p>
              </div>
              <Button onClick={() => navigate('/transactions')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Transactions
              </Button>
            </CardContent>
          </Card>
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
