
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  MapPin,
  User,
  FileText,
  CheckSquare
} from 'lucide-react';

interface Transaction {
  id: string;
  property_address: string;
  city: string;
  state: string;
  zip_code: string;
  purchase_price: number;
  closing_date: string;
  status: string;
  agent_id: string;
  created_at: string;
  updated_at: string;
  service_tier?: string;
  transaction_type?: string;
}

const TransactionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { role } = useUserRole();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTransaction();
    }
  }, [id]);

  const fetchTransaction = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      setTransaction(data);
    } catch (error) {
      console.error('Error fetching transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transaction details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Transaction Not Found</h2>
          <p className="text-gray-600 mb-4">The transaction you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/transactions')}>
            Back to Transactions
          </Button>
        </div>
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
            <p className="text-gray-600">ID: {transaction.id}</p>
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
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {transaction.property_address}
              </CardTitle>
              <p className="text-gray-600 mt-1">
                {transaction.city}, {transaction.state} {transaction.zip_code}
              </p>
            </div>
            <Badge className={`text-sm ${getStatusColor(transaction.status)}`}>
              {transaction.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Purchase Price</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(transaction.purchase_price)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Closing Date</p>
                <p className="text-lg font-semibold">
                  {transaction.closing_date ? formatDate(transaction.closing_date) : 'TBD'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Service Tier</p>
                <p className="text-lg font-semibold capitalize">
                  {transaction.service_tier || 'Standard'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Transaction Type</p>
                <p className="text-lg font-semibold capitalize">
                  {transaction.transaction_type || 'Sale'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <CardTitle>Transaction Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Property Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Address:</span> {transaction.property_address}</p>
                    <p><span className="font-medium">City:</span> {transaction.city}</p>
                    <p><span className="font-medium">State:</span> {transaction.state}</p>
                    <p><span className="font-medium">ZIP Code:</span> {transaction.zip_code}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Transaction Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Created:</span> {formatDate(transaction.created_at)}</p>
                    <p><span className="font-medium">Last Updated:</span> {formatDate(transaction.updated_at)}</p>
                    <p><span className="font-medium">Status:</span> {transaction.status}</p>
                    <p><span className="font-medium">Agent ID:</span> {transaction.agent_id}</p>
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
              <p className="text-gray-600">Document management coming soon...</p>
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
              <p className="text-gray-600">Task management coming soon...</p>
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
              <p className="text-gray-600">Timeline view coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransactionDetail;
