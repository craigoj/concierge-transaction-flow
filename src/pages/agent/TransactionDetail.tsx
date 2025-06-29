
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Building, 
  Calendar, 
  DollarSign, 
  Users, 
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useTransactionData } from '@/hooks/queries/useTransactionData';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { useAgentData } from '@/components/agent/SecureAgentDataProvider';

const AgentTransactionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasAccess } = useAgentData();
  const { data: transaction, isLoading } = useTransactionData(id!);

  // Security check - ensure agent has access to this transaction
  if (!isLoading && id && !hasAccess(id)) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-4">
              You don't have permission to view this transaction.
            </p>
            <Button onClick={() => navigate('/agent/transactions')}>
              Back to Transactions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <Breadcrumb />
        </div>
        <div className="space-y-6">
          <div className="h-32 bg-brand-taupe/10 rounded-lg animate-pulse" />
          <div className="h-64 bg-brand-taupe/10 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Transaction Not Found</h3>
            <p className="text-gray-600 mb-4">
              The transaction you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/agent/transactions')}>
              Back to Transactions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'intake': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const completedTasks = transaction.tasks?.filter(task => task.is_completed) || [];
  const pendingTasks = transaction.tasks?.filter(task => !task.is_completed) || [];
  const progressPercentage = transaction.tasks?.length > 0 
    ? Math.round((completedTasks.length / transaction.tasks.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cream via-brand-background to-brand-taupe/20">
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <Breadcrumb />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/agent/transactions')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-brand-heading font-bold text-brand-charcoal tracking-wide">
                Transaction Details
              </h1>
              <p className="text-brand-charcoal/60 font-brand-body mt-1">
                Manage your transaction progress and details
              </p>
            </div>
            <Badge className={getStatusColor(transaction.status)}>
              {transaction.status.toUpperCase()}
            </Badge>
          </div>

          {/* Property Overview Card */}
          <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  <Building className="h-8 w-8 text-brand-charcoal/60" />
                  <div>
                    <p className="text-sm text-brand-charcoal/60 font-brand-body">Property</p>
                    <p className="font-brand-heading font-semibold text-brand-charcoal">
                      {transaction.property_address}
                    </p>
                    <p className="text-sm text-brand-charcoal/60">
                      {transaction.city}, {transaction.state} {transaction.zip_code}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-brand-charcoal/60 font-brand-body">Purchase Price</p>
                    <p className="font-brand-heading font-semibold text-brand-charcoal">
                      {transaction.purchase_price 
                        ? `$${transaction.purchase_price.toLocaleString()}` 
                        : 'TBD'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-brand-charcoal/60 font-brand-body">Closing Date</p>
                    <p className="font-brand-heading font-semibold text-brand-charcoal">
                      {transaction.closing_date 
                        ? new Date(transaction.closing_date).toLocaleDateString()
                        : 'TBD'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-brand-charcoal/60 font-brand-body">Client</p>
                    <p className="font-brand-heading font-semibold text-brand-charcoal">
                      {transaction.clients?.[0]?.full_name || 'TBD'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border border-brand-taupe/20">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Progress Overview */}
            <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Transaction Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold">{progressPercentage}%</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-600 font-semibold">{completedTasks.length}</span>
                    <span className="text-gray-600"> tasks completed</span>
                  </div>
                  <div>
                    <span className="text-amber-600 font-semibold">{pendingTasks.length}</span>
                    <span className="text-gray-600"> tasks remaining</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Information */}
            {transaction.clients && transaction.clients.length > 0 && (
              <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transaction.clients.map((client) => (
                      <div key={client.id} className="border border-brand-taupe/20 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-brand-charcoal">{client.full_name}</h4>
                          <Badge variant="outline">{client.type?.toUpperCase()}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {client.email && (
                            <div>
                              <span className="text-brand-charcoal/60">Email:</span>
                              <span className="ml-2">{client.email}</span>
                            </div>
                          )}
                          {client.phone && (
                            <div>
                              <span className="text-brand-charcoal/60">Phone:</span>
                              <span className="ml-2">{client.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tasks">
            <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
              <CardHeader>
                <CardTitle>Transaction Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {transaction.tasks && transaction.tasks.length > 0 ? (
                  <div className="space-y-3">
                    {transaction.tasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-3 p-3 border border-brand-taupe/20 rounded-lg">
                        <div className={`w-4 h-4 rounded-full ${
                          task.is_completed ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <div className="flex-1">
                          <h4 className={`font-medium ${
                            task.is_completed ? 'text-gray-500 line-through' : 'text-brand-charcoal'
                          }`}>
                            {task.title}
                          </h4>
                          {task.due_date && (
                            <p className="text-sm text-brand-charcoal/60">
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {task.priority && (
                          <Badge variant="outline" className={
                            task.priority === 'high' ? 'border-red-300 text-red-700' :
                            task.priority === 'medium' ? 'border-amber-300 text-amber-700' :
                            'border-green-300 text-green-700'
                          }>
                            {task.priority}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-brand-taupe/40 mx-auto mb-3" />
                    <p className="text-brand-charcoal/60">No tasks assigned yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-brand-taupe/40 mx-auto mb-3" />
                  <p className="text-brand-charcoal/60">Document management coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communication">
            <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
              <CardHeader>
                <CardTitle>Communication History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-brand-taupe/40 mx-auto mb-3" />
                  <p className="text-brand-charcoal/60">Communication history coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AgentTransactionDetail;
