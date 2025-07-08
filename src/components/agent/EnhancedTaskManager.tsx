
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar,
  Plus,
  Edit3,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutomationTriggers } from '@/hooks/useAutomationTriggers';
import { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskPriority = 'low' | 'medium' | 'high';
type FilterStatus = 'all' | 'pending' | 'completed';
type FilterPriority = 'all' | 'high' | 'medium' | 'low';

interface EnhancedTaskManagerProps {
  transactionId: string;
}

interface TaskForm {
  title: string;
  description: string;
  priority: TaskPriority;
  due_date: string;
  requires_agent_action: boolean;
  agent_action_prompt: string;
}

const EnhancedTaskManager = ({ transactionId }: EnhancedTaskManagerProps) => {
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState<TaskForm>({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    requires_agent_action: false,
    agent_action_prompt: ''
  });
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { triggerTaskCompletionAutomation } = useAutomationTriggers();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['enhanced-tasks', transactionId, filterStatus, filterPriority],
    queryFn: async () => {
      const query = supabase
        .from('tasks')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('due_date', { ascending: true, nullsFirst: false });

      const { data, error } = await query;
      if (error) throw error;

      // Apply client-side filtering
      let filteredData = data || [];
      
      if (filterStatus !== 'all') {
        const isCompleted = filterStatus === 'completed';
        filteredData = filteredData.filter(task => task.is_completed === isCompleted);
      }
      
      if (filterPriority !== 'all') {
        filteredData = filteredData.filter(task => task.priority === filterPriority);
      }

      return filteredData;
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: TaskForm) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          transaction_id: transactionId,
          due_date: taskData.due_date || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-tasks', transactionId] });
      setNewTaskOpen(false);
      resetForm();
      toast({ 
        title: "Success", 
        description: "Task created successfully" 
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<TaskForm> }) => {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-tasks', transactionId] });
      setEditingTask(null);
      resetForm();
      toast({ 
        title: "Success", 
        description: "Task updated successfully" 
      });
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('tasks')
        .update({
          is_completed: completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq('id', taskId);

      if (error) throw error;

      // Trigger automation if task was completed
      if (completed && user) {
        await triggerTaskCompletionAutomation(taskId, transactionId, user.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-tasks', transactionId] });
    },
  });

  const resetForm = () => {
    setTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
      requires_agent_action: false,
      agent_action_prompt: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      updateTaskMutation.mutate({ taskId: editingTask.id, updates: taskForm });
    } else {
      createTaskMutation.mutate(taskForm);
    }
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority as TaskPriority,
      due_date: task.due_date || '',
      requires_agent_action: task.requires_agent_action || false,
      agent_action_prompt: task.agent_action_prompt || ''
    });
    setNewTaskOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const pendingTasks = tasks?.filter(task => !task.is_completed) || [];
  const completedTasks = tasks?.filter(task => task.is_completed) || [];
  const overdueTasks = pendingTasks.filter(task => task.due_date && isOverdue(task.due_date));

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-brand-taupe/20 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Task Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-800">{pendingTasks.length}</div>
            <div className="text-sm text-blue-600">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-800">{overdueTasks.length}</div>
            <div className="text-sm text-red-600">Overdue</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-800">{completedTasks.length}</div>
            <div className="text-sm text-green-600">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Select value={filterStatus} onValueChange={(value: FilterStatus) => setFilterStatus(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterPriority} onValueChange={(value: FilterPriority) => setFilterPriority(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingTask(null); resetForm(); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingTask ? 'Edit Task' : 'Create New Task'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Task title *"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Textarea
                      placeholder="Description (optional)"
                      value={taskForm.description}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Select 
                      value={taskForm.priority} 
                      onValueChange={(value: TaskPriority) => setTaskForm(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Input
                      type="date"
                      value={taskForm.due_date}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, due_date: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agent-action"
                      checked={taskForm.requires_agent_action}
                      onCheckedChange={(checked) => 
                        setTaskForm(prev => ({ ...prev, requires_agent_action: checked as boolean }))
                      }
                    />
                    <label htmlFor="agent-action" className="text-sm text-brand-charcoal">
                      Requires agent action
                    </label>
                  </div>

                  {taskForm.requires_agent_action && (
                    <div>
                      <Textarea
                        placeholder="Agent action instructions..."
                        value={taskForm.agent_action_prompt}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, agent_action_prompt: e.target.value }))}
                        rows={2}
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setNewTaskOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createTaskMutation.isPending || updateTaskMutation.isPending}>
                      {editingTask ? 'Update' : 'Create'} Task
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-3">
        <AnimatePresence>
          {tasks?.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              layout
            >
              <Card className={`transition-all duration-200 hover:shadow-md ${
                task.is_completed ? 'bg-green-50/50 border-green-200' : 'bg-white/90 border-brand-taupe/20'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={task.is_completed}
                      onCheckedChange={(checked) => 
                        toggleTaskMutation.mutate({ taskId: task.id, completed: checked as boolean })
                      }
                      className="mt-1"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className={`font-medium ${
                            task.is_completed ? 'line-through text-brand-charcoal/60' : 'text-brand-charcoal'
                          }`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-brand-charcoal/70 mt-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {task.due_date && isOverdue(task.due_date) && !task.is_completed && (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Overdue
                            </Badge>
                          )}
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority?.toUpperCase()}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(task)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

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
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">
                              Agent Action Required:
                            </span>
                          </div>
                          <p className="text-sm text-blue-700">
                            {task.agent_action_prompt}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {(!tasks || tasks.length === 0) && (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-brand-taupe/40 mx-auto mb-4" />
              <h3 className="text-xl font-brand-heading text-brand-charcoal mb-2">
                No Tasks Found
              </h3>
              <p className="text-brand-charcoal/60 font-brand-body">
                {filterStatus !== 'all' || filterPriority !== 'all' 
                  ? 'Try adjusting your filter settings.'
                  : 'Create your first task to get started.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EnhancedTaskManager;
