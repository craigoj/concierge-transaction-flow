
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar,
  Building,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { logger } from '@/lib/logger';

const AgentTasks = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();

  const { data: tasks, isLoading, refetch } = useQuery({
    queryKey: ['agent-tasks'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          transactions!inner (
            id,
            property_address,
            agent_id
          )
        `)
        .eq('transactions.agent_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const handleTaskCompletion = async (taskId: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: isCompleted ? "Task Completed" : "Task Reopened",
        description: isCompleted 
          ? "Great job! The task has been marked as complete."
          : "The task has been reopened.",
      });

      refetch();
    } catch (error) {
      logger.error('Error updating task', error as Error, { taskId, isCompleted }, 'agent-tasks');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to update task. Please try again.",
      });
    }
  };

  const pendingTasks = tasks?.filter(task => !task.is_completed) || [];
  const completedTasks = tasks?.filter(task => task.is_completed) || [];
  const overdueTasks = pendingTasks.filter(task => 
    task.due_date && new Date(task.due_date) < new Date()
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const TaskCard = ({ task, showCompleted = false }: { task: any, showCompleted?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Checkbox 
            checked={task.is_completed}
            onCheckedChange={(checked) => handleTaskCompletion(task.id, checked as boolean)}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <h3 className={`font-brand-heading font-semibold text-brand-charcoal ${
                  task.is_completed ? 'line-through opacity-60' : ''
                }`}>
                  {task.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-brand-charcoal/60">
                  <Building className="h-4 w-4" />
                  {task.transactions?.property_address}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {task.due_date && new Date(task.due_date) < new Date() && !task.is_completed && (
                  <Badge className="bg-red-100 text-red-800">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                )}
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority?.toUpperCase() || 'MEDIUM'}
                </Badge>
              </div>
            </div>

            {task.description && (
              <p className="text-sm text-brand-charcoal/70 font-brand-body mb-3">
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-brand-charcoal/60">
              {task.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </div>
              )}
              {task.is_completed && task.completed_at && (
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Completed: {new Date(task.completed_at).toLocaleDateString()}
                </div>
              )}
            </div>

            {task.requires_agent_action && task.agent_action_prompt && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-1">
                  Action Required:
                </p>
                <p className="text-sm text-blue-700">
                  {task.agent_action_prompt}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <Breadcrumb />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-brand-taupe/10 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <Breadcrumb />
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-brand-heading font-bold text-brand-charcoal tracking-wide mb-2">
          My Tasks
        </h1>
        <p className="text-brand-charcoal/60 font-brand-body">
          Stay on top of your transaction tasks and deadlines
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-brand-charcoal">{pendingTasks.length}</div>
            <div className="text-sm text-brand-charcoal/60">Pending Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-brand-charcoal">{overdueTasks.length}</div>
            <div className="text-sm text-brand-charcoal/60">Overdue Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-brand-charcoal">{completedTasks.length}</div>
            <div className="text-sm text-brand-charcoal/60">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({overdueTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingTasks.length > 0 ? (
            pendingTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="h-16 w-16 text-brand-taupe/40 mx-auto mb-4" />
                <h3 className="text-xl font-brand-heading text-brand-charcoal mb-2">
                  No Pending Tasks
                </h3>
                <p className="text-brand-charcoal/60 font-brand-body">
                  Great job! You're all caught up with your tasks.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          {overdueTasks.length > 0 ? (
            overdueTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="h-16 w-16 text-brand-taupe/40 mx-auto mb-4" />
                <h3 className="text-xl font-brand-heading text-brand-charcoal mb-2">
                  No Overdue Tasks
                </h3>
                <p className="text-brand-charcoal/60 font-brand-body">
                  Excellent! You're staying on top of all your deadlines.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedTasks.length > 0 ? (
            completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} showCompleted />
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="h-16 w-16 text-brand-taupe/40 mx-auto mb-4" />
                <h3 className="text-xl font-brand-heading text-brand-charcoal mb-2">
                  No Completed Tasks Yet
                </h3>
                <p className="text-brand-charcoal/60 font-brand-body">
                  Completed tasks will appear here for your reference.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentTasks;
