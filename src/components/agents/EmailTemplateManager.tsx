
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
  Eye, 
  Send, 
  Mail,
  FileText,
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

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  template_type: string;
  subject: string;
  body_html: string;
  body_text?: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
}

export const EmailTemplateManager = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['enhanced-email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enhanced_email_templates')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as EmailTemplate[];
    }
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: Partial<EmailTemplate>) => {
      const { data, error } = await supabase
        .from('enhanced_email_templates')
        .insert([{
          ...templateData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Template created",
        description: "Email template has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['enhanced-email-templates'] });
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

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, ...templateData }: Partial<EmailTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('enhanced_email_templates')
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
        description: "Email template has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['enhanced-email-templates'] });
      setSelectedTemplate(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to update template",
        description: error.message,
      });
    }
  });

  const getCategoryBadge = (category: string) => {
    const colors = {
      onboarding: 'bg-blue-100 text-blue-800',
      reminders: 'bg-yellow-100 text-yellow-800',
      notifications: 'bg-green-100 text-green-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const renderTemplateForm = (template?: EmailTemplate) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            defaultValue={template?.name}
            placeholder="e.g., Welcome Email"
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select defaultValue={template?.category || 'general'}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="onboarding">Onboarding</SelectItem>
              <SelectItem value="reminders">Reminders</SelectItem>
              <SelectItem value="notifications">Notifications</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="template_type">Template Type</Label>
        <Select defaultValue={template?.template_type || 'agent_welcome'}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="agent_welcome">Agent Welcome</SelectItem>
            <SelectItem value="setup_reminder">Setup Reminder</SelectItem>
            <SelectItem value="account_activated">Account Activated</SelectItem>
            <SelectItem value="password_reset">Password Reset</SelectItem>
            <SelectItem value="account_locked">Account Locked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="subject">Email Subject</Label>
        <Input
          id="subject"
          defaultValue={template?.subject}
          placeholder="e.g., Welcome to Our Team!"
        />
      </div>

      <div>
        <Label htmlFor="body_html">Email Body (HTML)</Label>
        <Textarea
          id="body_html"
          rows={8}
          defaultValue={template?.body_html}
          placeholder="Enter HTML email content..."
        />
      </div>

      <div>
        <Label htmlFor="variables">Available Variables (comma-separated)</Label>
        <Input
          id="variables"
          defaultValue={template?.variables?.join(', ')}
          placeholder="e.g., agent_name, login_url, support_email"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Template Manager</h2>
          <p className="text-gray-600">Manage email templates for agent communications</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create Email Template</DialogTitle>
              <DialogDescription>
                Create a new email template for agent communications
              </DialogDescription>
            </DialogHeader>
            {renderTemplateForm()}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={() => {/* Handle save */}}>
                Create Template
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
                    <p className="text-sm text-gray-600">{template.template_type}</p>
                  </div>
                  <Badge className={getCategoryBadge(template.category)}>
                    {template.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Subject:</p>
                    <p className="text-sm text-gray-600">{template.subject}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Variables:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((variable) => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewMode(true)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
