
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import AppHeader from '@/components/AppHeader';
import Breadcrumb from '@/components/navigation/Breadcrumb';

const CreateClient = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    type: 'buyer' as 'buyer' | 'seller',
    preferred_contact_method: 'email',
    referral_source: '',
    notes: '',
    transaction_id: ''
  });

  // Fetch transactions for linking
  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, property_address, status')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (clientData: typeof formData) => {
      const { error } = await supabase
        .from('clients')
        .insert(clientData);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Client created successfully');
      navigate('/clients');
    },
    onError: (error) => {
      console.error('Error creating client:', error);
      toast.error('Failed to create client');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.transaction_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    createClientMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <AppHeader />
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Dashboard', href: '/' },
              { label: 'Clients', href: '/clients' },
              { label: 'Add Client', isCurrentPage: true }
            ]}
          />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/clients')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <UserPlus className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Add New Client</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      placeholder="Enter client's full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Client Type *</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => handleInputChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buyer">Buyer</SelectItem>
                        <SelectItem value="seller">Seller</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="client@example.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Client's current address"
                  />
                </div>

                {/* Preferences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferred_contact_method">Preferred Contact Method</Label>
                    <Select 
                      value={formData.preferred_contact_method} 
                      onValueChange={(value) => handleInputChange('preferred_contact_method', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="text">Text Message</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="referral_source">Referral Source</Label>
                    <Input
                      id="referral_source"
                      value={formData.referral_source}
                      onChange={(e) => handleInputChange('referral_source', e.target.value)}
                      placeholder="How did they find you?"
                    />
                  </div>
                </div>

                {/* Transaction Association */}
                <div>
                  <Label htmlFor="transaction_id">Associated Transaction *</Label>
                  <Select 
                    value={formData.transaction_id} 
                    onValueChange={(value) => handleInputChange('transaction_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a transaction" />
                    </SelectTrigger>
                    <SelectContent>
                      {transactions?.map((transaction) => (
                        <SelectItem key={transaction.id} value={transaction.id}>
                          {transaction.property_address} ({transaction.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional notes about the client..."
                    rows={4}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-6">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate('/clients')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createClientMutation.isPending}
                  >
                    {createClientMutation.isPending ? 'Creating...' : 'Create Client'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateClient;
