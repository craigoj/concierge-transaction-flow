
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, FileTemplate } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TransactionTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  template_data: any;
  created_at: string;
  is_active: boolean;
}

export const TransactionTemplateManager = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TransactionTemplate | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['transaction-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transaction_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TransactionTemplate[];
    }
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: Partial<TransactionTemplate>) => {
      const { data, error } = await supabase
        .from('transaction_templates')
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
      toast({ title: "Template created successfully" });
      queryClient.invalidateQueries({ queryKey: ['transaction-templates'] });
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
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
        .from('transaction_templates')
        .update({ is_active: false })
        .eq('id', templateId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Template deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['transaction-templates'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete template",
        description: error.message,
      });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-brand-heading text-brand-charcoal">Transaction Templates</h2>
          <p className="text-brand-charcoal/60">Create and manage reusable transaction templates</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-charcoal hover:bg-brand-taupe-dark">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Transaction Template</DialogTitle>
            </DialogHeader>
            <CreateTemplateForm 
              onSubmit={(data) => createTemplateMutation.mutate(data)}
              isLoading={createTemplateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates?.map((template) => (
            <Card key={template.id} className="hover:shadow-brand-elevation transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {template.category}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTemplate(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTemplateMutation.mutate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-brand-charcoal/60">
                  {template.description || 'No description provided'}
                </p>
                <div className="mt-4 flex justify-between items-center text-xs text-brand-charcoal/50">
                  <span>Created {new Date(template.created_at).toLocaleDateString()}</span>
                  <FileTemplate className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

interface CreateTemplateFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
  initialData?: Partial<TransactionTemplate>;
}

const CreateTemplateForm = ({ onSubmit, isLoading, initialData }: CreateTemplateFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || 'residential',
    template_data: initialData?.template_data || {
      default_service_tier: 'buyer_core',
      default_transaction_type: 'purchase',
      auto_assign_workflows: [],
      default_client_type: 'buyer'
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Template Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Standard Buyer Transaction"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <Select 
          value={formData.category} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="residential">Residential</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
            <SelectItem value="rental">Rental</SelectItem>
            <SelectItem value="investment">Investment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe when to use this template..."
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Default Service Tier</label>
        <Select 
          value={formData.template_data.default_service_tier}
          onValueChange={(value) => setFormData(prev => ({
            ...prev,
            template_data: { ...prev.template_data, default_service_tier: value }
          }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buyer_core">Buyer Core</SelectItem>
            <SelectItem value="buyer_elite">Buyer Elite</SelectItem>
            <SelectItem value="white_glove_buyer">White Glove Buyer</SelectItem>
            <SelectItem value="listing_core">Listing Core</SelectItem>
            <SelectItem value="listing_elite">Listing Elite</SelectItem>
            <SelectItem value="white_glove_listing">White Glove Listing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Default Transaction Type</label>
        <Select 
          value={formData.template_data.default_transaction_type}
          onValueChange={(value) => setFormData(prev => ({
            ...prev,
            template_data: { ...prev.template_data, default_transaction_type: value }
          }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="purchase">Purchase</SelectItem>
            <SelectItem value="listing">Listing</SelectItem>
            <SelectItem value="rental">Rental</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
};
