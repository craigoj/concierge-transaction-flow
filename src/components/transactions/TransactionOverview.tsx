import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, User, MapPin, Home, Edit, Zap, Menu, Star } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import ApplyWorkflowDialog from '@/components/workflows/ApplyWorkflowDialog';
import WorkflowHistory from '@/components/workflows/WorkflowHistory';
import { useRealtime } from '@/hooks/useRealtime';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

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

  // Mobile Quick Actions Component
  const QuickActions = () => (
    <div className="space-y-2">
      <Button className="w-full justify-start" variant="outline" size="sm">Add Task</Button>
      <Button className="w-full justify-start" variant="outline" size="sm">Upload Document</Button>
      <Button className="w-full justify-start" variant="outline" size="sm">Send Message</Button>
      <Button className="w-full justify-start" variant="outline" size="sm">Add Client</Button>
    </div>
  );

  // Mobile Sidebar Component
  const MobileSidebar = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-xl font-bold text-primary">{completedTasks}</div>
              <div className="text-xs text-muted-foreground">Tasks Done</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-xl font-bold text-primary">{transaction.documents?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Documents</div>
            </div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-xl font-bold text-primary">{transaction.clients?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Clients</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <QuickActions />
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Mobile Header with Menu */}
      {isMobile && (
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold truncate">Transaction Details</h1>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="py-4">
                <MobileSidebar />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Transaction Info */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Transaction Status Card - Mobile Optimized */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg md:text-xl">Transaction Status</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setWorkflowDialogOpen(true)}
                    className="w-full sm:w-auto"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Apply Workflow
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full sm:w-auto"
                    onClick={() => window.location.href = `/transactions/${transaction.id}/service-tier`}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Service Tier
                  </Button>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
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
                  <span className="font-medium">{completedTasks}/{totalTasks} tasks</span>
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

          {/* Property Details - Mobile Responsive */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="h-5 w-5" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium break-words">{transaction.property_address}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.city}, {transaction.state} {transaction.zip_code}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {transaction.purchase_price && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium">
                          ${transaction.purchase_price.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Purchase Price</p>
                      </div>
                    </div>
                  )}

                  {transaction.closing_date && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium">
                          {new Date(transaction.closing_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Closing Date</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clients - Mobile Optimized */}
          {transaction.clients && transaction.clients.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transaction.clients.map((client) => (
                    <div key={client.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{client.full_name}</p>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground mt-1">
                          {client.email && <span className="break-all">{client.email}</span>}
                          {client.phone && <span>{client.phone}</span>}
                        </div>
                      </div>
                      <Badge variant="outline" className="self-start sm:self-center">
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

        {/* Desktop Sidebar - Hidden on Mobile */}
        {!isMobile && (
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
              <CardContent>
                <QuickActions />
              </CardContent>
            </Card>
          </div>
        )}
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
