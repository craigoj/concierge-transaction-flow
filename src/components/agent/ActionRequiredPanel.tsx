
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Task = Tables<'tasks'> & {
  requires_agent_action?: boolean;
  agent_action_prompt?: string;
};

interface ActionRequiredPanelProps {
  pendingTasks: Task[];
}

const ActionRequiredPanel = ({ pendingTasks }: ActionRequiredPanelProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filter tasks that require agent action
  const actionRequiredTasks = pendingTasks.filter(task => 
    task.requires_agent_action && !task.is_completed
  );

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          is_completed: true, 
          completed_at: new Date().toISOString(),
          requires_agent_action: false // Clear the action requirement when completed
        })
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-transaction'] });
      toast({
        title: "Task Completed",
        description: "Thank you! The task has been marked as complete.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleCompleteTask = (taskId: string) => {
    completeTaskMutation.mutate(taskId);
  };

  if (actionRequiredTasks.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-emerald-800 font-brand-heading tracking-wide">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            All Clear
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-emerald-700 font-brand-body leading-relaxed">
            Nothing is needed from you right now. Your transaction coordinator is handling everything smoothly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-amber-800 font-brand-heading tracking-wide">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          Action Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-amber-700 font-brand-body mb-4 leading-relaxed">
          Your transaction coordinator needs your attention on the following items:
        </p>
        
        <div className="space-y-3">
          {actionRequiredTasks.map((task) => (
            <div key={task.id} className="bg-white/80 rounded-lg p-4 border border-amber-200/50">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-brand-heading font-medium text-brand-charcoal">
                  {task.title}
                </h4>
                <Badge variant="outline" className="text-amber-700 border-amber-300">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              </div>
              
              {task.agent_action_prompt && (
                <p className="text-sm text-brand-charcoal/70 font-brand-body mb-3 bg-amber-50/50 p-3 rounded border-l-2 border-amber-300">
                  <strong>Instructions:</strong> {task.agent_action_prompt}
                </p>
              )}
              
              {task.description && (
                <p className="text-sm text-brand-charcoal/60 font-brand-body mb-3">
                  {task.description}
                </p>
              )}

              {task.due_date && (
                <p className="text-xs text-brand-charcoal/50 mb-3">
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </p>
              )}

              <Button 
                size="sm" 
                onClick={() => handleCompleteTask(task.id)}
                disabled={completeTaskMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-brand-heading tracking-wide"
              >
                {completeTaskMutation.isPending ? 'Completing...' : 'Mark Complete'}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionRequiredPanel;
