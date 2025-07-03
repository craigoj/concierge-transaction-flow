
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useTransactionData } from '@/hooks/queries/useTransactionData';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  MapPin,
  User,
  FileText,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import TransactionOverview from '@/components/transactions/TransactionOverview';

const TransactionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { role } = useUserRole();
  
  const { data: transaction, isLoading, error } = useTransactionData(id!);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'intake': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-32" />
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>

        {/* Transaction Overview Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="h-6 w-80 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div>
                    <Skeleton className="h-3 w-20 mb-1" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/transactions')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Transactions</span>
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Transaction</h3>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <div className="flex justify-center space-x-2">
              <Button onClick={() => navigate('/transactions')}>
                Back to Transactions
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/transactions')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Transactions</span>
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Transaction Not Found</h3>
            <p className="text-gray-600 mb-4">
              The transaction you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate('/transactions')}>
              Back to Transactions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canEdit = role === 'coordinator' || transaction.agent_id === user?.id;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/transactions')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Transactions</span>
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transaction Details</h1>
            <p className="text-gray-600">ID: {transaction.id.slice(0, 8)}...</p>
          </div>
        </div>
        
        {canEdit && (
          <div className="flex space-x-2">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            {role === 'coordinator' && (
              <Button variant="outline" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Transaction Overview */}
      <TransactionOverview transaction={transaction} />

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Transaction Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Type:</span> {transaction.transaction_type || 'Not specified'}</p>
                    <p><span className="font-medium">Service Tier:</span> {transaction.service_tier || 'Standard'}</p>
                    <p><span className="font-medium">Commission Rate:</span> {transaction.commission_rate ? `${transaction.commission_rate}%` : 'Not set'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Created:</span> {formatDate(transaction.created_at)}</p>
                    <p><span className="font-medium">Last Updated:</span> {formatDate(transaction.updated_at)}</p>
                    {transaction.closing_date && (
                      <p><span className="font-medium">Closing Date:</span> {formatDate(transaction.closing_date)}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No documents uploaded yet</p>
                <Button className="mt-4" variant="outline">
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckSquare className="h-5 w-5" />
                <span>Tasks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transaction.tasks && transaction.tasks.length > 0 ? (
                <div className="space-y-3">
                  {transaction.tasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <input 
                        type="checkbox" 
                        checked={task.is_completed}
                        className="h-4 w-4"
                        readOnly
                      />
                      <div className="flex-1">
                        <p className={`font-medium ${task.is_completed ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-gray-600">{task.description}</p>
                        )}
                        {task.due_date && (
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {formatDate(task.due_date)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No tasks created yet</p>
                  <Button className="mt-4" variant="outline">
                    Add Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Timeline view coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransactionDetail;
