import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Mail, Phone, Calendar, Plus, Filter } from 'lucide-react';
import { toast } from 'sonner';
import AppHeader from '@/components/AppHeader';
import Breadcrumb from '@/components/navigation/Breadcrumb';

const Communications = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [newCommunication, setNewCommunication] = useState({
    recipient_id: '',
    type: 'email' as 'email' | 'phone' | 'text' | 'meeting',
    subject: '',
    content: '',
    transaction_id: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  // Fetch communications with proper relationship hints
  const { data: communications, isLoading } = useQuery({
    queryKey: ['communications', selectedType],
    queryFn: async () => {
      let query = supabase
        .from('communications')
        .select(`
          *,
          sender:profiles!communications_sender_id_fkey(full_name),
          recipient:profiles!communications_recipient_id_fkey(full_name),
          transactions(property_address, status)
        `)
        .order('created_at', { ascending: false });

      if (selectedType !== 'all') {
        query = query.eq('type', selectedType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Fetch clients for recipient selection
  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, full_name, email')
        .order('full_name');
      if (error) throw error;
      return data;
    }
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

  // Create communication mutation
  const createCommunicationMutation = useMutation({
    mutationFn: async (data: typeof newCommunication) => {
      const { error } = await supabase
        .from('communications')
        .insert({
          ...data,
          sender_id: (await supabase.auth.getUser()).data.user?.id
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Communication logged successfully');
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      setNewCommunication({
        recipient_id: '',
        type: 'email',
        subject: '',
        content: '',
        transaction_id: ''
      });
      setShowCreateForm(false);
    },
    onError: (error) => {
      console.error('Error creating communication:', error);
      toast.error('Failed to log communication');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCommunication.recipient_id || !newCommunication.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    createCommunicationMutation.mutate(newCommunication);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'text': return <MessageSquare className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'phone': return 'bg-green-100 text-green-800';
      case 'text': return 'bg-purple-100 text-purple-800';
      case 'meeting': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <AppHeader />
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <AppHeader />
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Dashboard', href: '/' },
              { label: 'Communications', isCurrentPage: true }
            ]}
          />
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Communications</h1>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Log Communication
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by type:</span>
          </div>
          <div className="flex gap-2">
            {['all', 'email', 'phone', 'text', 'meeting'].map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type)}
                className="capitalize"
              >
                {type === 'all' ? 'All' : type}
              </Button>
            ))}
          </div>
        </div>

        {/* Create Communication Form */}
        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Log New Communication</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Recipient *</label>
                    <Select 
                      value={newCommunication.recipient_id} 
                      onValueChange={(value) => setNewCommunication(prev => ({ ...prev, recipient_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipient" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.full_name} ({client.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Type *</label>
                    <Select 
                      value={newCommunication.type} 
                      onValueChange={(value: 'email' | 'phone' | 'text' | 'meeting') => 
                        setNewCommunication(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="text">Text Message</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <Input
                      value={newCommunication.subject}
                      onChange={(e) => setNewCommunication(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Communication subject"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Related Transaction</label>
                    <Select 
                      value={newCommunication.transaction_id} 
                      onValueChange={(value) => setNewCommunication(prev => ({ ...prev, transaction_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select transaction (optional)" />
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
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Content *</label>
                  <Textarea
                    value={newCommunication.content}
                    onChange={(e) => setNewCommunication(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Communication details, notes, or summary"
                    rows={4}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createCommunicationMutation.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {createCommunicationMutation.isPending ? 'Logging...' : 'Log Communication'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Communications List */}
        <div className="space-y-4">
          {communications?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Communications Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start logging your client communications to keep track of all interactions.
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log First Communication
                </Button>
              </CardContent>
            </Card>
          ) : (
            communications?.map((comm) => (
              <Card key={comm.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={`${getTypeColor(comm.type)} flex items-center gap-1`}>
                          {getTypeIcon(comm.type)}
                          {comm.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(comm.created_at).toLocaleString()}
                        </span>
                      </div>
                      
                      {comm.subject && (
                        <h3 className="font-semibold text-lg mb-2">{comm.subject}</h3>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span>
                          From: {comm.sender?.full_name || 'Unknown'}
                        </span>
                        <span>
                          To: {comm.recipient?.full_name || 'Unknown'}
                        </span>
                        {comm.transactions && (
                          <span>
                            Re: {comm.transactions.property_address}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-700 whitespace-pre-wrap">{comm.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Communications;
