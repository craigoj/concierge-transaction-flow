
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardMetrics {
  activeTransactions: number;
  pendingTransactions: number;
  closingThisWeek: number;
  totalClients: number;
  monthlyRevenue: number;
  totalVolume: number;
  completionRate: number;
  actionRequired: number;
  incompleteTasks: number;
}

export const useDashboardMetrics = () => {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      const [transactionsResult, tasksResult, clientsResult] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('tasks')
          .select('*'),
        supabase
          .from('clients')
          .select('id')
      ]);

      if (transactionsResult.error) throw transactionsResult.error;
      if (tasksResult.error) throw tasksResult.error;
      if (clientsResult.error) throw clientsResult.error;

      return {
        transactions: transactionsResult.data || [],
        tasks: tasksResult.data || [],
        clients: clientsResult.data || []
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const metrics = useMemo((): DashboardMetrics | null => {
    if (!dashboardData) return null;

    const { transactions, tasks, clients } = dashboardData;
    
    // Basic calculations
    const activeTransactions = transactions.filter(t => t.status === 'active');
    const pendingTransactions = transactions.filter(t => t.status === 'intake');
    const completedTransactions = transactions.filter(t => t.status === 'closed');
    
    // Date calculations
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentWeek = new Date();
    currentWeek.setDate(currentWeek.getDate() - 7);
    
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.created_at);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const closingThisWeek = transactions.filter(t => {
      if (!t.closing_date) return false;
      const closingDate = new Date(t.closing_date);
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return closingDate <= weekFromNow && closingDate >= new Date();
    });

    // Financial calculations
    const monthlyRevenue = monthlyTransactions.reduce((sum, t) => {
      const price = Number(t.purchase_price) || 0;
      const commissionRate = Number(t.commission_rate) || 0.03;
      return sum + (price * commissionRate);
    }, 0);

    const totalVolume = completedTransactions.reduce((sum, t) => 
      sum + (Number(t.purchase_price) || 0), 0
    );

    // Task calculations
    const incompleteTasks = tasks.filter(t => !t.is_completed);
    const actionRequiredTasks = tasks.filter(t => t.requires_agent_action && !t.is_completed);
    const completionRate = transactions.length > 0 
      ? Math.round((completedTransactions.length / transactions.length) * 100) 
      : 0;

    return {
      activeTransactions: activeTransactions.length,
      pendingTransactions: pendingTransactions.length,
      closingThisWeek: closingThisWeek.length,
      totalClients: clients.length,
      monthlyRevenue,
      totalVolume,
      completionRate,
      actionRequired: actionRequiredTasks.length,
      incompleteTasks: incompleteTasks.length
    };
  }, [dashboardData]);

  return {
    metrics,
    isLoading,
    error,
    rawData: dashboardData
  };
};
