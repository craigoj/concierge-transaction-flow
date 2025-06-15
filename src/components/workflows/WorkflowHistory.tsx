
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Workflow } from 'lucide-react';

interface WorkflowHistoryProps {
  transactionId: string;
}

const WorkflowHistory = ({ transactionId }: WorkflowHistoryProps) => {
  // Fetch new workflow instances
  const { data: workflowInstances, isLoading: isLoadingWorkflow } = useQuery({
    queryKey: ['workflow-instances', transactionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_instances')
        .select(`
          *,
          template:template_id(name, description),
          applied_by_profile:applied_by(first_name, last_name)
        `)
        .eq('transaction_id', transactionId)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch legacy workflow instances for backward compatibility
  const { data: legacyInstances, isLoading: isLoadingLegacy } = useQuery({
    queryKey: ['legacy-workflow-instances', transactionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_instances')
        .select(`
          *,
          template:template_id(name, description),
          applied_by_profile:applied_by(first_name, last_name)
        `)
        .eq('transaction_id', transactionId)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const isLoading = isLoadingWorkflow || isLoadingLegacy;

  if (isLoading) {
    return <div className="p-4">Loading workflow history...</div>;
  }

  // Combine both types of instances
  const allInstances = [
    ...(workflowInstances || []),
    ...(legacyInstances || [])
  ].sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());

  if (!allInstances?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Workflow History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No workflows have been applied to this transaction yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5" />
          Workflow History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {allInstances.map((instance: any) => (
          <div key={instance.id} className="flex items-start justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <h4 className="font-medium">{instance.template?.name}</h4>
              {instance.template?.description && (
                <p className="text-sm text-muted-foreground">{instance.template.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Applied by {instance.applied_by_profile?.first_name} {instance.applied_by_profile?.last_name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(instance.applied_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Badge 
              variant={
                instance.status === 'active' ? 'default' : 
                instance.status === 'completed' ? 'secondary' : 'outline'
              }
            >
              {instance.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default WorkflowHistory;
