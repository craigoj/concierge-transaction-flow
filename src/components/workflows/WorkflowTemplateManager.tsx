
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Workflow, Settings, Upload, History, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import CreateWorkflowTemplateDialog from './CreateWorkflowTemplateDialog';
import TemplateTaskEditor from './TemplateTaskEditor';
import XMLTemplateImportDialog from './XMLTemplateImportDialog';
import ImportHistoryDialog from './ImportHistoryDialog';

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
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'task_count'>('name');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterSource, setFilterSource] = useState<'all' | 'imported' | 'manual'>('all');
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

  // Enhanced filtering and sorting
  const filteredAndSortedTemplates = React.useMemo(() => {
    if (!templates) return [];

    let filtered = templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && template.is_active) ||
                           (filterStatus === 'inactive' && !template.is_active);

      const matchesSource = filterSource === 'all' || 
                           (filterSource === 'imported' && template.description?.includes('Imported from')) ||
                           (filterSource === 'manual' && !template.description?.includes('Imported from'));

      return matchesSearch && matchesStatus && matchesSource;
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
  }, [templates, searchTerm, sortBy, filterStatus, filterSource]);

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      deleteTemplateMutation.mutate(templateId);
    }
  };

  const handleEditTasks = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setIsTaskEditorOpen(true);
  };

  const getTemplatesByType = (type: string) => {
    if (type === 'all') return filteredAndSortedTemplates;
    return filteredAndSortedTemplates.filter(template => template.type === type);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSortBy('name');
    setFilterStatus('all');
    setFilterSource('all');
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsHistoryDialogOpen(true)}>
            <History className="h-4 w-4 mr-2" />
            Import History
          </Button>
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import XML
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Enhanced Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
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
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="task_count">Task Count</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSource} onValueChange={(value: any) => setFilterSource(value)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="imported">Imported</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={resetFilters} size="sm">
              Reset
            </Button>
          </div>

          {filteredAndSortedTemplates.length !== templates?.length && (
            <p className="text-sm text-muted-foreground mt-2">
              Showing {filteredAndSortedTemplates.length} of {templates?.length || 0} templates
            </p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Templates ({filteredAndSortedTemplates.length})</TabsTrigger>
          <TabsTrigger value="Listing">Listing ({getTemplatesByType('Listing').length})</TabsTrigger>
          <TabsTrigger value="Buyer">Buyer ({getTemplatesByType('Buyer').length})</TabsTrigger>
          <TabsTrigger value="General">General ({getTemplatesByType('General').length})</TabsTrigger>
        </TabsList>

        {['all', 'Listing', 'Buyer', 'General'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            <div className="grid gap-4">
              {getTemplatesByType(tab).map((template) => {
                const isImported = template.description?.includes('Imported from');
                return (
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
                          {isImported && (
                            <Badge variant="outline">Imported</Badge>
                          )}
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
                );
              })}
              
              {getTemplatesByType(tab).length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">
                      No {tab === 'all' ? '' : tab.toLowerCase()} templates found.
                    </p>
                    {searchTerm || filterStatus !== 'all' || filterSource !== 'all' ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search or filters
                        </p>
                        <Button variant="outline" onClick={resetFilters} size="sm">
                          Clear Filters
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-center">
                        <Button onClick={() => setIsImportDialogOpen(true)}>
                          <Upload className="h-4 w-4 mr-2" />
                          Import XML Templates
                        </Button>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
                          Create Manually
                        </Button>
                      </div>
                    )}
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

      <XMLTemplateImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />

      <ImportHistoryDialog
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
      />
    </div>
  );
};

export default WorkflowTemplateManager;
