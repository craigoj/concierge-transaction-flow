
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ApplyWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  transactionType?: string;
  serviceTier?: string;
}

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  transaction_type: string;
  service_tier: string;
  tasks: any[];
  is_active: boolean;
}

const ApplyWorkflowDialog = ({ 
  open, 
  onOpenChange, 
  transactionId, 
  transactionType, 
  serviceTier 
}: ApplyWorkflowDialogProps) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const queryClient = useQueryClient();

  // Fetch available task templates
  const { data: templates, isLoading } = useQuery({
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

  // Apply workflow mutation
  const applyWorkflowMutation = useMutation({
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
      toast.success('Workflow applied successfully');
      onOpenChange(false);
      setSelectedTemplateId('');
    },
    onError: (error: any) => {
      console.error('Error applying workflow:', error);
      toast.error('Failed to apply workflow');
    },
  });

  const selectedTemplate = templates?.find(t => t.id === selectedTemplateId);

  const handleApply = () => {
    if (selectedTemplateId) {
      applyWorkflowMutation.mutate(selectedTemplateId);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply Task Workflow</DialogTitle>
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
            Apply Task Workflow
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
                    {template.name} ({template.tasks.length} tasks)
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
                  <Badge variant="outline">{selectedTemplate.category}</Badge>
                  <Badge variant="secondary">{selectedTemplate.tasks.length} tasks</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {selectedTemplate.description && (
                  <p className="text-muted-foreground mb-4">{selectedTemplate.description}</p>
                )}
                
                <div className="space-y-2">
                  <h4 className="font-medium">Tasks to be created:</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedTemplate.tasks.map((task: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{task.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              task.priority === 'high' ? 'destructive' : 
                              task.priority === 'medium' ? 'default' : 'secondary'
                            }
                          >
                            {task.priority}
                          </Badge>
                          {task.days_from_contract && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {task.days_from_contract > 0 ? '+' : ''}{task.days_from_contract} days
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
              disabled={!selectedTemplateId || applyWorkflowMutation.isPending}
            >
              {applyWorkflowMutation.isPending ? 'Applying...' : 'Apply Workflow'}
            </Button>
          </div>

          {templates?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No workflow templates available for this transaction type.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyWorkflowDialog;
