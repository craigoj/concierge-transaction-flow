import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Zap, Clock, CheckCircle, Workflow, Search, Calendar, Users, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedApplyWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  transactionType?: string;
  serviceTier?: string;
  closingDate?: string;
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

const EnhancedApplyWorkflowDialog = ({ 
  open, 
  onOpenChange, 
  transactionId, 
  transactionType, 
  serviceTier,
  closingDate
}: EnhancedApplyWorkflowDialogProps) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedTemplateType, setSelectedTemplateType] = useState<'workflow' | 'task'>('workflow');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const queryClient = useQueryClient();

  // Fetch available workflow templates (new system)
  const { data: workflowTemplates, isLoading: isLoadingWorkflowTemplates } = useQuery({
    queryKey: ['workflow-templates-enhanced', transactionType, searchTerm],
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
      
      // Apply client-side search filtering
      let filtered = data as WorkflowTemplate[];
      if (searchTerm) {
        filtered = filtered.filter(t => 
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      return filtered;
    },
    enabled: open,
  });

  // Fetch available task templates (legacy system)
  const { data: taskTemplates, isLoading: isLoadingTaskTemplates } = useQuery({
    queryKey: ['task-templates-enhanced', transactionType, serviceTier, searchTerm],
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
      
      // Apply client-side search filtering
      let filtered = data as TaskTemplate[];
      if (searchTerm) {
        filtered = filtered.filter(t => 
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      return filtered;
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

  // Combine and filter templates with proper type handling
  const allTemplates = React.useMemo(() => {
    const combined = [
      ...(workflowTemplates || []).map(t => ({ 
        ...t, 
        source: 'workflow' as const,
        taskCount: t.template_tasks?.length || 0,
        isImported: t.description?.includes('Imported from') || false,
        templateType: t.type // Use templateType to avoid conflict
      })),
      ...(taskTemplates || []).map(t => ({ 
        ...t, 
        source: 'task' as const,
        taskCount: Array.isArray(t.tasks) ? t.tasks.length : 0,
        isImported: false,
        templateType: t.category // Use templateType to avoid conflict
      }))
    ];

    if (filterType === 'all') return combined;
    if (filterType === 'imported') return combined.filter(t => t.isImported);
    if (filterType === 'manual') return combined.filter(t => !t.isImported);
    return combined.filter(t => t.templateType === filterType);
  }, [workflowTemplates, taskTemplates, filterType]);

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

  const formatDueDateRule = (rule: any) => {
    if (!rule) return 'No due date';
    if (rule.type === 'days_from_event') {
      const days = rule.days || 0;
      const event = rule.event || 'contract';
      return `${days >= 0 ? '+' : ''}${days} days from ${event.replace('_', ' ')}`;
    }
    return 'Custom rule';
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Apply Workflow Template
            {transactionType && (
              <Badge variant="outline" className="ml-2">{transactionType}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enhanced Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter templates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Templates</SelectItem>
                <SelectItem value="imported">XML Imported</SelectItem>
                <SelectItem value="manual">Manually Created</SelectItem>
                <SelectItem value="Listing">Listing Templates</SelectItem>
                <SelectItem value="Buyer">Buyer Templates</SelectItem>
                <SelectItem value="General">General Templates</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template Selection */}
            <div>
              <h3 className="font-medium mb-3">Available Templates ({allTemplates.length})</h3>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {allTemplates.map((template) => (
                    <Card 
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-sm ${
                        selectedTemplateId === template.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-xs">
                              {template.templateType}
                            </Badge>
                            {template.isImported && (
                              <Badge variant="secondary" className="text-xs">
                                Imported
                              </Badge>
                            )}
                          </div>
                        </div>
                        {template.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {template.description}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {template.taskCount} tasks
                          </span>
                          <span className="flex items-center gap-1">
                            <Workflow className="h-3 w-3" />
                            {template.source}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Enhanced Template Preview */}
            <div>
              <h3 className="font-medium mb-3">Template Preview</h3>
              {(selectedWorkflowTemplate || selectedTaskTemplate) ? (
                <Card className="h-[500px] flex flex-col">
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
                      {(selectedWorkflowTemplate?.description?.includes('Imported from') || false) && (
                        <Badge variant="secondary">XML Imported</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    {(selectedWorkflowTemplate?.description || selectedTaskTemplate?.description) && (
                      <p className="text-muted-foreground mb-4 text-sm">
                        {selectedWorkflowTemplate?.description || selectedTaskTemplate?.description}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Task Timeline:</h4>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {getTasks().map((task: any, index: number) => (
                            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                              <span className="text-xs bg-gray-200 rounded px-2 py-1 min-w-[24px] text-center">
                                {index + 1}
                              </span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">{task.subject || task.title}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  {task.due_date_rule && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatDueDateRule(task.due_date_rule)}
                                    </span>
                                  )}
                                  {task.days_from_contract && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {task.days_from_contract > 0 ? '+' : ''}{task.days_from_contract} days
                                    </span>
                                  )}
                                  {task.is_agent_visible && (
                                    <Badge variant="outline" className="text-xs">Agent</Badge>
                                  )}
                                  {task.email_template_id && (
                                    <Badge variant="outline" className="text-xs">Email</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-[500px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a template to preview its tasks</p>
                    <p className="text-sm mt-2">Use search and filters to find the right template</p>
                  </div>
                </Card>
              )}
            </div>
          </div>

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

          {allTemplates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No templates found matching your criteria.</p>
              <p className="text-sm mt-2">
                Try adjusting your search terms or filters, or import XML templates to get started.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedApplyWorkflowDialog;
