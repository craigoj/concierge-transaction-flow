
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CreateTemplateFormData, TemplateError } from '@/types/templates';

interface CreateWorkflowTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateWorkflowTemplateDialog = ({ open, onOpenChange }: CreateWorkflowTemplateDialogProps) => {
  const [formData, setFormData] = useState<CreateTemplateFormData>({
    name: '',
    type: 'Listing',
    description: '',
  });
  const queryClient = useQueryClient();

  const createTemplateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: template, error } = await supabase
        .from('workflow_templates')
        .insert({
          name: data.name,
          type: data.type as 'Listing' | 'Buyer' | 'General',
          description: data.description,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-templates'] });
      toast.success('Template created successfully');
      onOpenChange(false);
      setFormData({ name: '', type: 'Listing', description: '' });
    },
    onError: (error: TemplateError) => {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type) {
      toast.error('Please fill in all required fields');
      return;
    }
    createTemplateMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Workflow Template</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Core Listing Launch"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Transaction Type *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select template type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Listing">Listing</SelectItem>
                <SelectItem value="Buyer">Buyer</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe when to use this template..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTemplateMutation.isPending}>
              {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkflowTemplateDialog;
