
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, DollarSign, User, MapPin, Home, Edit, Zap, Menu, Star, Plus, Upload, MessageSquare, UserPlus } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import ApplyWorkflowDialog from '@/components/workflows/ApplyWorkflowDialog';
import WorkflowHistory from '@/components/workflows/WorkflowHistory';
import { useRealtime } from '@/hooks/useRealtime';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';

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
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [uploadDocumentOpen, setUploadDocumentOpen] = useState(false);
  const [sendMessageOpen, setSendMessageOpen] = useState(false);
  const [editTransactionOpen, setEditTransactionOpen] = useState(false);
  const [serviceTierOpen, setServiceTierOpen] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

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

  // Helper function to check service tier levels
  const isServiceTierLevel = (tier: string | null, level: string) => {
    if (!tier) return false;
    switch (level) {
      case 'core':
        return tier === 'buyer_core' || tier === 'listing_core';
      case 'elite':
        return tier === 'buyer_elite' || tier === 'listing_elite';
      case 'white_glove':
        return tier === 'white_glove_buyer' || tier === 'white_glove_listing';
      default:
        return false;
    }
  };

  const completedTasks = transaction.tasks?.filter(task => task.is_completed).length || 0;
  const totalTasks = transaction.tasks?.length || 0;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Enhanced Quick Actions Component with click handlers
  const QuickActions = () => (
    <div className="space-y-2">
      <Button 
        className="w-full justify-start" 
        variant="outline" 
        size="sm"
        onClick={() => setAddTaskOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Task
      </Button>
      <Button 
        className="w-full justify-start" 
        variant="outline" 
        size="sm"
        onClick={() => setUploadDocumentOpen(true)}
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload Document
      </Button>
      <Button 
        className="w-full justify-start" 
        variant="outline" 
        size="sm"
        onClick={() => setSendMessageOpen(true)}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Send Message
      </Button>
      <Button 
        className="w-full justify-start" 
        variant="outline" 
        size="sm"
        onClick={() => setAddClientOpen(true)}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Add Client
      </Button>
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
                    onClick={() => setServiceTierOpen(true)}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Service Tier
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full sm:w-auto"
                    onClick={() => setEditTransactionOpen(true)}
                  >
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

      {/* Modal Dialogs */}
      <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <Button 
              onClick={() => {
                setAddTaskOpen(false);
                const tasksTab = document.querySelector('[value="tasks"]') as HTMLElement;
                if (tasksTab) tasksTab.click();
                toast({ title: "Navigating to Tasks", description: "You can add a new task in the Tasks tab." });
              }}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Go to Tasks Tab
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={uploadDocumentOpen} onOpenChange={setUploadDocumentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <Button 
              onClick={() => {
                setUploadDocumentOpen(false);
                const documentsTab = document.querySelector('[value="documents"]') as HTMLElement;
                if (documentsTab) documentsTab.click();
                toast({ title: "Navigating to Documents", description: "You can upload documents in the Documents tab." });
              }}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Go to Documents Tab
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={sendMessageOpen} onOpenChange={setSendMessageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <Button 
              onClick={() => {
                setSendMessageOpen(false);
                const commTab = document.querySelector('[value="communications"]') as HTMLElement;
                if (commTab) commTab.click();
                toast({ title: "Navigating to Communications", description: "You can send messages in the Communications tab." });
              }}
              className="w-full"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Go to Communications Tab
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={addClientOpen} onOpenChange={setAddClientOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <Input placeholder="Full Name" />
            <Input placeholder="Email Address" type="email" />
            <Input placeholder="Phone Number" type="tel" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Client Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buyer">Buyer</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setAddClientOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={() => {
                  setAddClientOpen(false);
                  toast({ title: "Client Added", description: "Client has been added to the transaction." });
                }}
              >
                Add Client
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editTransactionOpen} onOpenChange={setEditTransactionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Property Address</Label>
                <Input defaultValue={transaction.property_address} />
              </div>
              <div>
                <Label>City</Label>
                <Input defaultValue={transaction.city} />
              </div>
              <div>
                <Label>State</Label>
                <Input defaultValue={transaction.state} />
              </div>
              <div>
                <Label>ZIP Code</Label>
                <Input defaultValue={transaction.zip_code} />
              </div>
              <div>
                <Label>Purchase Price</Label>
                <Input 
                  type="number" 
                  defaultValue={transaction.purchase_price} 
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Closing Date</Label>
                <Input 
                  type="date" 
                  defaultValue={transaction.closing_date ? new Date(transaction.closing_date).toISOString().split('T')[0] : ''}
                />
              </div>
            </div>
            <div>
              <Label>Transaction Status</Label>
              <Select defaultValue={transaction.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intake">Intake</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditTransactionOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={() => {
                  setEditTransactionOpen(false);
                  toast({ title: "Transaction Updated", description: "Transaction details have been saved." });
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={serviceTierOpen} onOpenChange={setServiceTierOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Service Tier Management</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div className="space-y-3">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Core Service</h4>
                    <p className="text-sm text-gray-600">Essential transaction management</p>
                  </div>
                  <Button 
                    variant={isServiceTierLevel(transaction.service_tier, 'core') ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => {
                      toast({ title: "Service Tier", description: "Core service tier selected." });
                    }}
                  >
                    {isServiceTierLevel(transaction.service_tier, 'core') ? 'Current' : 'Select'}
                  </Button>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Elite Service</h4>
                    <p className="text-sm text-gray-600">Enhanced features and priority support</p>
                  </div>
                  <Button 
                    variant={isServiceTierLevel(transaction.service_tier, 'elite') ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => {
                      toast({ title: "Service Tier", description: "Elite service tier selected." });
                    }}
                  >
                    {isServiceTierLevel(transaction.service_tier, 'elite') ? 'Current' : 'Upgrade'}
                  </Button>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">White Glove Service</h4>
                    <p className="text-sm text-gray-600">Premium concierge experience</p>
                  </div>
                  <Button 
                    variant={isServiceTierLevel(transaction.service_tier, 'white_glove') ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => {
                      toast({ title: "Service Tier", description: "White Glove service tier selected." });
                    }}
                  >
                    {isServiceTierLevel(transaction.service_tier, 'white_glove') ? 'Current' : 'Upgrade'}
                  </Button>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={() => setServiceTierOpen(false)} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
