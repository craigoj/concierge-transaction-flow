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
import { Plus, Edit, Trash2, Eye, Copy, Mail, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import TaskTemplateManager from '@/components/workflows/TaskTemplateManager';
import { logger } from '@/lib/logger';

interface Template {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  category?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  created_by_profile?: {
    first_name?: string;
    last_name?: string;
  };
}

const Templates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
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
      return data as Template[];
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
      logger.error('Error deleting template', error as Error, { templateId: undefined }, 'templates');
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
  }, {} as Record<string, Template[]>) || {};

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
              Templates
            </h1>
            <p className="text-lg font-brand-body text-brand-charcoal/70 max-w-2xl">
              Create and manage professional communication templates with elegance
            </p>
          </div>
        </div>
        <div className="w-24 h-px bg-brand-taupe"></div>
      </div>

      <Tabs defaultValue="email" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border-brand-taupe/30 rounded-xl p-2">
          <TabsTrigger 
            value="email" 
            className="flex items-center gap-2 font-brand-heading tracking-wide data-[state=active]:bg-brand-charcoal data-[state=active]:text-brand-background rounded-lg"
          >
            <Mail className="h-4 w-4" />
            EMAIL TEMPLATES
          </TabsTrigger>
          <TabsTrigger 
            value="tasks" 
            className="flex items-center gap-2 font-brand-heading tracking-wide data-[state=active]:bg-brand-charcoal data-[state=active]:text-brand-background rounded-lg"
          >
            <CheckSquare className="h-4 w-4" />
            TASK TEMPLATES
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-brand-heading font-semibold text-brand-charcoal tracking-wide uppercase">
              Email Templates
            </h2>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-brand-charcoal hover:bg-brand-taupe-dark text-brand-background font-brand-heading tracking-wide px-8 py-4 rounded-xl shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-300 gap-3">
                  <Plus className="h-5 w-5" />
                  CREATE TEMPLATE
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-brand-taupe/30">
                <DialogHeader>
                  <DialogTitle className="font-brand-heading text-brand-charcoal tracking-wide uppercase">Create Email Template</DialogTitle>
                </DialogHeader>
                <TemplateForm onSuccess={() => setCreateDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Template categories sidebar */}
            <div className="lg:col-span-1">
              <Card className="shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.keys(templatesByCategory).map((category) => (
                      <div key={category} className="flex items-center justify-between p-2 rounded-lg hover:bg-brand-taupe/10 transition-colors">
                        <span className="text-sm font-brand-body text-brand-charcoal">{category}</span>
                        <Badge variant="secondary" className="bg-brand-taupe/20 text-brand-charcoal">
                          {templatesByCategory[category].length}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6 shadow-brand-subtle">
                <CardHeader>
                  <CardTitle className="text-lg">Available Variables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm font-brand-body">
                    <div className="p-2 bg-brand-taupe/10 rounded-lg">
                      <code className="text-brand-charcoal">{'{{agent_name}}'}</code> - Agent's full name
                    </div>
                    <div className="p-2 bg-brand-taupe/10 rounded-lg">
                      <code className="text-brand-charcoal">{'{{client_name}}'}</code> - Client's full name
                    </div>
                    <div className="p-2 bg-brand-taupe/10 rounded-lg">
                      <code className="text-brand-charcoal">{'{{property_address}}'}</code> - Property address
                    </div>
                    <div className="p-2 bg-brand-taupe/10 rounded-lg">
                      <code className="text-brand-charcoal">{'{{closing_date}}'}</code> - Closing date
                    </div>
                    <div className="p-2 bg-brand-taupe/10 rounded-lg">
                      <code className="text-brand-charcoal">{'{{purchase_price}}'}</code> - Purchase price
                    </div>
                    <div className="p-2 bg-brand-taupe/10 rounded-lg">
                      <code className="text-brand-charcoal">{'{{transaction_status}}'}</code> - Current status
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Templates grid */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="all" className="space-y-6">
                <TabsList className="bg-white/80 border-brand-taupe/30 rounded-xl">
                  <TabsTrigger value="all" className="font-brand-heading tracking-wide">All Templates</TabsTrigger>
                  {Object.keys(templatesByCategory).map((category) => (
                    <TabsTrigger key={category} value={category} className="font-brand-heading tracking-wide">
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="all">
                  {templates && templates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {templates.map((template) => (
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
                  ) : (
                    <div className="text-center py-20">
                      <div className="max-w-md mx-auto">
                        <div className="w-24 h-24 bg-brand-taupe/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                          <Mail className="h-12 w-12 text-brand-taupe" />
                        </div>
                        <h3 className="text-2xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase mb-4">
                          No Templates Yet
                        </h3>
                        <p className="text-lg font-brand-body text-brand-charcoal/60 mb-8">
                          Create your first template to streamline communications
                        </p>
                        <Button 
                          onClick={() => setCreateDialogOpen(true)}
                          className="bg-brand-charcoal hover:bg-brand-taupe-dark text-brand-background font-brand-heading tracking-wide px-8 py-3 rounded-xl"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          CREATE FIRST TEMPLATE
                        </Button>
                        <div className="w-16 h-px bg-brand-taupe mx-auto mt-8"></div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {Object.keys(templatesByCategory).map((category) => (
                  <TabsContent key={category} value={category}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-brand-taupe/30">
              <DialogHeader>
                <DialogTitle className="font-brand-heading text-brand-charcoal tracking-wide uppercase">Edit Template</DialogTitle>
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
            <DialogContent className="max-w-4xl bg-white/95 backdrop-blur-sm border-brand-taupe/30">
              <DialogHeader>
                <DialogTitle className="font-brand-heading text-brand-charcoal tracking-wide uppercase">Template Preview</DialogTitle>
              </DialogHeader>
              {selectedTemplate && (
                <div className="space-y-6">
                  <div>
                    <Label className="font-brand-heading text-brand-charcoal tracking-wide uppercase">Subject</Label>
                    <div className="p-4 bg-brand-taupe/10 rounded-xl font-brand-body text-brand-charcoal mt-2">
                      {selectedTemplate.subject}
                    </div>
                  </div>
                  <div>
                    <Label className="font-brand-heading text-brand-charcoal tracking-wide uppercase">Content</Label>
                    <div 
                      className="p-6 bg-brand-taupe/10 rounded-xl prose max-w-none font-brand-body text-brand-charcoal mt-2"
                      dangerouslySetInnerHTML={{ __html: selectedTemplate.body_html }}
                    />
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="tasks">
          <TaskTemplateManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface TemplateCardProps {
  template: Template;
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onEdit, onDelete, onPreview }) => {
  return (
    <Card className="hover:shadow-brand-elevation transition-all duration-300 group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-brand-heading text-brand-charcoal tracking-wide">{template.name}</CardTitle>
            <p className="text-sm font-brand-body text-brand-charcoal/70 mt-1">{template.subject}</p>
          </div>
          <Badge variant="outline" className="bg-brand-taupe/20 text-brand-charcoal border-brand-taupe/30 font-brand-heading tracking-wide">
            {template.category || 'Uncategorized'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm font-brand-body text-brand-charcoal/60">
            By {template.created_by_profile?.first_name} {template.created_by_profile?.last_name}
          </span>
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={onPreview} className="hover:bg-brand-taupe/20">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onEdit} className="hover:bg-brand-taupe/20">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="hover:bg-red-100 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface TemplateFormProps {
  template?: Template;
  onSuccess: () => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ template, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    subject: template?.subject || '',
    body_html: template?.body_html || '',
    category: template?.category || ''
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
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
      logger.error('Error saving template', error as Error, { templateId: undefined }, 'templates');
      toast.error('Failed to save template');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label className="font-brand-heading text-brand-charcoal tracking-wide uppercase">Template Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="e.g., Inspection Scheduled Notice"
            required
            className="bg-white/80 border-brand-taupe/30 rounded-xl mt-2"
          />
        </div>
        <div>
          <Label className="font-brand-heading text-brand-charcoal tracking-wide uppercase">Category</Label>
          <Input
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            placeholder="e.g., Notifications"
            className="bg-white/80 border-brand-taupe/30 rounded-xl mt-2"
          />
        </div>
      </div>

      <div>
        <Label className="font-brand-heading text-brand-charcoal tracking-wide uppercase">Subject Line</Label>
        <Input
          value={formData.subject}
          onChange={(e) => setFormData({...formData, subject: e.target.value})}
          placeholder="e.g., Your inspection has been scheduled"
          required
          className="bg-white/80 border-brand-taupe/30 rounded-xl mt-2"
        />
      </div>

      <div>
        <Label className="font-brand-heading text-brand-charcoal tracking-wide uppercase">Email Content (HTML)</Label>
        <Textarea
          value={formData.body_html}
          onChange={(e) => setFormData({...formData, body_html: e.target.value})}
          placeholder="Enter your email template here. Use {{variable_name}} for dynamic content."
          rows={15}
          className="font-mono text-sm bg-white/80 border-brand-taupe/30 rounded-xl mt-2"
          required
        />
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
          {mutation.isPending ? 'Saving...' : (template ? 'Update' : 'Create')} Template
        </Button>
      </div>
    </form>
  );
};

export default Templates;
