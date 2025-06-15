
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Calendar, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TransactionTasksProps {
  transactionId: string;
}

const TransactionTasks = ({ transactionId }: TransactionTasksProps) => {
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', transactionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const { error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          transaction_id: transactionId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', transactionId] });
      setNewTaskOpen(false);
      setTaskForm({ title: '', description: '', priority: 'medium', due_date: '' });
      toast({ title: "Success", description: "Task created successfully" });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      const { error } = await supabase
        .from('tasks')
        .update({
          is_completed: completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', transactionId] });
    },
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate({
      title: taskForm.title,
      description: taskForm.description || null,
      priority: taskForm.priority,
      due_date: taskForm.due_date || null,
    });
  };

  const handleToggleTask = (taskId: string, completed: boolean) => {
    toggleTaskMutation.mutate({ taskId, completed });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (isLoading) {
    return <div className="p-4">Loading tasks...</div>;
  }

  const activeTasks = tasks?.filter(task => !task.is_completed) || [];
  const completedTasks = tasks?.filter(task => task.is_completed) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Tasks</h2>
        <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={taskForm.priority} onValueChange={(value) => setTaskForm(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setNewTaskOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={createTaskMutation.isPending} className="flex-1">
                  {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Active Tasks ({activeTasks.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeTasks.length === 0 ? (
            <p className="text-muted-foreground">No active tasks</p>
          ) : (
            activeTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <Checkbox
                  checked={task.is_completed}
                  onCheckedChange={(checked) => handleToggleTask(task.id, checked as boolean)}
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">{task.title}</h4>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority.toUpperCase()}
                      </Badge>
                      {task.due_date && isOverdue(task.due_date) && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  )}
                  {task.due_date && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Tasks ({completedTasks.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {completedTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-4 p-4 border rounded-lg opacity-75">
                <Checkbox
                  checked={task.is_completed}
                  onCheckedChange={(checked) => handleToggleTask(task.id, checked as boolean)}
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium line-through">{task.title}</h4>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority.toUpperCase()}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-through">{task.description}</p>
                  )}
                  {task.completed_at && (
                    <p className="text-xs text-muted-foreground">
                      Completed: {new Date(task.completed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TransactionTasks;
