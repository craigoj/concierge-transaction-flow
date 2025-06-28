
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  Calendar, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Zap,
  FileText,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  MessageSquare,
  Key,
  Camera
} from 'lucide-react';

export type DashboardVariant = 'basic' | 'premium' | 'enhanced' | 'agent';

export interface DashboardStatsProps {
  variant: DashboardVariant;
  showQuickActions?: boolean;
  className?: string;
  onActionClick?: (action: string) => void;
}

interface StatItem {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient?: string;
  bgColor?: string;
  iconBg?: string;
  iconColor?: string;
  href?: string;
  highlight?: boolean;
}

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  variant?: 'default' | 'outline' | 'ghost';
  color?: string;
  featured?: boolean;
  action: string;
}

const DashboardStats = React.memo<DashboardStatsProps>(({ 
  variant, 
  showQuickActions = false, 
  className = '',
  onActionClick 
}) => {
  // Fetch dashboard data with React Query
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboardStats', variant],
    queryFn: async () => {
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select(`
          *,
          clients!clients_transaction_id_fkey(full_name, type),
          profiles!transactions_agent_id_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (transactionError) throw transactionError;

      const { data: tasks, error: taskError } = await supabase
        .from('tasks')
        .select('*');

      if (taskError) throw taskError;

      const { data: clients, error: clientError } = await supabase
        .from('clients')
        .select('id');

      if (clientError) throw clientError;

      return { transactions: transactions || [], tasks: tasks || [], clients: clients || [] };
    },
  });

  // Memoized calculations for performance
  const metrics = useMemo(() => {
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

  // Memoized stats configuration based on variant
  const stats = useMemo((): StatItem[] => {
    if (!metrics) return [];

    const baseStats = {
      basic: [
        {
          title: "Active Transactions",
          value: metrics.activeTransactions,
          change: "+12%",
          changeType: "positive" as const,
          icon: Calendar,
          color: "text-blue-600",
          href: "/transactions?filter=active"
        },
        {
          title: "Total Clients", 
          value: metrics.totalClients,
          change: "+8%",
          changeType: "positive" as const,
          icon: Users,
          color: "text-green-600",
          href: "/clients"
        },
        {
          title: "Monthly Revenue",
          value: `$${metrics.monthlyRevenue.toLocaleString()}`,
          change: "+23%",
          changeType: "positive" as const,
          icon: DollarSign,
          color: "text-primary",
          href: "/analytics/revenue"
        },
        {
          title: "Completion Rate",
          value: `${metrics.completionRate}%`,
          change: "+2%",
          changeType: "positive" as const,
          icon: TrendingUp,
          color: "text-emerald-600",
          href: "/analytics/performance"
        }
      ],
      premium: [
        {
          title: "COORDINATION EXCELLENCE",
          value: metrics.activeTransactions,
          subtitle: "active transactions",
          icon: Zap,
          color: "text-blue-600",
          gradient: "from-blue-50 to-blue-100"
        },
        {
          title: "PORTFOLIO VELOCITY",
          value: "24",
          subtitle: "avg days to close",
          icon: Clock,
          color: "text-emerald-600",
          gradient: "from-emerald-50 to-emerald-100"
        },
        {
          title: "MONTHLY VOLUME",
          value: `$${(metrics.totalVolume / 1000000).toFixed(1)}M`,
          subtitle: "coordinated value",
          icon: DollarSign,
          color: "text-violet-600",
          gradient: "from-violet-50 to-violet-100"
        },
        {
          title: "CLIENT SATISFACTION",
          value: "98%",
          subtitle: "coordination rating",
          icon: TrendingUp,
          color: "text-amber-600",
          gradient: "from-amber-50 to-amber-100"
        }
      ],
      enhanced: [
        {
          title: "Active Transactions",
          value: metrics.activeTransactions,
          change: "+12%",
          changeType: "positive" as const,
          icon: Calendar,
          color: "text-blue-600",
          href: "/transactions?filter=active"
        },
        {
          title: "Total Clients",
          value: metrics.totalClients,
          change: "+8%",
          changeType: "positive" as const,
          icon: Users,
          color: "text-green-600",
          href: "/clients"
        },
        {
          title: "Monthly Revenue",
          value: `$${metrics.monthlyRevenue.toLocaleString()}`,
          change: "+23%",
          changeType: "positive" as const,
          icon: DollarSign,
          color: "text-primary",
          href: "/analytics/revenue"
        },
        {
          title: "Completion Rate",
          value: `${metrics.completionRate}%`,
          change: "+2%",
          changeType: "positive" as const,
          icon: TrendingUp,
          color: "text-emerald-600",
          href: "/analytics/performance"
        }
      ],
      agent: [
        {
          title: 'Active Transactions',
          value: metrics.activeTransactions,
          icon: FileText,
          color: 'text-brand-charcoal',
          bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600'
        },
        {
          title: 'Closing This Week',
          value: metrics.closingThisWeek,
          icon: Calendar,
          color: 'text-brand-charcoal',
          bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50',
          iconBg: 'bg-emerald-100',
          iconColor: 'text-emerald-600'
        },
        {
          title: 'Action Required',
          value: metrics.actionRequired,
          icon: AlertCircle,
          color: metrics.actionRequired > 0 ? 'text-amber-700' : 'text-brand-charcoal',
          bgColor: metrics.actionRequired > 0 ? 'bg-gradient-to-br from-amber-50 to-amber-100/50' : 'bg-gradient-to-br from-gray-50 to-gray-100/50',
          iconBg: metrics.actionRequired > 0 ? 'bg-amber-100' : 'bg-gray-100',
          iconColor: metrics.actionRequired > 0 ? 'text-amber-600' : 'text-gray-600',
          highlight: metrics.actionRequired > 0
        }
      ]
    };

    return baseStats[variant] || baseStats.basic;
  }, [variant, metrics]);

  // Memoized quick actions
  const quickActions = useMemo((): QuickAction[] => {
    const actions = {
      premium: [
        {
          icon: Building2,
          label: "New Coordination",
          description: "Initiate transaction coordination",
          color: "bg-brand-charcoal hover:bg-brand-taupe-dark text-brand-background",
          featured: true,
          action: "new-transaction"
        },
        {
          icon: Calendar,
          label: "Schedule Inspection",
          description: "Coordinate property inspection", 
          color: "bg-blue-600 hover:bg-blue-700 text-white",
          action: "schedule-inspection"
        },
        {
          icon: Key,
          label: "Lockbox Setup",
          description: "Arrange showing access",
          color: "bg-emerald-600 hover:bg-emerald-700 text-white",
          action: "lockbox-setup"
        }
      ],
      basic: [
        {
          icon: Plus,
          label: "New Transaction",
          description: "Start a new transaction coordination",
          variant: "default" as const,
          action: "new-transaction"
        },
        {
          icon: Users,
          label: "Add Client", 
          description: "Register a new client",
          variant: "outline" as const,
          action: "add-client"
        }
      ]
    };

    return actions[variant as keyof typeof actions] || actions.basic;
  }, [variant]);

  const handleActionClick = (action: string) => {
    onActionClick?.(action);
  };

  if (isLoading) {
    const gridCols = variant === 'agent' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    return (
      <div className={`grid ${gridCols} gap-6 ${className}`}>
        {[1, 2, 3, 4].slice(0, variant === 'agent' ? 3 : 4).map((i) => (
          <Card key={i} className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const renderStat = (stat: StatItem, index: number) => {
    const baseCardClass = variant === 'premium' 
      ? "bg-white/80 backdrop-blur-sm border-brand-taupe/20 shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-500 p-6 h-full relative overflow-hidden group"
      : variant === 'agent'
      ? `border-brand-taupe/20 shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-500 overflow-hidden relative ${stat.highlight ? 'ring-1 ring-amber-200' : ''}`
      : "bg-white hover:shadow-md transition-shadow cursor-pointer group";

    if (variant === 'premium') {
      return (
        <div key={index} className="group relative overflow-hidden">
          <Card className={baseCardClass}>
            {stat.gradient && (
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
            )}
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-lg bg-gray-50 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-brand-heading tracking-brand-wide text-brand-charcoal/60 uppercase">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-brand-charcoal group-hover:text-brand-charcoal transition-colors">
                  {stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-sm font-brand-body text-brand-charcoal/70">
                    {stat.subtitle}
                  </p>
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-brand-taupe/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          </Card>
        </div>
      );
    }

    if (variant === 'agent') {
      return (
        <Card key={index} className={baseCardClass}>
          {stat.bgColor && <div className={`absolute inset-0 ${stat.bgColor} opacity-60`} />}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/20 to-transparent rounded-full transform translate-x-8 -translate-y-8" />
          <CardContent className="p-10 text-center relative">
            <div className="flex items-center justify-center mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${stat.iconBg} shadow-sm`}>
                <stat.icon className={`h-8 w-8 ${stat.iconColor}`} />
              </div>
            </div>
            <div className={`text-5xl font-brand-heading font-bold mb-4 ${stat.color}`}>
              {stat.value}
            </div>
            <p className="text-brand-charcoal/70 font-brand-heading text-sm uppercase tracking-brand-wide">
              {stat.title}
            </p>
            {stat.highlight && (
              <div className="mt-4 pt-4 border-t border-amber-200/50">
                <p className="text-amber-600 text-xs font-brand-body italic">
                  Requires your attention
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    // Basic and Enhanced variants
    return (
      <Card key={index} className={baseCardClass}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {stat.value}
              </p>
              {stat.change && (
                <div className="flex items-center space-x-1">
                  <span className={`text-sm flex items-center ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {stat.change}
                  </span>
                  <span className="text-sm text-muted-foreground">from last month</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-full bg-gray-50 ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const gridCols = variant === 'agent' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div className={className}>
      <div className={`grid ${gridCols} gap-6 mb-8`}>
        {stats.map(renderStat)}
      </div>
      
      {showQuickActions && quickActions.length > 0 && (
        <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || "default"}
                  className={`h-auto p-6 flex flex-col items-center space-y-3 text-center group transition-all duration-300 hover:scale-105 shadow-brand-subtle hover:shadow-brand-elevation ${action.color || ''}`}
                  onClick={() => handleActionClick(action.action)}
                >
                  <action.icon className="h-8 w-8 group-hover:scale-110 transition-transform duration-200" />
                  <div>
                    <div className="font-brand-heading tracking-wide text-sm uppercase">{action.label}</div>
                    <div className="text-xs opacity-80 font-brand-body">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

DashboardStats.displayName = 'DashboardStats';

export default DashboardStats;
