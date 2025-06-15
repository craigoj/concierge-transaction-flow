
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Workflow, Settings } from 'lucide-react';
import { toast } from 'sonner';
import CreateWorkflowTemplateDialog from './CreateWorkflowTemplateDialog';
import TemplateTaskEditor from './TemplateTaskEditor';

interface WorkflowTemplate {
  id: string;
  name: string;
  type: 'Listing' | 'Buyer' | 'General';
  description?: string;
  is_active: boolean;
  created_at: string;
  template_tasks: any[];
}

const WorkflowTemplateManager = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTaskEditorOpen, setIsTaskEditorOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch workflow templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['workflow-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select(`
          *,
          template_tasks(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WorkflowTemplate[];
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('workflow_templates')
        .delete()
        .eq('id', templateId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-templates'] });
      toast.success('Template deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    },
  });

  // Toggle template active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ templateId, isActive }: { templateId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('workflow_templates')
        .update({ is_active: isActive })
        .eq('id', templateId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-templates'] });
      toast.success('Template status updated');
    },
    onError: (error: any) => {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
    },
  });

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      deleteTemplateMutation.mutate(templateId);
    }
  };

  const handleEditTasks = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setIsTaskEditorOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          Loading workflow templates...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Templates</h2>
          <p className="text-muted-foreground">
            Manage your task templates for automated workflow creation
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="Listing">Listing Templates</TabsTrigger>
          <TabsTrigger value="Buyer">Buyer Templates</TabsTrigger>
          <TabsTrigger value="General">General Templates</TabsTrigger>
        </TabsList>

        {['all', 'Listing', 'Buyer', 'General'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            <div className="grid gap-4">
              {templates
                ?.filter(template => tab === 'all' || template.type === tab)
                ?.map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Workflow className="h-5 w-5" />
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            {template.description && (
                              <p className="text-sm text-muted-foreground">
                                {template.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={template.type === 'Listing' ? 'default' : template.type === 'Buyer' ? 'secondary' : 'outline'}>
                            {template.type}
                          </Badge>
                          <Badge variant={template.is_active ? 'default' : 'secondary'}>
                            {template.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {template.template_tasks?.length || 0} tasks configured
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTasks(template)}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Edit Tasks
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleActiveMutation.mutate({
                              templateId: template.id,
                              isActive: !template.is_active
                            })}
                          >
                            {template.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              
              {templates?.filter(template => tab === 'all' || template.type === tab)?.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">
                      No {tab === 'all' ? '' : tab.toLowerCase()} templates found.
                    </p>
                    <Button 
                      className="mt-4" 
                      onClick={() => setIsCreateDialogOpen(true)}
                    >
                      Create Your First Template
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <CreateWorkflowTemplateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <TemplateTaskEditor
        open={isTaskEditorOpen}
        onOpenChange={setIsTaskEditorOpen}
        template={selectedTemplate}
      />
    </div>
  );
};

export default WorkflowTemplateManager;
