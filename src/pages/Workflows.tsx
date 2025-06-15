
import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Play, Pause, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface AutomationRule {
  id: string;
  name: string;
  trigger_event: string;
  trigger_condition?: any;
  template_id: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  template?: {
    name: string;
    subject: string;
  };
  created_by_profile?: {
    first_name?: string;
    last_name?: string;
  };
}

interface WorkflowExecution {
  id: string;
  rule_id: string;
  transaction_id: string;
  executed_at: string;
  status: string;
  error_message?: string;
  rule?: {
    name: string;
  };
  transaction?: {
    property_address: string;
  };
}

const Workflows = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const queryClient = useQueryClient();

  // Fetch automation rules
  const { data: rules, isLoading } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_rules')
        .select(`
          *,
          template:template_id(name, subject),
          created_by_profile:created_by(first_name, last_name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AutomationRule[];
    }
  });

  // Fetch workflow executions
  const { data: executions } = useQuery({
    queryKey: ['workflow-executions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_executions')
        .select(`
          *,
          rule:rule_id(name),
          transaction:transaction_id(property_address)
        `)
        .order('executed_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as WorkflowExecution[];
    }
  });

  // Toggle rule active status
  const toggleMutation = useMutation({
    mutationFn: async ({ ruleId, isActive }: { ruleId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('automation_rules')
        .update({ is_active: isActive })
        .eq('id', ruleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success('Rule status updated');
    },
    onError: (error) => {
      console.error('Error updating rule:', error);
      toast.error('Failed to update rule');
    }
  });

  // Delete rule mutation
  const deleteMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', ruleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success('Rule deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting rule:', error);
      toast.error('Failed to delete rule');
    }
  });

  const handleToggle = (ruleId: string, currentStatus: boolean) => {
    toggleMutation.mutate({ ruleId, isActive: !currentStatus });
  };

  const handleDelete = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this automation rule?')) {
      deleteMutation.mutate(ruleId);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading workflows...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Automation Workflows</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Automation Rule</DialogTitle>
            </DialogHeader>
            <WorkflowForm onSuccess={() => setCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules?.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{rule.name}</h3>
                        <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Trigger:</strong> {rule.trigger_event.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Template:</strong> {rule.template?.name}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={() => handleToggle(rule.id, rule.is_active)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRule(rule);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {rules?.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No automation rules created yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Executions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executions?.map((execution) => (
                  <div key={execution.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{execution.rule?.name}</span>
                      <Badge 
                        variant={
                          execution.status === 'success' ? 'default' : 
                          execution.status === 'failed' ? 'destructive' : 'secondary'
                        }
                      >
                        {execution.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {execution.transaction?.property_address}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(execution.executed_at).toLocaleString()}
                    </p>
                    {execution.error_message && (
                      <p className="text-xs text-red-600 mt-1">
                        {execution.error_message}
                      </p>
                    )}
                  </div>
                ))}
                {executions?.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No executions yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Automation Rule</DialogTitle>
          </DialogHeader>
          {selectedRule && (
            <WorkflowForm
              rule={selectedRule}
              onSuccess={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface WorkflowFormProps {
  rule?: AutomationRule;
  onSuccess: () => void;
}

const WorkflowForm: React.FC<WorkflowFormProps> = ({ rule, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    trigger_event: rule?.trigger_event || 'task_completed',
    template_id: rule?.template_id || '',
    trigger_condition: rule?.trigger_condition || {},
    is_active: rule?.is_active ?? true
  });

  const queryClient = useQueryClient();

  // Fetch email templates
  const { data: templates } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, name, subject')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const user = await supabase.auth.getUser();
      
      if (rule) {
        // Update existing rule
        const { error } = await supabase
          .from('automation_rules')
          .update(data)
          .eq('id', rule.id);
        if (error) throw error;
      } else {
        // Create new rule
        const { error } = await supabase
          .from('automation_rules')
          .insert({
            ...data,
            created_by: user.data.user?.id
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success(rule ? 'Rule updated successfully' : 'Rule created successfully');
      onSuccess();
    },
    onError: (error) => {
      console.error('Error saving rule:', error);
      toast.error('Failed to save rule');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Rule Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="e.g., Send inspection scheduled email"
          required
        />
      </div>

      <div>
        <Label>Trigger Event</Label>
        <Select value={formData.trigger_event} onValueChange={(value) => setFormData({...formData, trigger_event: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="task_completed">Task Completed</SelectItem>
            <SelectItem value="status_changed">Status Changed</SelectItem>
            <SelectItem value="document_signed">Document Signed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Email Template</Label>
        <Select value={formData.template_id} onValueChange={(value) => setFormData({...formData, template_id: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select template" />
          </SelectTrigger>
          <SelectContent>
            {templates?.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name} - {template.subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
        />
        <Label>Rule is active</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : (rule ? 'Update' : 'Create')} Rule
        </Button>
      </div>
    </form>
  );
};

export default Workflows;
