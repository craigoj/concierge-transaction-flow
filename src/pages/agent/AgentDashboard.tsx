
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  FileText, 
  Users, 
  TrendingUp, 
  Clock,
  AlertCircle,
  CheckCircle2,
  Building,
  Phone,
  Mail,
  MapPin,
  DollarSign
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DashboardStats from "@/components/dashboard/DashboardStats";

interface AgentTransaction {
  id: string;
  property_address: string;
  status: string;
  purchase_price: number | null;
  closing_date: string | null;
  created_at: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  agent_first_name?: string;
  agent_last_name?: string;
}

interface AgentTask {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  is_completed: boolean;
  priority: string;
  requires_agent_action: boolean;
}

interface AgentClient {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  type: string;
  created_at: string;
  transaction_id: string;
}

interface AgentDashboardData {
  transactions: AgentTransaction[];
  tasks: AgentTask[];
  clients: AgentClient[];
}

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch agent-specific data with explicit typing
  const { data: agentData, isLoading } = useQuery<AgentDashboardData>({
    queryKey: ['agentDashboard'],
    queryFn: async (): Promise<AgentDashboardData> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch transactions with clients in a single query
      const { data: transactionsWithClients, error: transactionError } = await supabase
        .from('transactions')
        .select(`
          *,
          clients!clients_transaction_id_fkey(
            id,
            full_name,
            email,
            phone,
            type,
            created_at,
            transaction_id
          )
        `)
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (transactionError) throw transactionError;

      // Fetch tasks separately
      const { data: tasks, error: taskError } = await supabase
        .from('tasks')
        .select('id, title, description, due_date, is_completed, priority, requires_agent_action')
        .in('transaction_id', transactionsWithClients?.map(t => t.id) || [])
        .order('due_date', { ascending: true });

      if (taskError) throw taskError;

      // Transform transactions data
      const transformedTransactions: AgentTransaction[] = transactionsWithClients?.map(t => {
        const primaryClient = t.clients?.[0];
        return {
          id: t.id,
          property_address: t.property_address,
          status: t.status,
          purchase_price: t.purchase_price,
          closing_date: t.closing_date,
          created_at: t.created_at,
          client_name: primaryClient?.full_name,
          client_email: primaryClient?.email,
          client_phone: primaryClient?.phone
        };
      }) || [];

      // Get all clients from transactions
      const allClients: AgentClient[] = [];
      transactionsWithClients?.forEach(t => {
        if (t.clients && Array.isArray(t.clients)) {
          t.clients.forEach(client => {
            allClients.push({
              id: client.id,
              full_name: client.full_name,
              email: client.email,
              phone: client.phone,
              type: client.type,
              created_at: client.created_at,
              transaction_id: t.id
            });
          });
        }
      });

      return {
        transactions: transformedTransactions,
        tasks: tasks || [],
        clients: allClients
      };
    }
  });

  const handleDashboardAction = (action: string) => {
    switch (action) {
      case 'new-transaction':
        navigate('/agent/transactions');
        break;
      case 'add-client':
        navigate('/agent/clients/new');
        break;
      case 'schedule-inspection':
        navigate('/agent/calendar');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const activeTransactions = agentData?.transactions?.filter(t => t.status === 'active') || [];
  const upcomingTasks = agentData?.tasks?.filter(t => !t.is_completed).slice(0, 5) || [];
  const recentClients = agentData?.clients?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cream via-brand-background to-brand-taupe/20">
      <div className="p-6 lg:p-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl lg:text-6xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider mb-4">
            AGENT COMMAND
          </h1>
          <div className="w-24 h-px bg-brand-taupe mx-auto mb-6"></div>
          <p className="text-lg font-brand-body text-brand-charcoal/70 max-w-2xl mx-auto">
            Your personalized coordination dashboard, designed for peak performance.
          </p>
        </motion.div>

        {/* Unified Dashboard Stats */}
        <DashboardStats 
          variant="agent" 
          onActionClick={handleDashboardAction}
          className="mb-12"
        />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border border-brand-taupe/20">
            <TabsTrigger value="overview" className="font-brand-heading tracking-wide">Overview</TabsTrigger>
            <TabsTrigger value="transactions" className="font-brand-heading tracking-wide">Transactions</TabsTrigger>
            <TabsTrigger value="tasks" className="font-brand-heading tracking-wide">Tasks</TabsTrigger>
            <TabsTrigger value="clients" className="font-brand-heading tracking-wide">Clients</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Active Transactions */}
            <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-brand-heading tracking-wide text-brand-charcoal">
                  <Building className="h-5 w-5" />
                  Active Transactions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-brand-taupe/10 rounded animate-pulse" />
                    ))}
                  </div>
                ) : activeTransactions.length > 0 ? (
                  activeTransactions.slice(0, 3).map((transaction) => (
                    <div key={transaction.id} className="p-4 border border-brand-taupe/20 rounded-lg hover:bg-brand-cream/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-brand-heading text-brand-charcoal font-medium">
                            {transaction.property_address}
                          </h4>
                          <p className="text-sm text-brand-charcoal/60 font-brand-body">
                            {transaction.client_name || 'Client TBD'}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 mx-auto text-brand-taupe mb-3" />
                    <p className="text-brand-charcoal/60 font-brand-body">No active transactions</p>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate('/agent/transactions')}
                >
                  View All Transactions
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-brand-heading tracking-wide text-brand-charcoal">
                  <CheckCircle2 className="h-5 w-5" />
                  Upcoming Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-12 bg-brand-taupe/10 rounded animate-pulse" />
                    ))}
                  </div>
                ) : upcomingTasks.length > 0 ? (
                  upcomingTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border border-brand-taupe/20 rounded-lg">
                      <div className="flex-1">
                        <p className="font-brand-body text-brand-charcoal font-medium text-sm">
                          {task.title}
                        </p>
                        <p className="text-xs text-brand-charcoal/60">
                          Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date set'}
                        </p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        task.priority === 'high' ? 'bg-red-400' :
                        task.priority === 'medium' ? 'bg-amber-400' : 'bg-green-400'
                      }`} />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-brand-taupe mb-3" />
                    <p className="text-brand-charcoal/60 font-brand-body">No upcoming tasks</p>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate('/agent/tasks')}
                >
                  View All Tasks
                </Button>
              </CardContent>
            </Card>

            {/* Recent Clients */}
            <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-brand-heading tracking-wide text-brand-charcoal">
                  <Users className="h-5 w-5" />
                  Recent Clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-24 bg-brand-taupe/10 rounded animate-pulse" />
                    ))}
                  </div>
                ) : recentClients.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recentClients.map((client) => (
                      <div key={client.id} className="p-4 border border-brand-taupe/20 rounded-lg hover:bg-brand-cream/30 transition-colors">
                        <h4 className="font-brand-heading text-brand-charcoal font-medium mb-2">
                          {client.full_name}
                        </h4>
                        <div className="space-y-1 text-sm text-brand-charcoal/60">
                          {client.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span className="font-brand-body">{client.email}</span>
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              <span className="font-brand-body">{client.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-brand-taupe mb-3" />
                    <p className="text-brand-charcoal/60 font-brand-body">No clients yet</p>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="w-full mt-6"
                  onClick={() => navigate('/agent/clients')}
                >
                  View All Clients
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
              <CardHeader>
                <CardTitle className="font-brand-heading tracking-wide text-brand-charcoal">
                  Transaction Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Building className="h-16 w-16 mx-auto text-brand-taupe mb-4" />
                  <h3 className="font-brand-heading text-brand-charcoal text-lg mb-2">
                    Transaction Details
                  </h3>
                  <p className="text-brand-charcoal/60 font-brand-body mb-6">
                    Detailed transaction management will be available here
                  </p>
                  <Button onClick={() => navigate('/agent/transactions')}>
                    Go to Transactions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
              <CardHeader>
                <CardTitle className="font-brand-heading tracking-wide text-brand-charcoal">
                  Task Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CheckCircle2 className="h-16 w-16 mx-auto text-brand-taupe mb-4" />
                  <h3 className="font-brand-heading text-brand-charcoal text-lg mb-2">
                    Task Overview
                  </h3>
                  <p className="text-brand-charcoal/60 font-brand-body mb-6">
                    Comprehensive task management will be available here
                  </p>
                  <Button onClick={() => navigate('/agent/tasks')}>
                    Go to Tasks
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients">
            <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
              <CardHeader>
                <CardTitle className="font-brand-heading tracking-wide text-brand-charcoal">
                  Client Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto text-brand-taupe mb-4" />
                  <h3 className="font-brand-heading text-brand-charcoal text-lg mb-2">
                    Client Portfolio
                  </h3>
                  <p className="text-brand-charcoal/60 font-brand-body mb-6">
                    Detailed client management will be available here
                  </p>
                  <Button onClick={() => navigate('/agent/clients')}>
                    Go to Clients
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

export default AgentDashboard;
