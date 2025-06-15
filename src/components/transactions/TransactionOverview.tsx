import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, User, MapPin, Home, Edit, Zap } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import ApplyWorkflowDialog from '@/components/workflows/ApplyWorkflowDialog';
import WorkflowHistory from '@/components/workflows/WorkflowHistory';
import { useRealtime } from '@/hooks/useRealtime';

type Transaction = Tables<'transactions'> & {
  clients: Tables<'clients'>[];
  tasks: Tables<'tasks'>[];
  documents: Tables<'documents'>[];
};

interface TransactionOverviewProps {
  transaction: Transaction;
}

const TransactionOverview = ({ transaction }: TransactionOverviewProps) => {
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);

  // Enable real-time updates for this transaction
  useRealtime({
    table: 'tasks',
    queryKeys: [['transaction', transaction.id], ['tasks', transaction.id]],
    filter: { column: 'transaction_id', value: transaction.id }
  });

  useRealtime({
    table: 'transactions',
    queryKeys: [['transaction', transaction.id]],
    filter: { column: 'id', value: transaction.id }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'intake':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceTierDisplay = (tier: string | null) => {
    if (!tier) return 'Standard';
    return tier.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const completedTasks = transaction.tasks?.filter(task => task.is_completed).length || 0;
  const totalTasks = transaction.tasks?.length || 0;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Transaction Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Transaction Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Transaction Status</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setWorkflowDialogOpen(true)}
              >
                <Zap className="h-4 w-4 mr-2" />
                Apply Workflow
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className={getStatusColor(transaction.status)}>
                {transaction.status.toUpperCase()}
              </Badge>
              {transaction.transaction_type && (
                <Badge variant="outline">
                  {transaction.transaction_type.toUpperCase()}
                </Badge>
              )}
              {transaction.service_tier && (
                <Badge variant="secondary">
                  {getServiceTierDisplay(transaction.service_tier)}
                </Badge>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{completedTasks}/{totalTasks} tasks completed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{transaction.property_address}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.city}, {transaction.state} {transaction.zip_code}
                  </p>
                </div>
              </div>

              {transaction.purchase_price && (
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      ${transaction.purchase_price.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Purchase Price</p>
                  </div>
                </div>
              )}

              {transaction.closing_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {new Date(transaction.closing_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Closing Date</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Clients */}
        {transaction.clients && transaction.clients.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transaction.clients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{client.full_name}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {client.email && <span>{client.email}</span>}
                        {client.phone && <span>{client.phone}</span>}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {client.type.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workflow History */}
        <WorkflowHistory transactionId={transaction.id} />
      </div>

      {/* Quick Stats Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{completedTasks}</div>
              <div className="text-sm text-muted-foreground">Tasks Completed</div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{transaction.documents?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Documents</div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{transaction.clients?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Clients</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline">Add Task</Button>
            <Button className="w-full" variant="outline">Upload Document</Button>
            <Button className="w-full" variant="outline">Send Message</Button>
            <Button className="w-full" variant="outline">Add Client</Button>
          </CardContent>
        </Card>
      </div>

      {/* Apply Workflow Dialog */}
      <ApplyWorkflowDialog
        open={workflowDialogOpen}
        onOpenChange={setWorkflowDialogOpen}
        transactionId={transaction.id}
        transactionType={transaction.transaction_type}
        serviceTier={transaction.service_tier}
      />
    </div>
  );
};

export default TransactionOverview;
