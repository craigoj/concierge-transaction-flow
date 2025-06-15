
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateTask {
  id?: string;
  subject: string;
  description_notes: string;
  due_date_rule: {
    type: 'days_from_event' | 'specific_date';
    days?: number;
    event?: 'ratified_date' | 'closing_date';
    date?: string;
  };
  phase: string;
  is_agent_visible: boolean;
  email_template_id?: string;
  sort_order: number;
}

interface TemplateTaskEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: any;
}

const TemplateTaskEditor = ({ open, onOpenChange, template }: TemplateTaskEditorProps) => {
  const [tasks, setTasks] = useState<TemplateTask[]>([]);
  const queryClient = useQueryClient();

  // Fetch email templates for dropdown
  const { data: emailTemplates } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  // Load existing tasks when template changes
  useEffect(() => {
    if (template?.template_tasks) {
      setTasks(template.template_tasks.map((task: any) => ({
        id: task.id,
        subject: task.subject,
        description_notes: task.description_notes || '',
        due_date_rule: task.due_date_rule,
        phase: task.phase || '',
        is_agent_visible: task.is_agent_visible,
        email_template_id: task.email_template_id,
        sort_order: task.sort_order,
      })));
    } else {
      setTasks([]);
    }
  }, [template]);

  const addTask = () => {
    const newTask: TemplateTask = {
      subject: '',
      description_notes: '',
      due_date_rule: {
        type: 'days_from_event',
        days: 0,
        event: 'ratified_date',
      },
      phase: '',
      is_agent_visible: false,
      sort_order: tasks.length,
    };
    setTasks([...tasks, newTask]);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateTask = (index: number, updates: Partial<TemplateTask>) => {
    setTasks(tasks.map((task, i) => i === index ? { ...task, ...updates } : task));
  };

  const saveTasksMutation = useMutation({
    mutationFn: async () => {
      if (!template?.id) throw new Error('No template selected');

      // Delete existing tasks
      await supabase
        .from('template_tasks')
        .delete()
        .eq('template_id', template.id);

      // Insert new tasks
      const tasksToInsert = tasks.map((task, index) => ({
        template_id: template.id,
        subject: task.subject,
        description_notes: task.description_notes,
        due_date_rule: task.due_date_rule,
        phase: task.phase,
        is_agent_visible: task.is_agent_visible,
        email_template_id: task.email_template_id || null,
        sort_order: index,
      }));

      if (tasksToInsert.length > 0) {
        const { error } = await supabase
          .from('template_tasks')
          .insert(tasksToInsert);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-templates'] });
      toast.success('Template tasks saved successfully');
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error('Error saving tasks:', error);
      toast.error('Failed to save template tasks');
    },
  });

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Tasks: {template.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Configure the tasks that will be automatically created when this template is applied
            </p>
            <Button onClick={addTask} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </div>

          {tasks.map((task, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Task {index + 1}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeTask(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Task Title *</Label>
                    <Input
                      value={task.subject}
                      onChange={(e) => updateTask(index, { subject: e.target.value })}
                      placeholder="e.g., Send listing intro email"
                    />
                  </div>
                  <div>
                    <Label>Phase</Label>
                    <Input
                      value={task.phase}
                      onChange={(e) => updateTask(index, { phase: e.target.value })}
                      placeholder="e.g., Contract, Inspections"
                    />
                  </div>
                </div>

                <div>
                  <Label>Description/Notes</Label>
                  <Textarea
                    value={task.description_notes}
                    onChange={(e) => updateTask(index, { description_notes: e.target.value })}
                    placeholder="Detailed instructions for this task..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Due Date Type</Label>
                    <Select
                      value={task.due_date_rule.type}
                      onValueChange={(value: 'days_from_event' | 'specific_date') =>
                        updateTask(index, {
                          due_date_rule: { ...task.due_date_rule, type: value }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="days_from_event">Days from Event</SelectItem>
                        <SelectItem value="specific_date">Specific Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {task.due_date_rule.type === 'days_from_event' && (
                    <>
                      <div>
                        <Label>Days</Label>
                        <Input
                          type="number"
                          value={task.due_date_rule.days || 0}
                          onChange={(e) =>
                            updateTask(index, {
                              due_date_rule: {
                                ...task.due_date_rule,
                                days: parseInt(e.target.value) || 0
                              }
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Event</Label>
                        <Select
                          value={task.due_date_rule.event}
                          onValueChange={(value: 'ratified_date' | 'closing_date') =>
                            updateTask(index, {
                              due_date_rule: { ...task.due_date_rule, event: value }
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ratified_date">Contract Date</SelectItem>
                            <SelectItem value="closing_date">Closing Date</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={task.is_agent_visible}
                      onCheckedChange={(checked) =>
                        updateTask(index, { is_agent_visible: checked })
                      }
                    />
                    <Label>Visible to Agent</Label>
                  </div>

                  {emailTemplates && emailTemplates.length > 0 && (
                    <div className="w-48">
                      <Select
                        value={task.email_template_id || ''}
                        onValueChange={(value) =>
                          updateTask(index, { email_template_id: value || undefined })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Link email template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No email template</SelectItem>
                          {emailTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {tasks.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No tasks configured yet</p>
                <Button onClick={addTask}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Task
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => saveTasksMutation.mutate()}
              disabled={saveTasksMutation.isPending}
            >
              {saveTasksMutation.isPending ? 'Saving...' : 'Save Tasks'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateTaskEditor;
