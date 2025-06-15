
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

interface ApplyWorkflowTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  transactionType?: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  template_tasks: any[];
  is_active: boolean;
}

const ApplyWorkflowTemplateDialog = ({ 
  open, 
  onOpenChange, 
  transactionId, 
  transactionType 
}: ApplyWorkflowTemplateDialogProps) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const queryClient = useQueryClient();

  // Fetch available workflow templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['workflow-templates-active'],
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

  // Apply workflow template mutation
  const applyTemplateMutation = useMutation({
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

  const selectedTemplate = templates?.find(t => t.id === selectedTemplateId);

  const handleApply = () => {
    if (selectedTemplateId) {
      applyTemplateMutation.mutate(selectedTemplateId);
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
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a workflow template" />
              </SelectTrigger>
              <SelectContent>
                {templates?.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} ({template.template_tasks?.length || 0} tasks)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template Preview */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{selectedTemplate.name}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">{selectedTemplate.type}</Badge>
                  <Badge variant="secondary">
                    {selectedTemplate.template_tasks?.length || 0} tasks
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {selectedTemplate.description && (
                  <p className="text-muted-foreground mb-4">{selectedTemplate.description}</p>
                )}
                
                <div className="space-y-2">
                  <h4 className="font-medium">Tasks to be created:</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedTemplate.template_tasks?.map((task: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{task.subject}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.is_agent_visible && (
                            <Badge variant="outline" className="text-xs">
                              Agent
                            </Badge>
                          )}
                          {task.due_date_rule?.type === 'days_from_event' && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {task.due_date_rule.days > 0 ? '+' : ''}{task.due_date_rule.days} days
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
              disabled={!selectedTemplateId || applyTemplateMutation.isPending}
            >
              {applyTemplateMutation.isPending ? 'Applying...' : 'Apply Template'}
            </Button>
          </div>

          {templates?.length === 0 && (
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

export default ApplyWorkflowTemplateDialog;
