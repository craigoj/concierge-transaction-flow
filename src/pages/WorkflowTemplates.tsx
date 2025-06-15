
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import WorkflowTemplateManager from '@/components/workflows/WorkflowTemplateManager';
import Breadcrumb from '@/components/navigation/Breadcrumb';

const WorkflowTemplates = () => {
  // Check if user is a coordinator
  const { data: userRole, isLoading } = useQuery({
    queryKey: ['user-role'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      return profile?.role;
    },
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <Breadcrumb />
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            Loading...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userRole !== 'coordinator') {
    return (
      <div className="p-8">
        <div className="mb-8">
          <Breadcrumb />
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              Only coordinators can access workflow template management.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Breadcrumb />
      </div>
      <WorkflowTemplateManager />
    </div>
  );
};

export default WorkflowTemplates;
