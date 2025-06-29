
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { FormNavigationIntegration } from '@/components/navigation/FormNavigationIntegration';
import { PremiumDashboardMetrics } from '@/components/agent/PremiumDashboardMetrics';
import { PremiumActionRequiredPanel } from '@/components/agent/PremiumActionRequiredPanel';
import { PremiumWhatsNextPanel } from '@/components/agent/PremiumWhatsNextPanel';
import { TransactionProgressTracker } from '@/components/agent/TransactionProgressTracker';
import { useAuth } from '@/integrations/supabase/auth';
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

  const isOnboardingComplete = !!profile?.onboarding_completed_at;
  const agentName = profile ? `${profile.first_name} ${profile.last_name}` : 'Agent';

  return (
    <AppLayout>
      <div className="p-4 md:p-8">
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
              <PremiumDashboardMetrics />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PremiumActionRequiredPanel />
                <PremiumWhatsNextPanel />
              </div>

              <TransactionProgressTracker />
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
