
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
import { ArrowLeft, UserPlus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import AppHeader from '@/components/AppHeader';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { logger } from '@/lib/logger';

const CreateClient = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    job_title: '',
    company: '',
    
    // Contact Information
    email: '',
    phone: '',
    website: '',
    
    // Address Information
    home_address_line1: '',
    home_address_line2: '',
    work_address_line1: '',
    work_address_line2: '',
    
    // Client Specific Fields
    type: 'buyer' as 'buyer' | 'seller',
    preferred_contact_method: 'email',
    referral_source: '',
    brokerage: '',
    category: '',
    notes: '',
    transaction_id: '',
    
    // Relationship & Rating
    rating: 'A' as 'A' | 'B' | 'C' | 'D',
    auto_prospect: false
  });

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    }
  });

  // Fetch transactions for linking
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
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
    mutationFn: async (clientData: any) => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      // Create contact in contacts table (for CRM functionality)
      const contactData = {
        full_name: `${clientData.first_name} ${clientData.last_name}`.trim(),
        email: clientData.email || null,
        phone: clientData.phone || null,
        company: clientData.company || null,
        category: clientData.category || null,
        rating: clientData.rating,
        auto_prospect: clientData.auto_prospect,
        user_id: currentUser.id
      };

      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .insert(contactData)
        .select()
        .single();
      
      if (contactError) throw contactError;

      // Only create client record if transaction is selected
      if (clientData.transaction_id) {
        const clientPayload = {
          full_name: `${clientData.first_name} ${clientData.last_name}`.trim(),
          email: clientData.email || null,
          phone: clientData.phone || null,
          address: clientData.home_address_line1 || null,
          type: clientData.type,
          preferred_contact_method: clientData.preferred_contact_method,
          referral_source: clientData.referral_source || null,
          notes: clientData.notes || null,
          transaction_id: clientData.transaction_id
        };

        const { error: clientError } = await supabase
          .from('clients')
          .insert(clientPayload);
        
        if (clientError) throw clientError;
      }
      
      return contact;
    },
    onSuccess: () => {
      toast.success('Contact created successfully');
      navigate('/clients');
    },
    onError: (error: any) => {
      logger.error('Error creating contact', error as Error, { formData }, 'clients');
      toast.error(`Failed to create contact: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name) {
      toast.error('Please fill in the required fields (First Name and Last Name)');
      return;
    }

    createClientMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const noTransactionsAvailable = !transactionsLoading && (!transactions || transactions.length === 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <AppHeader />
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Dashboard', href: '/' },
              { label: 'Clients', href: '/clients' },
              { label: 'Create Contact', isCurrentPage: true }
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
            <h1 className="text-3xl font-bold">Create Contact</h1>
          </div>
        </div>

        {noTransactionsAvailable && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No transactions found. You can still create a contact, but you won't be able to link it to a transaction until you create one.
            </AlertDescription>
          </Alert>
        )}

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>New Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Contact Information Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    👤 Contact Information
                  </h3>
                  
                  {/* First Row of Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Mr./Ms./Dr."
                      />
                    </div>
                    <div>
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        placeholder="First name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="middle_name">Middle Name</Label>
                      <Input
                        id="middle_name"
                        value={formData.middle_name}
                        onChange={(e) => handleInputChange('middle_name', e.target.value)}
                        placeholder="Middle name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        placeholder="Last name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="job_title">Job Title</Label>
                      <Input
                        id="job_title"
                        value={formData.job_title}
                        onChange={(e) => handleInputChange('job_title', e.target.value)}
                        placeholder="Position"
                      />
                    </div>
                  </div>

                  {/* Second Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        placeholder="Company name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="brokerage">Brokerage</Label>
                      <Input
                        id="brokerage"
                        value={formData.brokerage}
                        onChange={(e) => handleInputChange('brokerage', e.target.value)}
                        placeholder="Real estate brokerage"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://website.com"
                      />
                    </div>
                  </div>

                  {/* Contact Methods */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>
                </div>

                {/* Categories & Rating Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    🏷️ Categories & Rating
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        placeholder="Lead source, type, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="rating">Relationship Rating</Label>
                      <Select 
                        value={formData.rating} 
                        onValueChange={(value) => handleInputChange('rating', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A - Excellent</SelectItem>
                          <SelectItem value="B">B - Good</SelectItem>
                          <SelectItem value="C">C - Fair</SelectItem>
                          <SelectItem value="D">D - Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="type">Client Type</Label>
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
                </div>

                {/* Mailing Addresses Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    🏠 Mailing Addresses (Optional)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Home Address</Label>
                      <div className="space-y-3">
                        <Input
                          value={formData.home_address_line1}
                          onChange={(e) => handleInputChange('home_address_line1', e.target.value)}
                          placeholder="Line 1"
                        />
                        <Input
                          value={formData.home_address_line2}
                          onChange={(e) => handleInputChange('home_address_line2', e.target.value)}
                          placeholder="Line 2"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Work Address</Label>
                      <div className="space-y-3">
                        <Input
                          value={formData.work_address_line1}
                          onChange={(e) => handleInputChange('work_address_line1', e.target.value)}
                          placeholder="Line 1"
                        />
                        <Input
                          value={formData.work_address_line2}
                          onChange={(e) => handleInputChange('work_address_line2', e.target.value)}
                          placeholder="Line 2"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Link Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    🏢 Transaction Link (Optional)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="transaction_id">Associated Transaction</Label>
                      <Select 
                        value={formData.transaction_id} 
                        onValueChange={(value) => handleInputChange('transaction_id', value)}
                        disabled={noTransactionsAvailable}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            noTransactionsAvailable 
                              ? "No transactions available" 
                              : "Select a transaction (optional)"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {transactions?.map((transaction) => (
                            <SelectItem key={transaction.id} value={transaction.id}>
                              {transaction.property_address} ({transaction.status})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {noTransactionsAvailable && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Create a transaction first to link it to this contact
                        </p>
                      )}
                    </div>
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
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="referral_source">Referral Source</Label>
                    <Input
                      id="referral_source"
                      value={formData.referral_source}
                      onChange={(e) => handleInputChange('referral_source', e.target.value)}
                      placeholder="How did they find you?"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional notes about the contact..."
                    rows={4}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
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
                    className="bg-primary hover:bg-primary/90"
                  >
                    {createClientMutation.isPending ? 'Creating...' : 'Create Contact'}
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
