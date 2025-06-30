
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  FileText, 
  Settings, 
  CheckCircle,
  ArrowRight,
  Clock
} from 'lucide-react';
import { useAuth } from '@/integrations/supabase/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NavigationCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  status: 'completed' | 'pending' | 'available';
  badge?: string;
}

export const FormNavigationIntegration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check agent onboarding status
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('onboarding_completed_at')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id
  });

  // Check intake session status
  const { data: intakeSession } = useQuery({
    queryKey: ['intake_session', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('agent_intake_sessions')
        .select('status, completion_percentage')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id
  });

  const isOnboardingComplete = !!profile?.onboarding_completed_at;
  const intakeStatus = intakeSession?.status || 'not_started';

  const navigationCards: NavigationCard[] = [
    {
      title: 'Agent Setup',
      description: 'Complete your profile and vendor preferences',
      icon: <UserPlus className="h-5 w-5" />,
      path: '/agent/intake',
      status: intakeStatus === 'completed' ? 'completed' : 
              intakeStatus === 'in_progress' ? 'pending' : 'available',
      badge: intakeStatus === 'completed' ? 'Complete' : 
             intakeStatus === 'in_progress' ? `${intakeSession?.completion_percentage || 0}%` : 'Start'
    },
    {
      title: 'Create Transaction',
      description: 'Start a new transaction with service tier selection',
      icon: <FileText className="h-5 w-5" />,
      path: '/transactions',
      status: isOnboardingComplete ? 'available' : 'pending',
      badge: 'Available'
    },
    {
      title: 'Offer Drafting',
      description: 'Create professional offer requests',
      icon: <Settings className="h-5 w-5" />,
      path: '/offer-drafting',
      status: isOnboardingComplete ? 'available' : 'pending',
      badge: 'New'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-600" />;
      default:
        return <ArrowRight className="h-4 w-4 text-brand-charcoal" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-brand-taupe/20 text-brand-charcoal border-brand-taupe/30';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-brand-heading tracking-wide text-brand-charcoal uppercase mb-2">
          Get Started
        </h2>
        <p className="text-brand-charcoal/70 font-brand-body">
          Complete these steps to set up your agent profile and start managing transactions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {navigationCards.map((card, index) => (
          <Card 
            key={index}
            className={`cursor-pointer transition-all duration-300 hover:shadow-brand-elevation border ${
              card.status === 'pending' ? 'opacity-75' : ''
            }`}
            onClick={() => {
              if (card.status === 'pending' && card.path !== '/agent/intake') {
                // Don't navigate if prerequisites aren't met
                return;
              }
              navigate(card.path);
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    card.status === 'completed' ? 'bg-green-100 text-green-600' :
                    card.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                    'bg-brand-taupe/20 text-brand-charcoal'
                  }`}>
                    {card.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base font-brand-heading tracking-wide">
                      {card.title}
                    </CardTitle>
                  </div>
                </div>
                {getStatusIcon(card.status)}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-sm text-brand-charcoal/70 font-brand-body mb-3">
                {card.description}
              </p>
              
              <div className="flex items-center justify-between">
                <Badge className={`text-xs px-2 py-1 ${getStatusColor(card.status)}`}>
                  {card.badge}
                </Badge>
                
                {card.status === 'pending' && card.path !== '/agent/intake' && (
                  <span className="text-xs text-brand-charcoal/50">
                    Complete setup first
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
