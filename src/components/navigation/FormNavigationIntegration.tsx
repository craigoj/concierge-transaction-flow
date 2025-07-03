import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  FileText, 
  Settings, 
  CheckCircle2, 
  Circle, 
  ArrowRight,
  Clock,
  Star,
  Briefcase
} from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  status?: 'complete' | 'incomplete';
  progress?: number;
}

export const FormNavigationIntegration: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch user profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile-navigation', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, brokerage, onboarding_completed_at')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const isProfileComplete = !!(profile?.first_name && profile?.last_name && profile?.phone && profile?.brokerage);
  const isOnboardingComplete = !!profile?.onboarding_completed_at;

  const quickActions: QuickAction[] = [
    {
      title: 'Complete Your Profile',
      description: 'Add your contact information',
      href: '/profile',
      icon: <Users className="h-4 w-4 mr-2 text-blue-500" />,
      status: isProfileComplete ? 'complete' : 'incomplete',
      progress: isProfileComplete ? 100 : 50,
    },
    {
      title: 'Set Up Transaction Defaults',
      description: 'Configure your preferred vendors',
      href: '/settings',
      icon: <Settings className="h-4 w-4 mr-2 text-green-500" />,
      status: isOnboardingComplete ? 'complete' : 'incomplete',
      progress: isOnboardingComplete ? 100 : 75,
    },
    {
      title: 'Explore Offer Drafting',
      description: 'Create your first offer request',
      href: '/offer-drafting',
      icon: <FileText className="h-4 w-4 mr-2 text-orange-500" />,
    },
    {
      title: 'Manage Transactions',
      description: 'View and manage your transactions',
      href: '/transactions',
      icon: <Briefcase className="h-4 w-4 mr-2 text-purple-500" />,
    },
  ];

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {quickActions.map((action, index) => (
          <div key={index} className="border rounded-md p-3 hover:bg-gray-50 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {action.icon}
                <h3 className="text-sm font-medium text-gray-800">{action.title}</h3>
              </div>
              {action.status === 'complete' && (
                <Badge variant="secondary" className="opacity-75">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Complete
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">{action.description}</p>
            {action.progress !== undefined && (
              <div className="mt-2">
                <Progress value={action.progress} className="h-2" />
              </div>
            )}
            <Button
              variant="link"
              size="sm"
              className="justify-start mt-2 pl-0 hover:underline"
              onClick={() => navigate(action.href)}
            >
              Go <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
