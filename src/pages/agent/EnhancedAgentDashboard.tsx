
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { FormNavigationIntegration } from '@/components/navigation/FormNavigationIntegration';
import PremiumDashboardMetrics from '@/components/agent/PremiumDashboardMetrics';
import PremiumActionRequiredPanel from '@/components/agent/PremiumActionRequiredPanel';
import PremiumWhatsNextPanel from '@/components/agent/PremiumWhatsNextPanel';
import TransactionProgressTracker from '@/components/agent/TransactionProgressTracker';
import MobileOptimizedDashboard from '@/components/agent/MobileOptimizedDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Breadcrumb from '@/components/navigation/Breadcrumb';

const EnhancedAgentDashboard = () => {
  const { user } = useAuth();

  // Check if agent has completed onboarding
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('onboarding_completed_at, first_name, last_name')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id
  });

  // Get transactions for dashboard metrics
  const { data: transactions } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('transactions')
        .select(`
          *,
          tasks (*)
        `)
        .eq('agent_id', user.id);
      return data || [];
    },
    enabled: !!user?.id
  });

  // Get pending tasks for action required panel
  const { data: pendingTasks } = useQuery({
    queryKey: ['pending_tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('tasks')
        .select(`
          *,
          transactions!inner (agent_id)
        `)
        .eq('transactions.agent_id', user.id)
        .eq('is_completed', false);
      return data || [];
    },
    enabled: !!user?.id
  });

  const isOnboardingComplete = !!profile?.onboarding_completed_at;
  const agentName = profile ? `${profile.first_name} ${profile.last_name}` : 'Agent';
  
  const activeTransactions = transactions?.filter(t => t.status === 'active').length || 0;
  const closingThisWeek = transactions?.filter(t => {
    if (!t.closing_date) return false;
    const closingDate = new Date(t.closing_date);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return closingDate >= today && closingDate <= weekFromNow;
  }).length || 0;
  const actionRequired = pendingTasks?.filter(t => t.requires_agent_action).length || 0;

  // Get sample transaction for WhatsNextPanel
  const sampleTransaction = transactions?.[0];

  return (
    <AppLayout>
      {/* Mobile-optimized view for smaller screens */}
      <div className="block md:hidden">
        <MobileOptimizedDashboard 
          transactions={transactions || []}
          tasks={pendingTasks || []}
          notifications={[]}
        />
      </div>

      {/* Desktop view */}
      <div className="hidden md:block p-4 md:p-8">
        <div className="mb-8">
          <Breadcrumb />
        </div>

        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider uppercase mb-2">
            Welcome Back, {agentName.split(' ')[0]}
          </h1>
          <p className="text-lg font-brand-body text-brand-charcoal/70">
            {isOnboardingComplete 
              ? 'Your dashboard is ready. Manage your transactions with ease.'
              : 'Complete your setup to unlock all features.'
            }
          </p>
        </div>

        <div className="space-y-8">
          {/* Show setup integration if onboarding not complete */}
          {!isOnboardingComplete && (
            <div className="bg-gradient-to-r from-brand-cream to-white p-6 rounded-xl border border-brand-taupe/30">
              <FormNavigationIntegration />
            </div>
          )}

          {/* Dashboard Metrics */}
          {isOnboardingComplete && (
            <>
              <PremiumDashboardMetrics
                activeTransactions={activeTransactions}
                closingThisWeek={closingThisWeek}
                actionRequired={actionRequired}
                isLoading={false}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PremiumActionRequiredPanel pendingTasks={pendingTasks || []} />
                {sampleTransaction && (
                  <PremiumWhatsNextPanel transaction={sampleTransaction} />
                )}
              </div>

              {sampleTransaction && (
                <TransactionProgressTracker transaction={sampleTransaction} />
              )}
            </>
          )}

          {/* Always show navigation options for quick access */}
          {isOnboardingComplete && (
            <div className="mt-12 bg-brand-background/50 p-6 rounded-xl border border-brand-taupe/20">
              <h2 className="text-xl font-brand-heading tracking-wide text-brand-charcoal uppercase mb-4">
                Quick Actions
              </h2>
              <FormNavigationIntegration />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default EnhancedAgentDashboard;
