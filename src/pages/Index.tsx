import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building, CheckCircle, Clock } from 'lucide-react';
import { EnhancedTransactionList } from '@/components/transactions/EnhancedTransactionList';
import { RoleDebugPanel } from '@/components/debug/RoleDebugPanel';

const Dashboard = () => {
  const { data: transactionCount } = useQuery({
    queryKey: ['transaction-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: false });

      if (error) throw error;
      return count || 0;
    },
  });

  const { data: clientCount } = useQuery({
    queryKey: ['client-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: false });

      if (error) throw error;
      return count || 0;
    },
  });

  const { data: taskCount } = useQuery({
    queryKey: ['task-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: false });

      if (error) throw error;
      return count || 0;
    },
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, property_address, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="p-8">
      {/* Debug Panel */}
      <RoleDebugPanel />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white/80 backdrop-blur-sm border border-brand-taupe/30 shadow-brand-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-brand-charcoal tracking-brand-wide uppercase">
              Total Transactions
            </CardTitle>
            <Users className="h-4 w-4 text-brand-taupe" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-charcoal tracking-brand-wider">
              {transactionCount || 0}
            </div>
            <p className="text-xs text-brand-charcoal/60">
              All transactions in the system
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-brand-taupe/30 shadow-brand-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-brand-charcoal tracking-brand-wide uppercase">
              Total Clients
            </CardTitle>
            <Building className="h-4 w-4 text-brand-taupe" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-charcoal tracking-brand-wider">
              {clientCount || 0}
            </div>
            <p className="text-xs text-brand-charcoal/60">
              All clients in the system
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-brand-taupe/30 shadow-brand-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-brand-charcoal tracking-brand-wide uppercase">
              Total Tasks
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-brand-taupe" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-charcoal tracking-brand-wider">
              {taskCount || 0}
            </div>
            <p className="text-xs text-brand-charcoal/60">
              All tasks in the system
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-brand-taupe/30 shadow-brand-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-brand-charcoal tracking-brand-wide uppercase">
              Recent Transactions
            </CardTitle>
            <Clock className="h-4 w-4 text-brand-taupe" />
          </CardHeader>
          <CardContent>
            <ul className="list-none m-0 p-0">
              {recentTransactions && recentTransactions.map((transaction: any) => (
                <li key={transaction.id} className="py-2 border-b last:border-none border-brand-taupe/30">
                  <a href={`/transactions/${transaction.id}`} className="block hover:text-blue-500 transition-colors duration-200">
                    {transaction.property_address}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider uppercase mb-4">
          Transaction List
        </h2>
        <p className="text-lg font-brand-body text-brand-charcoal/70 max-w-2xl">
          A comprehensive list of all transactions in the system
        </p>
      </div>

      <EnhancedTransactionList />
    </div>
  );
};

export default Dashboard;
