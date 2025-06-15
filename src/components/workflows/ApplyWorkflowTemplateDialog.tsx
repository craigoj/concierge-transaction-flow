
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Workflow, Calendar, Mail, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ApplyWorkflowTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  type: string;
  description?: string;
  is_active: boolean;
  template_tasks: {
    id: string;
    subject: string;
    task_type?: string;
    email_template_id?: string;
  }[];
}

const ApplyWorkflowTemplateDialog = ({ 
  open, 
  onOpenChange, 
  transactionId 
}: ApplyWorkflowTemplateDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['workflow-templates-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select(`
          *,
          template_tasks(
            id,
            subject,
            task_type,
            email_template_id
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

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
      toast.success('Workflow template applied successfully!');
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error('Error applying template:', error);
      toast.error('Failed to apply workflow template');
    },
  });

  const filteredTemplates = templates?.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTemplatesByType = (type: string) => {
    if (type === 'all') return filteredTemplates || [];
    return filteredTemplates?.filter(template => template.type === type) || [];
  };

  const getTaskTypeIcon = (taskType?: string) => {
    switch (taskType) {
      case 'EMAIL':
        return <Mail className="h-3 w-3" />;
      case 'TODO':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Workflow className="h-3 w-3" />;
    }
  };

  const handleApplyTemplate = () => {
    if (selectedTemplate) {
      applyTemplateMutation.mutate(selectedTemplate.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Apply Workflow Template</DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
            <div>
              <h3 className="font-medium mb-3">Select Template</h3>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="Listing">Listing</TabsTrigger>
                  <TabsTrigger value="Buyer">Buyer</TabsTrigger>
                  <TabsTrigger value="General">General</TabsTrigger>
                </TabsList>

                {['all', 'Listing', 'Buyer', 'General'].map((type) => (
                  <TabsContent key={type} value={type}>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {isLoading ? (
                          <div className="text-center p-4">Loading templates...</div>
                        ) : getTemplatesByType(type).length > 0 ? (
                          getTemplatesByType(type).map((template) => (
                            <div
                              key={template.id}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedTemplate?.id === template.id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'hover:bg-gray-50'
                              }`}
                              onClick={() => setSelectedTemplate(template)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{template.name}</h4>
                                <Badge variant="outline">{template.type}</Badge>
                              </div>
                              {template.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {template.description}
                                </p>
                              )}
                              <div className="text-xs text-muted-foreground">
                                {template.template_tasks.length} tasks
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center p-4 text-muted-foreground">
                            No {type === 'all' ? '' : type.toLowerCase()} templates found
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            <div>
              <h3 className="font-medium mb-3">Template Preview</h3>
              {selectedTemplate ? (
                <div className="border rounded-lg p-4 h-[400px] overflow-hidden flex flex-col">
                  <div className="mb-4">
                    <h4 className="font-medium text-lg">{selectedTemplate.name}</h4>
                    {selectedTemplate.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedTemplate.description}
                      </p>
                    )}
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <h5 className="font-medium mb-2">Tasks ({selectedTemplate.template_tasks.length})</h5>
                    <ScrollArea className="h-full">
                      <div className="space-y-2">
                        {selectedTemplate.template_tasks.map((task, index) => (
                          <div key={task.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <span className="text-xs bg-gray-200 rounded px-1 min-w-[20px] text-center">
                              {index + 1}
                            </span>
                            {getTaskTypeIcon(task.task_type)}
                            <span className="text-sm flex-1">{task.subject}</span>
                            {task.email_template_id && (
                              <Badge variant="secondary" className="text-xs">
                                Email
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-4 h-[400px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Workflow className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Select a template to preview its tasks</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
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
      </DialogContent>
    </Dialog>
  );
};

export default ApplyWorkflowTemplateDialog;
