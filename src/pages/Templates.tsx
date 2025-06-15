
import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Eye, Copy } from 'lucide-react';
import { toast } from 'sonner';

const Templates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select(`
          *,
          created_by_profile:created_by(first_name, last_name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Template deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  });

  const handleDelete = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteMutation.mutate(templateId);
    }
  };

  const templatesByCategory = templates?.reduce((acc, template) => {
    const category = template.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, any[]>) || {};

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Email Templates</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Email Template</DialogTitle>
            </DialogHeader>
            <TemplateForm onSuccess={() => setCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template categories sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.keys(templatesByCategory).map((category) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm">{category}</span>
                    <Badge variant="secondary">{templatesByCategory[category].length}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Available Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><code>{'{{agent_name}}'}</code> - Agent's full name</div>
                <div><code>{'{{client_name}}'}</code> - Client's full name</div>
                <div><code>{'{{property_address}}'}</code> - Property address</div>
                <div><code>{'{{closing_date}}'}</code> - Closing date</div>
                <div><code>{'{{purchase_price}}'}</code> - Purchase price</div>
                <div><code>{'{{transaction_status}}'}</code> - Current status</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Templates grid */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Templates</TabsTrigger>
              {Object.keys(templatesByCategory).map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates?.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onEdit={() => {
                      setSelectedTemplate(template);
                      setEditDialogOpen(true);
                    }}
                    onDelete={() => handleDelete(template.id)}
                    onPreview={() => {
                      setSelectedTemplate(template);
                      setPreviewDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            </TabsContent>

            {Object.keys(templatesByCategory).map((category) => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templatesByCategory[category].map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onEdit={() => {
                        setSelectedTemplate(template);
                        setEditDialogOpen(true);
                      }}
                      onDelete={() => handleDelete(template.id)}
                      onPreview={() => {
                        setSelectedTemplate(template);
                        setPreviewDialogOpen(true);
                      }}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <TemplateForm
              template={selectedTemplate}
              onSuccess={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <Label>Subject</Label>
                <div className="p-2 bg-muted rounded">{selectedTemplate.subject}</div>
              </div>
              <div>
                <Label>Content</Label>
                <div 
                  className="p-4 bg-muted rounded prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedTemplate.body_html }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const TemplateCard = ({ template, onEdit, onDelete, onPreview }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{template.subject}</p>
          </div>
          <Badge variant="outline">{template.category || 'Uncategorized'}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            By {template.created_by_profile?.first_name} {template.created_by_profile?.last_name}
          </span>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={onPreview}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TemplateForm = ({ template, onSuccess }: { template?: any; onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    subject: template?.subject || '',
    body_html: template?.body_html || '',
    category: template?.category || ''
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data) => {
      const user = await supabase.auth.getUser();
      
      if (template) {
        // Update existing template
        const { error } = await supabase
          .from('email_templates')
          .update(data)
          .eq('id', template.id);
        if (error) throw error;
      } else {
        // Create new template
        const { error } = await supabase
          .from('email_templates')
          .insert({
            ...data,
            created_by: user.data.user?.id
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success(template ? 'Template updated successfully' : 'Template created successfully');
      onSuccess();
    },
    onError: (error) => {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Template Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="e.g., Inspection Scheduled Notice"
            required
          />
        </div>
        <div>
          <Label>Category</Label>
          <Input
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            placeholder="e.g., Notifications"
          />
        </div>
      </div>

      <div>
        <Label>Subject Line</Label>
        <Input
          value={formData.subject}
          onChange={(e) => setFormData({...formData, subject: e.target.value})}
          placeholder="e.g., Your inspection has been scheduled"
          required
        />
      </div>

      <div>
        <Label>Email Content (HTML)</Label>
        <Textarea
          value={formData.body_html}
          onChange={(e) => setFormData({...formData, body_html: e.target.value})}
          placeholder="Enter your email template here. Use {{variable_name}} for dynamic content."
          rows={15}
          className="font-mono text-sm"
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : (template ? 'Update' : 'Create')} Template
        </Button>
      </div>
    </form>
  );
};

export default Templates;
