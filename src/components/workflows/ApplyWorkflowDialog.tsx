
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Clock, CheckCircle, Workflow } from 'lucide-react';
import { toast } from 'sonner';

interface ApplyWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  transactionType?: string;
  serviceTier?: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  template_tasks: any[];
  is_active: boolean;
}

interface TaskTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  tasks: any[];
  transaction_type: string;
  service_tier: string;
}

const ApplyWorkflowDialog = ({ 
  open, 
  onOpenChange, 
  transactionId, 
  transactionType, 
  serviceTier 
}: ApplyWorkflowDialogProps) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedTemplateType, setSelectedTemplateType] = useState<'workflow' | 'task'>('workflow');
  const queryClient = useQueryClient();

  // Fetch available workflow templates (new system)
  const { data: workflowTemplates, isLoading: isLoadingWorkflowTemplates } = useQuery({
    queryKey: ['workflow-templates-active', transactionType],
    queryFn: async () => {
      let query = supabase
        .from('workflow_templates')
        .select(`
          *,
          template_tasks(*)
        `)
        .eq('is_active', true)
        .order('name');

      // Filter by transaction type if provided
      if (transactionType && transactionType !== 'General') {
        query = query.or(`type.eq.${transactionType},type.eq.General`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as WorkflowTemplate[];
    },
    enabled: open,
  });

  // Fetch available task templates (legacy system)
  const { data: taskTemplates, isLoading: isLoadingTaskTemplates } = useQuery({
    queryKey: ['task-templates', transactionType, serviceTier],
    queryFn: async () => {
      let query = supabase
        .from('task_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (transactionType) {
        query = query.or(`transaction_type.eq.${transactionType},transaction_type.eq.both`);
      }

      if (serviceTier) {
        query = query.or(`service_tier.eq.${serviceTier},service_tier.is.null`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TaskTemplate[];
    },
    enabled: open,
  });

  // Apply workflow template mutation (new system)
  const applyWorkflowTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { data, error } = await supabase.rpc('apply_workflow_template', {
        p_transaction_id: transactionId,
        p_template_id: templateId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', transactionId] });
      queryClient.invalidateQueries({ queryKey: ['transaction', transactionId] });
      queryClient.invalidateQueries({ queryKey: ['workflow-instances', transactionId] });
      toast.success('Workflow template applied successfully');
      onOpenChange(false);
      setSelectedTemplateId('');
    },
    onError: (error: any) => {
      console.error('Error applying workflow template:', error);
      toast.error('Failed to apply workflow template');
    },
  });

  // Apply task template mutation (legacy system)
  const applyTaskTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { data, error } = await supabase.rpc('apply_task_template', {
        p_transaction_id: transactionId,
        p_template_id: templateId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', transactionId] });
      queryClient.invalidateQueries({ queryKey: ['transaction', transactionId] });
      toast.success('Task template applied successfully');
      onOpenChange(false);
      setSelectedTemplateId('');
    },
    onError: (error: any) => {
      console.error('Error applying task template:', error);
      toast.error('Failed to apply task template');
    },
  });

  const isLoading = isLoadingWorkflowTemplates || isLoadingTaskTemplates;
  
  const selectedWorkflowTemplate = workflowTemplates?.find(t => t.id === selectedTemplateId);
  const selectedTaskTemplate = taskTemplates?.find(t => t.id === selectedTemplateId);

  const getTaskCount = () => {
    if (selectedWorkflowTemplate) {
      return selectedWorkflowTemplate.template_tasks?.length || 0;
    }
    if (selectedTaskTemplate) {
      return Array.isArray(selectedTaskTemplate.tasks) ? selectedTaskTemplate.tasks.length : 0;
    }
    return 0;
  };

  const getTasks = () => {
    if (selectedWorkflowTemplate) {
      return selectedWorkflowTemplate.template_tasks || [];
    }
    if (selectedTaskTemplate && Array.isArray(selectedTaskTemplate.tasks)) {
      return selectedTaskTemplate.tasks;
    }
    return [];
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    // Determine if this is a workflow template or task template
    const isWorkflowTemplate = workflowTemplates?.some(t => t.id === templateId);
    setSelectedTemplateType(isWorkflowTemplate ? 'workflow' : 'task');
  };

  const handleApply = () => {
    if (selectedTemplateId) {
      if (selectedTemplateType === 'workflow') {
        applyWorkflowTemplateMutation.mutate(selectedTemplateId);
      } else {
        applyTaskTemplateMutation.mutate(selectedTemplateId);
      }
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply Workflow Template</DialogTitle>
          </DialogHeader>
          <div className="p-8 text-center">Loading templates...</div>
        </DialogContent>
      </Dialog>
    );
  }

  // Filter out templates with empty or invalid IDs
  const allTemplatesOptions = [
    ...(workflowTemplates || [])
      .filter(t => t.id && t.id.trim() !== '')
      .map(t => ({ 
        id: t.id, 
        name: t.name, 
        taskCount: t.template_tasks?.length || 0,
        type: 'workflow' as const
      })),
    ...(taskTemplates || [])
      .filter(t => t.id && t.id.trim() !== '')
      .map(t => ({ 
        id: t.id, 
        name: t.name, 
        taskCount: Array.isArray(t.tasks) ? t.tasks.length : 0,
        type: 'task' as const
      }))
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Apply Workflow Template
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Select Workflow Template</label>
            <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a workflow template" />
              </SelectTrigger>
              <SelectContent>
                {allTemplatesOptions.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} ({template.taskCount} tasks)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template Preview */}
          {(selectedWorkflowTemplate || selectedTaskTemplate) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedWorkflowTemplate?.name || selectedTaskTemplate?.name}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {selectedWorkflowTemplate?.type || selectedTaskTemplate?.category}
                  </Badge>
                  <Badge variant="secondary">
                    {getTaskCount()} tasks
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {(selectedWorkflowTemplate?.description || selectedTaskTemplate?.description) && (
                  <p className="text-muted-foreground mb-4">
                    {selectedWorkflowTemplate?.description || selectedTaskTemplate?.description}
                  </p>
                )}
                
                <div className="space-y-2">
                  <h4 className="font-medium">Tasks to be created:</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {getTasks().map((task: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{task.subject || task.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.is_agent_visible && (
                            <Badge variant="outline" className="text-xs">
                              Agent
                            </Badge>
                          )}
                          {(task.due_date_rule?.days || task.days_from_contract) && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {task.due_date_rule?.days > 0 || task.days_from_contract > 0 ? '+' : ''}
                              {task.due_date_rule?.days || task.days_from_contract} days
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApply}
              disabled={!selectedTemplateId || applyWorkflowTemplateMutation.isPending || applyTaskTemplateMutation.isPending}
            >
              {(applyWorkflowTemplateMutation.isPending || applyTaskTemplateMutation.isPending) ? 'Applying...' : 'Apply Template'}
            </Button>
          </div>

          {allTemplatesOptions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No workflow templates available for this transaction type.</p>
              <p className="text-sm mt-2">
                Create templates in the Workflows section to get started.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyWorkflowDialog;
