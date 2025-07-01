
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  FileText,
  User,
  Settings
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProfileTemplate {
  id: string;
  name: string;
  description: string;
  template_data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    brokerage?: string;
    years_experience?: number;
    specialties?: string[];
    bio?: string;
    [key: string]: any;
  };
  is_active: boolean;
  created_at: string;
  created_by: string;
}

interface TemplateFormData {
  name: string;
  description: string;
  template_data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    brokerage?: string;
    years_experience?: number;
    specialties?: string[];
    bio?: string;
  };
  is_active: boolean;
}

export const AgentProfileTemplateManager = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<ProfileTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    template_data: {},
    is_active: true
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['agent-profile-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_profile_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ProfileTemplate[];
    }
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: TemplateFormData) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('agent_profile_templates')
        .insert([{
          ...templateData,
          created_by: user.user?.id || ''
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Template created",
        description: "Profile template has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['agent-profile-templates'] });
      setIsCreating(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to create template",
        description: error.message,
      });
    }
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, ...templateData }: Partial<ProfileTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('agent_profile_templates')
        .update(templateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Template updated",
        description: "Profile template has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['agent-profile-templates'] });
      setIsEditing(false);
      setSelectedTemplate(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to update template",
        description: error.message,
      });
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agent_profile_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Template deleted",
        description: "Profile template has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['agent-profile-templates'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to delete template",
        description: error.message,
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      template_data: {},
      is_active: true
    });
  };

  const handleEditTemplate = (template: ProfileTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      template_data: template.template_data,
      is_active: template.is_active
    });
    setIsEditing(true);
  };

  const handleSaveTemplate = () => {
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Template name is required.",
      });
      return;
    }

    if (isEditing && selectedTemplate) {
      updateTemplateMutation.mutate({ id: selectedTemplate.id, ...formData });
    } else {
      createTemplateMutation.mutate(formData);
    }
  };

  const updateTemplateData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      template_data: {
        ...prev.template_data,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agent Profile Templates</h2>
          <p className="text-gray-600">Create and manage reusable agent profile templates</p>
        </div>
        <Dialog open={isCreating || isEditing} onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setIsEditing(false);
            setSelectedTemplate(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Edit Profile Template' : 'Create Profile Template'}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update the profile template' : 'Create a new profile template for quick agent setup'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., New Agent Template"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief description of the template"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.template_data.first_name || ''}
                    onChange={(e) => updateTemplateData('first_name', e.target.value)}
                    placeholder="Default first name"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.template_data.last_name || ''}
                    onChange={(e) => updateTemplateData('last_name', e.target.value)}
                    placeholder="Default last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.template_data.email || ''}
                    onChange={(e) => updateTemplateData('email', e.target.value)}
                    placeholder="Default email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={formData.template_data.phone_number || ''}
                    onChange={(e) => updateTemplateData('phone_number', e.target.value)}
                    placeholder="Default phone number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brokerage">Brokerage</Label>
                  <Input
                    id="brokerage"
                    value={formData.template_data.brokerage || ''}
                    onChange={(e) => updateTemplateData('brokerage', e.target.value)}
                    placeholder="Default brokerage"
                  />
                </div>
                <div>
                  <Label htmlFor="years_experience">Years of Experience</Label>
                  <Input
                    id="years_experience"
                    type="number"
                    value={formData.template_data.years_experience || ''}
                    onChange={(e) => updateTemplateData('years_experience', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  value={formData.template_data.bio || ''}
                  onChange={(e) => updateTemplateData('bio', e.target.value)}
                  placeholder="Default bio template"
                />
              </div>

              <div>
                <Label htmlFor="specialties">Specialties (comma-separated)</Label>
                <Input
                  id="specialties"
                  value={formData.template_data.specialties?.join(', ') || ''}
                  onChange={(e) => updateTemplateData('specialties', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                  placeholder="e.g., Residential, Commercial, Luxury"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
                setSelectedTemplate(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate} disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}>
                {(createTemplateMutation.isPending || updateTemplateMutation.isPending) ? 'Saving...' : (isEditing ? 'Update Template' : 'Create Template')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates?.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                  <Badge variant={template.is_active ? "default" : "secondary"}>
                    {template.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Pre-filled Fields:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.keys(template.template_data).filter(key => template.template_data[key]).map((field) => (
                        <Badge key={field} variant="outline" className="text-xs">
                          {field.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setFormData({
                          name: `${template.name} (Copy)`,
                          description: template.description,
                          template_data: template.template_data,
                          is_active: true
                        });
                        setIsCreating(true);
                      }}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Template</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{template.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteTemplateMutation.mutate(template.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {templates?.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Yet</h3>
          <p className="text-gray-600 mb-4">Create your first agent profile template to streamline onboarding</p>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Template
          </Button>
        </div>
      )}
    </div>
  );
};
