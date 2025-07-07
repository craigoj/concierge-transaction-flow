import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Workflow,
  Play,
  Pause,
  Settings,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface WorkflowAutomationPanelProps {
  transactionId: string;
}

const WorkflowAutomationPanel = ({ transactionId }: WorkflowAutomationPanelProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: automationRules, isLoading: rulesLoading } = useQuery({
    queryKey: ['automation-rules', transactionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data;
    },
  });

  const { data: workflowTemplates, isLoading: templatesLoading } = useQuery({
    queryKey: ['workflow-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data;
    },
  });

  const { data: executions } = useQuery({
    queryKey: ['workflow-executions', transactionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('executed_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

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
      toast({
        title: 'Workflow Applied',
        description: 'The workflow template has been successfully applied to this transaction.',
      });
      queryClient.invalidateQueries({ queryKey: ['workflow-executions', transactionId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', transactionId] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to apply workflow template.',
      });
    },
  });

  const toggleAutomationMutation = useMutation({
    mutationFn: async ({ ruleId, isActive }: { ruleId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('automation_rules')
        .update({ is_active: isActive })
        .eq('id', ruleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules', transactionId] });
      toast({
        title: 'Automation Updated',
        description: 'Automation rule has been updated successfully.',
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  if (rulesLoading || templatesLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-brand-taupe/20 rounded w-3/4"></div>
            <div className="h-8 bg-brand-taupe/20 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workflow Template Application */}
      <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-blue-600" />
            Apply Workflow Template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a workflow template" />
              </SelectTrigger>
              <SelectContent>
                {workflowTemplates?.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => selectedTemplate && applyTemplateMutation.mutate(selectedTemplate)}
              disabled={!selectedTemplate || applyTemplateMutation.isPending}
            >
              <Zap className="h-4 w-4 mr-2" />
              Apply
            </Button>
          </div>
          {workflowTemplates && workflowTemplates.length === 0 && (
            <p className="text-sm text-brand-charcoal/60">
              No workflow templates available. Contact your coordinator to set up templates.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Active Automation Rules */}
      <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            Active Automations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {automationRules && automationRules.length > 0 ? (
            <div className="space-y-3">
              {automationRules.map((rule) => (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 border border-brand-taupe/20 rounded-lg bg-brand-cream/30"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-brand-charcoal">{rule.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {rule.trigger_event.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-brand-charcoal/60">
                      Automatically triggers when conditions are met
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={(checked) =>
                        toggleAutomationMutation.mutate({ ruleId: rule.id, isActive: checked })
                      }
                    />
                    {rule.is_active ? (
                      <Play className="h-4 w-4 text-green-500" />
                    ) : (
                      <Pause className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Settings className="h-12 w-12 text-brand-taupe/40 mx-auto mb-3" />
              <p className="text-brand-charcoal/60">No automation rules configured</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Workflow Executions */}
      <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            Recent Workflow Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {executions && executions.length > 0 ? (
            <div className="space-y-3">
              {executions.slice(0, 5).map((execution) => (
                <div
                  key={execution.id}
                  className="flex items-center gap-3 p-3 border border-brand-taupe/20 rounded-lg"
                >
                  {getStatusIcon(execution.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-brand-charcoal">Workflow Execution</span>
                      <Badge className={getStatusColor(execution.status)}>{execution.status}</Badge>
                    </div>
                    <p className="text-sm text-brand-charcoal/60">
                      {new Date(execution.executed_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Clock className="h-12 w-12 text-brand-taupe/40 mx-auto mb-3" />
              <p className="text-brand-charcoal/60">No workflow activity yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowAutomationPanel;
