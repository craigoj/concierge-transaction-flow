
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Home, 
  FileText, 
  MessageSquare, 
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Star,
  Phone,
  Mail
} from 'lucide-react';

interface ClientPortalProps {
  transactionId: string;
  clientId?: string;
}

const ClientPortal = ({ transactionId, clientId }: ClientPortalProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: transactionData } = useQuery({
    queryKey: ['client-transaction', transactionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          clients(*),
          tasks(*),
          documents(*),
          communications(*)
        `)
        .eq('id', transactionId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: agentInfo } = useQuery({
    queryKey: ['agent-info', transactionData?.agent_id],
    queryFn: async () => {
      if (!transactionData?.agent_id) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', transactionData.agent_id)
        .single();
      
      return data;
    },
    enabled: !!transactionData?.agent_id
  });

  if (!transactionData) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const completedTasks = transactionData.tasks?.filter(task => task.is_completed) || [];
  const totalTasks = transactionData.tasks?.length || 0;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'intake': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cream to-white">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-brand-charcoal mb-2">
            Your Transaction Portal
          </h1>
          <p className="text-brand-charcoal/60">
            Track your real estate transaction progress and access important documents
          </p>
        </div>

        {/* Transaction Overview Card */}
        <Card className="mb-8 bg-white/90 backdrop-blur-sm border-brand-taupe/20">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <Home className="h-12 w-12 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-lg">Property</h3>
                  <p className="text-sm text-gray-600">{transactionData.property_address}</p>
                  <p className="text-sm text-gray-500">
                    {transactionData.city}, {transactionData.state} {transactionData.zip_code}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <div className="mb-2">
                  <Badge className={getStatusColor(transactionData.status)}>
                    {transactionData.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-brand-charcoal">
                    {progressPercentage}%
                  </div>
                  <div className="text-sm text-gray-600">Complete</div>
                  <Progress value={progressPercentage} className="w-full" />
                </div>
              </div>

              <div className="text-center md:text-right">
                {transactionData.purchase_price && (
                  <div className="mb-2">
                    <div className="text-2xl font-bold text-green-600">
                      ${transactionData.purchase_price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Purchase Price</div>
                  </div>
                )}
                {transactionData.closing_date && (
                  <div>
                    <div className="font-semibold">
                      {new Date(transactionData.closing_date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">Target Closing</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Contact Card */}
        {agentInfo && (
          <Card className="mb-8 bg-white/90 backdrop-blur-sm border-brand-taupe/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Your Agent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-brand-taupe/20 rounded-full flex items-center justify-center">
                  <span className="text-xl font-semibold text-brand-charcoal">
                    {(agentInfo.first_name?.[0] || '') + (agentInfo.last_name?.[0] || '')}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {agentInfo.first_name} {agentInfo.last_name}
                  </h3>
                  <p className="text-gray-600">{agentInfo.brokerage}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{agentInfo.phone_number}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{agentInfo.email}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button size="sm" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button size="sm" variant="outline" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="communication">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">Inspection completed</div>
                        <div className="text-sm text-gray-600">2 days ago</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Contract signed</div>
                        <div className="text-sm text-gray-600">1 week ago</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <div>
                        <div className="font-medium">Appraisal scheduled</div>
                        <div className="text-sm text-gray-600">Next Tuesday</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
                <CardHeader>
                  <CardTitle>What's Next</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                      <div className="font-semibold text-blue-800">Action Required</div>
                      <div className="text-sm text-blue-700 mt-1">
                        Review and sign the final settlement statement
                      </div>
                      <Button size="sm" className="mt-2">
                        Review Document
                      </Button>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="font-semibold">Upcoming</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Final walkthrough scheduled for March 15th
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
              <CardHeader>
                <CardTitle>Transaction Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactionData.tasks?.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      {task.is_completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                      <div className="flex-1">
                        <div className={`font-medium ${task.is_completed ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-sm text-gray-600">{task.description}</div>
                        )}
                        {task.due_date && (
                          <div className="text-sm text-gray-500">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <Badge variant={task.is_completed ? 'default' : 'secondary'}>
                        {task.is_completed ? 'Complete' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
              <CardHeader>
                <CardTitle>Transaction Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactionData.documents?.filter(doc => doc.is_agent_visible)?.map((document) => (
                    <div key={document.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="font-medium">{document.file_name}</div>
                        <div className="text-sm text-gray-600">
                          Uploaded {new Date(document.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      No documents available yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communication" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
              <CardHeader>
                <CardTitle>Message History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock message history */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="font-medium">From: {agentInfo?.first_name} {agentInfo?.last_name}</div>
                    <div className="text-sm text-gray-600 mb-2">2 hours ago</div>
                    <p className="text-sm">
                      Hi! Just wanted to update you that the inspection went great. 
                      Only minor items were found and we're moving forward as planned.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium">From: You</div>
                    <div className="text-sm text-gray-600 mb-2">1 day ago</div>
                    <p className="text-sm">
                      Thank you for the update! Looking forward to the closing.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send New Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientPortal;
