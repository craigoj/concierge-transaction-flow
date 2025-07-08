
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Workflow, Calendar, Mail, CheckCircle, Filter, Clock, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WorkflowTemplate, DueDateRule, TemplateSortOption, TemplateFilterSource, TemplateError } from '@/types/templates';

interface ApplyWorkflowTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  transactionType?: string;
  closingDate?: string;
}


const ApplyWorkflowTemplateDialog = ({ 
  open, 
  onOpenChange, 
  transactionId,
  transactionType,
  closingDate
}: ApplyWorkflowTemplateDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [sortBy, setSortBy] = useState<TemplateSortOption>('name');
  const [filterBySource, setFilterBySource] = useState<TemplateFilterSource>('all');
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['workflow-templates-active', transactionType],
    queryFn: async () => {
      const query = supabase
        .from('workflow_templates')
        .select(`
          *,
          template_tasks(
            id,
            subject,
            task_type,
            email_template_id,
            due_date_rule,
            sort_order,
            is_agent_visible,
            is_milestone
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data as WorkflowTemplate[];
    },
    enabled: open
  });

  const applyTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { data, error } = await supabase.rpc('apply_workflow_template', {
        p_transaction_id: transactionId,
        p_template_id: templateId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction-tasks', transactionId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', transactionId] });
      toast.success('Workflow template applied successfully!');
      onOpenChange(false);
      setSelectedTemplate(null);
    },
    onError: (error: TemplateError) => {
      console.error('Error applying template:', error);
      toast.error('Failed to apply workflow template');
    },
  });

  // Enhanced filtering and sorting logic
  const filteredAndSortedTemplates = React.useMemo(() => {
    if (!templates) return [];

    const filtered = templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = !transactionType || 
                         template.type === transactionType || 
                         template.type === 'General';

      const matchesSource = filterBySource === 'all' || 
                           (filterBySource === 'imported' && template.description?.includes('Imported from')) ||
                           (filterBySource === 'manual' && !template.description?.includes('Imported from'));

      return matchesSearch && matchesType && matchesSource;
    });

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'task_count':
          return (b.template_tasks?.length || 0) - (a.template_tasks?.length || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [templates, searchTerm, transactionType, filterBySource, sortBy]);

  const getTemplatesByType = (type: string) => {
    if (type === 'all') return filteredAndSortedTemplates;
    return filteredAndSortedTemplates.filter(template => template.type === type);
  };

  const getTaskTypeIcon = (taskType?: string) => {
    switch (taskType) {
      case 'EMAIL':
        return <Mail className="h-3 w-3" />;
      case 'APPOINTMENT':
        return <Calendar className="h-3 w-3" />;
      case 'TODO':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Workflow className="h-3 w-3" />;
    }
  };

  const formatDueDateRule = (rule: DueDateRule) => {
    if (!rule || rule.type === 'no_due_date') return 'No due date';
    
    if (rule.type === 'days_from_event') {
      const days = rule.days || 0;
      const event = rule.event || 'contract';
      const sign = days >= 0 ? '+' : '';
      return `${sign}${days} days from ${event.replace('_', ' ')}`;
    }
    
    if (rule.type === 'specific_date') {
      return `Due: ${rule.date}`;
    }
    
    return 'Custom rule';
  };

  const getTemplateStats = (template: WorkflowTemplate) => {
    const tasks = template.template_tasks || [];
    const milestones = tasks.filter(t => t.is_milestone).length;
    const agentTasks = tasks.filter(t => t.is_agent_visible).length;
    const emailTasks = tasks.filter(t => t.email_template_id).length;
    
    return { milestones, agentTasks, emailTasks };
  };

  const handleApplyTemplate = () => {
    if (selectedTemplate) {
      applyTemplateMutation.mutate(selectedTemplate.id);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSortBy('name');
    setFilterBySource('all');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Apply Workflow Template
            {transactionType && (
              <Badge variant="outline" className="ml-2">
                {transactionType}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4">
          {/* Enhanced Search and Filter Bar */}
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
            
            <Select value={sortBy} onValueChange={(value: TemplateSortOption) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="task_count">Task Count</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBySource} onValueChange={(value: TemplateFilterSource) => setFilterBySource(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="imported">XML Imported</SelectItem>
                <SelectItem value="manual">Manual Created</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={resetFilters} size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
            {/* Template List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Select Template</h3>
                <span className="text-sm text-muted-foreground">
                  {filteredAndSortedTemplates.length} templates found
                </span>
              </div>
              
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="Listing">Listing</TabsTrigger>
                  <TabsTrigger value="Buyer">Buyer</TabsTrigger>
                  <TabsTrigger value="General">General</TabsTrigger>
                </TabsList>

                {['all', 'Listing', 'Buyer', 'General'].map((type) => (
                  <TabsContent key={type} value={type}>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-3">
                        {isLoading ? (
                          <div className="text-center p-4">Loading templates...</div>
                        ) : getTemplatesByType(type).length > 0 ? (
                          getTemplatesByType(type).map((template) => {
                            const stats = getTemplateStats(template);
                            const isImported = template.description?.includes('Imported from');
                            
                            return (
                              <div
                                key={template.id}
                                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                                  selectedTemplate?.id === template.id
                                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                                    : 'hover:bg-gray-50'
                                }`}
                                onClick={() => setSelectedTemplate(template)}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-sm">{template.name}</h4>
                                    {template.description && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {template.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-1 ml-3">
                                    <Badge variant="outline" className="text-xs">
                                      {template.type}
                                    </Badge>
                                    {isImported && (
                                      <Badge variant="secondary" className="text-xs">
                                        Imported
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>{template.template_tasks?.length || 0} tasks</span>
                                  {stats.milestones > 0 && (
                                    <span className="flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3" />
                                      {stats.milestones} milestones
                                    </span>
                                  )}
                                  {stats.agentTasks > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {stats.agentTasks} agent
                                    </span>
                                  )}
                                  {stats.emailTasks > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {stats.emailTasks} email
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center p-8 text-muted-foreground">
                            <Workflow className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No {type === 'all' ? '' : type.toLowerCase()} templates found</p>
                            <p className="text-xs mt-1">Try adjusting your search or filters</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* Enhanced Template Preview */}
            <div>
              <h3 className="font-medium mb-3">Template Preview</h3>
              {selectedTemplate ? (
                <div className="border rounded-lg p-4 h-[500px] overflow-hidden flex flex-col">
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-lg">{selectedTemplate.name}</h4>
                      <Badge variant="outline">{selectedTemplate.type}</Badge>
                    </div>
                    
                    {selectedTemplate.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {selectedTemplate.description}
                      </p>
                    )}

                    <div className="flex gap-2 mb-3">
                      {(() => {
                        const stats = getTemplateStats(selectedTemplate);
                        return (
                          <>
                            <Badge variant="secondary" className="text-xs">
                              {selectedTemplate.template_tasks?.length || 0} tasks
                            </Badge>
                            {stats.milestones > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {stats.milestones} milestones
                              </Badge>
                            )}
                            {stats.agentTasks > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {stats.agentTasks} agent tasks
                              </Badge>
                            )}
                            {stats.emailTasks > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {stats.emailTasks} with email
                              </Badge>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <h5 className="font-medium mb-2">Task Timeline</h5>
                    <ScrollArea className="h-full">
                      <div className="space-y-2">
                        {selectedTemplate.template_tasks
                          ?.sort((a, b) => a.sort_order - b.sort_order)
                          ?.map((task, index) => (
                          <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <span className="text-xs bg-gray-200 rounded px-2 py-1 min-w-[24px] text-center font-medium">
                              {index + 1}
                            </span>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {getTaskTypeIcon(task.task_type)}
                                <span className="text-sm font-medium truncate">{task.subject}</span>
                                {task.is_milestone && (
                                  <Badge variant="outline" className="text-xs">Milestone</Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{formatDueDateRule(task.due_date_rule)}</span>
                              </div>
                              
                              <div className="flex gap-1 mt-1">
                                {task.is_agent_visible && (
                                  <Badge variant="secondary" className="text-xs">Agent</Badge>
                                )}
                                {task.email_template_id && (
                                  <Badge variant="secondary" className="text-xs">Email</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-4 h-[500px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Workflow className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Select a template to preview its tasks and timeline</p>
                    <p className="text-sm mt-1">Use the search and filters to find the right template</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {selectedTemplate && (
                <span>
                  Selected: <strong>{selectedTemplate.name}</strong> 
                  ({selectedTemplate.template_tasks?.length || 0} tasks)
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleApplyTemplate}
                disabled={!selectedTemplate || applyTemplateMutation.isPending}
              >
                {applyTemplateMutation.isPending ? 'Applying...' : 'Apply Template'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyWorkflowTemplateDialog;
