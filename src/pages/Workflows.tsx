
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
import { Plus, Edit, Trash2, Play, Pause, Zap, Settings } from 'lucide-react';
import { toast } from 'sonner';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { logger } from '@/lib/logger';

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
      logger.error('Error updating automation rule', error as Error, { ruleId: undefined }, 'workflows');
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
      logger.error('Error deleting automation rule', error as Error, { ruleId: undefined }, 'workflows');
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
      <div className="p-8">
        <div className="mb-8">
          <Breadcrumb />
        </div>
        <div className="mb-12">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-brand-taupe/20 rounded-xl w-1/3"></div>
            <div className="h-6 bg-brand-taupe/20 rounded-lg w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-8">
        <Breadcrumb />
      </div>

      {/* Premium Header Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider uppercase mb-4">
              Automation Workflows
            </h1>
            <p className="text-lg font-brand-body text-brand-charcoal/70 max-w-2xl">
              Streamline your operations with intelligent automation excellence
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-charcoal hover:bg-brand-taupe-dark text-brand-background font-brand-heading tracking-wide px-8 py-4 rounded-xl shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-300 gap-3">
                <Plus className="h-5 w-5" />
                CREATE RULE
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm border-brand-taupe/30">
              <DialogHeader>
                <DialogTitle className="font-brand-heading text-brand-charcoal tracking-wide uppercase">Create Automation Rule</DialogTitle>
              </DialogHeader>
              <WorkflowForm onSuccess={() => setCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        <div className="w-24 h-px bg-brand-taupe"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rules List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-brand-taupe" />
                Active Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules?.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-6 border border-brand-taupe/30 rounded-xl hover:shadow-brand-subtle transition-all duration-300 group">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="font-brand-heading font-medium text-brand-charcoal tracking-wide">{rule.name}</h3>
                        <Badge 
                          variant={rule.is_active ? 'default' : 'secondary'}
                          className={`font-brand-heading tracking-wide ${
                            rule.is_active 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                        >
                          {rule.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </Badge>
                      </div>
                      <p className="text-sm font-brand-body text-brand-charcoal/70 mb-2">
                        <strong>Trigger:</strong> {rule.trigger_event.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="text-sm font-brand-body text-brand-charcoal/70">
                        <strong>Template:</strong> {rule.template?.name}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
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
                        className="hover:bg-brand-taupe/20"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(rule.id)}
                        className="hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {rules?.length === 0 && (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 bg-brand-taupe/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                      <Zap className="h-12 w-12 text-brand-taupe" />
                    </div>
                    <h3 className="text-2xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase mb-4">
                      No Automation Rules
                    </h3>
                    <p className="text-lg font-brand-body text-brand-charcoal/60 mb-8">
                      Create your first automation rule to streamline workflows
                    </p>
                    <Button 
                      onClick={() => setCreateDialogOpen(true)}
                      className="bg-brand-charcoal hover:bg-brand-taupe-dark text-brand-background font-brand-heading tracking-wide px-8 py-3 rounded-xl"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      CREATE FIRST RULE
                    </Button>
                    <div className="w-16 h-px bg-brand-taupe mx-auto mt-8"></div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Executions */}
        <div className="lg:col-span-1">
          <Card className="shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Play className="h-5 w-5 text-brand-taupe" />
                Recent Executions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executions?.map((execution) => (
                  <div key={execution.id} className="p-4 border border-brand-taupe/30 rounded-xl hover:shadow-brand-subtle transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-brand-heading font-medium text-brand-charcoal tracking-wide">
                        {execution.rule?.name}
                      </span>
                      <Badge 
                        variant={
                          execution.status === 'success' ? 'default' : 
                          execution.status === 'failed' ? 'destructive' : 'secondary'
                        }
                        className={`text-xs font-brand-heading tracking-wide ${
                          execution.status === 'success' ? 'bg-green-100 text-green-800' :
                          execution.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {execution.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs font-brand-body text-brand-charcoal/60 mb-1">
                      {execution.transaction?.property_address}
                    </p>
                    <p className="text-xs font-brand-body text-brand-charcoal/60">
                      {new Date(execution.executed_at).toLocaleString()}
                    </p>
                    {execution.error_message && (
                      <p className="text-xs text-red-600 mt-2 font-brand-body">
                        {execution.error_message}
                      </p>
                    )}
                  </div>
                ))}
                {executions?.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-brand-taupe/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Play className="h-8 w-8 text-brand-taupe" />
                    </div>
                    <p className="text-sm font-brand-body text-brand-charcoal/60">
                      No executions yet
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm border-brand-taupe/30">
          <DialogHeader>
            <DialogTitle className="font-brand-heading text-brand-charcoal tracking-wide uppercase">Edit Automation Rule</DialogTitle>
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
      logger.error('Error saving automation rule', error as Error, { ruleId: undefined }, 'workflows');
      toast.error('Failed to save rule');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label className="font-brand-heading text-brand-charcoal tracking-wide uppercase">Rule Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="e.g., Send inspection scheduled email"
          required
          className="bg-white/80 border-brand-taupe/30 rounded-xl mt-2"
        />
      </div>

      <div>
        <Label className="font-brand-heading text-brand-charcoal tracking-wide uppercase">Trigger Event</Label>
        <Select value={formData.trigger_event} onValueChange={(value) => setFormData({...formData, trigger_event: value})}>
          <SelectTrigger className="bg-white/80 border-brand-taupe/30 rounded-xl mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
            <SelectItem value="task_completed">Task Completed</SelectItem>
            <SelectItem value="status_changed">Status Changed</SelectItem>
            <SelectItem value="document_signed">Document Signed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="font-brand-heading text-brand-charcoal tracking-wide uppercase">Email Template</Label>
        <Select value={formData.template_id} onValueChange={(value) => setFormData({...formData, template_id: value})}>
          <SelectTrigger className="bg-white/80 border-brand-taupe/30 rounded-xl mt-2">
            <SelectValue placeholder="Select template" />
          </SelectTrigger>
          <SelectContent className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
            {templates?.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name} - {template.subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-3 p-4 bg-brand-taupe/10 rounded-xl">
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
        />
        <Label className="font-brand-heading text-brand-charcoal tracking-wide uppercase">Rule is active</Label>
      </div>

      <div className="flex justify-end space-x-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onSuccess}
          className="bg-white/80 border-brand-taupe/30 text-brand-charcoal hover:bg-brand-taupe/10 font-brand-heading tracking-wide"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={mutation.isPending}
          className="bg-brand-charcoal hover:bg-brand-taupe-dark text-brand-background font-brand-heading tracking-wide"
        >
          {mutation.isPending ? 'Saving...' : (rule ? 'Update' : 'Create')} Rule
        </Button>
      </div>
    </form>
  );
};

export default Workflows;
