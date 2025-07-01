
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Copy, Trash2, User, Building, Phone, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AgentProfileTemplate {
  id: string;
  name: string;
  description?: string;
  template_data: {
    brokerage?: string;
    phone_number?: string;
    specialties?: string[];
    years_experience?: number;
    license_number?: string;
    bio?: string;
    default_vendor_preferences?: Record<string, any>;
  };
  is_active: boolean;
  created_at: string;
}

export const AgentProfileTemplateManager = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<AgentProfileTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['agent-profile-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_profile_templates')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as AgentProfileTemplate[];
    }
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: {
      name: string;
      description: string;
      brokerage: string;
      phone_number: string;
      specialties: string;
      years_experience: string;
      license_number: string;
      bio: string;
    }) => {
      const { data, error } = await supabase
        .from('agent_profile_templates')
        .insert([{
          name: templateData.name,
          description: templateData.description,
          template_data: {
            brokerage: templateData.brokerage || undefined,
            phone_number: templateData.phone_number || undefined,
            specialties: templateData.specialties ? templateData.specialties.split(',').map(s => s.trim()) : [],
            years_experience: templateData.years_experience ? parseInt(templateData.years_experience) : undefined,
            license_number: templateData.license_number || undefined,
            bio: templateData.bio || undefined,
          },
          created_by: (await supabase.auth.getUser()).data.user?.id,
          is_active: true
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Template created",
        description: "Agent profile template has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['agent-profile-templates'] });
      setIsCreating(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to create template",
        description: error.message,
      });
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('agent_profile_templates')
        .delete()
        .eq('id', templateId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Template deleted",
        description: "Agent profile template has been deleted successfully.",
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

  const handleCreateTemplate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const templateData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      brokerage: formData.get('brokerage') as string,
      phone_number: formData.get('phone_number') as string,
      specialties: formData.get('specialties') as string,
      years_experience: formData.get('years_experience') as string,
      license_number: formData.get('license_number') as string,
      bio: formData.get('bio') as string,
    };
    
    createTemplateMutation.mutate(templateData);
  };

  const renderTemplateCard = (template: AgentProfileTemplate) => (
    <Card key={template.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{template.name}</CardTitle>
            {template.description && (
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {template.template_data.brokerage && (
            <div className="flex items-center text-sm">
              <Building className="h-4 w-4 mr-2 text-gray-400" />
              <span>{template.template_data.brokerage}</span>
            </div>
          )}
          
          {template.template_data.phone_number && (
            <div className="flex items-center text-sm">
              <Phone className="h-4 w-4 mr-2 text-gray-400" />
              <span>{template.template_data.phone_number}</span>
            </div>
          )}

          {template.template_data.specialties && template.template_data.specialties.length > 0 && (
            <div className="flex items-start text-sm">
              <User className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {template.template_data.specialties.map((specialty, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          {template.template_data.years_experience && (
            <div className="text-sm text-gray-600">
              Experience: {template.template_data.years_experience} years
            </div>
          )}

          <div className="flex space-x-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {/* Apply template logic */}}
            >
              <Copy className="h-4 w-4 mr-1" />
              Apply
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedTemplate(template)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => deleteTemplateMutation.mutate(template.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agent Profile Templates</h2>
          <p className="text-gray-600">Create templates for quick agent setup</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Agent Profile Template</DialogTitle>
              <DialogDescription>
                Create a template to quickly set up new agent profiles
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Residential Agent"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="brokerage">Default Brokerage</Label>
                  <Input
                    id="brokerage"
                    name="brokerage"
                    placeholder="e.g., ABC Realty"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Brief description of this template..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone_number">Default Phone Format</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    placeholder="e.g., (555) 000-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="years_experience">Default Experience (years)</Label>
                  <Input
                    id="years_experience"
                    name="years_experience"
                    type="number"
                    placeholder="e.g., 5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="specialties">Default Specialties (comma-separated)</Label>
                <Input
                  id="specialties"
                  name="specialties"
                  placeholder="e.g., Residential, First-time Buyers, Luxury Homes"
                />
              </div>

              <div>
                <Label htmlFor="license_number">License Number Format</Label>
                <Input
                  id="license_number"
                  name="license_number"
                  placeholder="e.g., RE-000000"
                />
              </div>

              <div>
                <Label htmlFor="bio">Default Bio Template</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Default biography template..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTemplateMutation.isPending}>
                  Create Template
                </Button>
              </div>
            </form>
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
          {templates?.map(renderTemplateCard)}
        </div>
      )}
    </div>
  );
};
