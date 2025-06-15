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
          sender:profiles!communications_sender_id_fkey(first_name, last_name),
          recipient:profiles!communications_recipient_id_fkey(first_name, last_name),
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

  const getPersonName = (person: { first_name?: string; last_name?: string } | null) => {
    if (!person) return 'Unknown';
    const firstName = person.first_name || '';
    const lastName = person.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown';
  };

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
              Communications
            </h1>
            <p className="text-lg font-brand-body text-brand-charcoal/70 max-w-2xl">
              Manage all your client communications with professional precision
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-brand-charcoal hover:bg-brand-taupe-dark text-brand-background font-brand-heading tracking-wide px-8 py-4 rounded-xl shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-300 gap-3"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            LOG COMMUNICATION
          </Button>
        </div>
        <div className="w-24 h-px bg-brand-taupe"></div>
      </div>

      {/* Enhanced Filter Bar */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-brand-taupe" />
          <span className="text-sm font-brand-heading font-medium text-brand-charcoal tracking-wide uppercase">Filter by type:</span>
        </div>
        <div className="flex gap-2">
          {['all', 'email', 'phone', 'text', 'meeting'].map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(type)}
              className={`capitalize font-brand-heading tracking-wide ${
                selectedType === type 
                  ? 'bg-brand-charcoal text-brand-background' 
                  : 'bg-white/80 text-brand-charcoal border-brand-taupe/30 hover:bg-brand-taupe/10'
              }`}
            >
              {type === 'all' ? 'All' : type}
            </Button>
          ))}
        </div>
      </div>

      {/* Create Communication Form */}
      {showCreateForm && (
        <Card className="mb-8 shadow-brand-elevation">
          <CardHeader>
            <CardTitle>Log New Communication</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-brand-heading font-medium mb-3 block text-brand-charcoal tracking-wide uppercase">Recipient *</label>
                  <Select 
                    value={newCommunication.recipient_id} 
                    onValueChange={(value) => setNewCommunication(prev => ({ ...prev, recipient_id: value }))}
                  >
                    <SelectTrigger className="bg-white/80 border-brand-taupe/30 rounded-xl">
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.full_name} ({client.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-brand-heading font-medium mb-3 block text-brand-charcoal tracking-wide uppercase">Type *</label>
                  <Select 
                    value={newCommunication.type} 
                    onValueChange={(value: 'email' | 'phone' | 'text' | 'meeting') => 
                      setNewCommunication(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="bg-white/80 border-brand-taupe/30 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="text">Text Message</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-brand-heading font-medium mb-3 block text-brand-charcoal tracking-wide uppercase">Subject</label>
                  <Input
                    value={newCommunication.subject}
                    onChange={(e) => setNewCommunication(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Communication subject"
                    className="bg-white/80 border-brand-taupe/30 rounded-xl"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-brand-heading font-medium mb-3 block text-brand-charcoal tracking-wide uppercase">Related Transaction</label>
                  <Select 
                    value={newCommunication.transaction_id} 
                    onValueChange={(value) => setNewCommunication(prev => ({ ...prev, transaction_id: value }))}
                  >
                    <SelectTrigger className="bg-white/80 border-brand-taupe/30 rounded-xl">
                      <SelectValue placeholder="Select transaction (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
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
                <label className="text-sm font-brand-heading font-medium mb-3 block text-brand-charcoal tracking-wide uppercase">Content *</label>
                <Textarea
                  value={newCommunication.content}
                  onChange={(e) => setNewCommunication(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Communication details, notes, or summary"
                  rows={4}
                  required
                  className="bg-white/80 border-brand-taupe/30 rounded-xl font-brand-body"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-white/80 border-brand-taupe/30 text-brand-charcoal hover:bg-brand-taupe/10 font-brand-heading tracking-wide"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCommunicationMutation.isPending}
                  className="bg-brand-charcoal hover:bg-brand-taupe-dark text-brand-background font-brand-heading tracking-wide gap-2"
                >
                  <Send className="h-4 w-4" />
                  {createCommunicationMutation.isPending ? 'Logging...' : 'Log Communication'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Communications List */}
      <div className="space-y-6">
        {communications?.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-brand-taupe/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <MessageSquare className="h-12 w-12 text-brand-taupe" />
              </div>
              <h3 className="text-2xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase mb-4">
                No Communications Yet
              </h3>
              <p className="text-lg font-brand-body text-brand-charcoal/60 mb-8">
                Start logging your client communications to maintain professional excellence
              </p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-brand-charcoal hover:bg-brand-taupe-dark text-brand-background font-brand-heading tracking-wide px-8 py-3 rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                LOG FIRST COMMUNICATION
              </Button>
              <div className="w-16 h-px bg-brand-taupe mx-auto mt-8"></div>
            </div>
          </div>
        ) : (
          communications?.map((comm) => (
            <Card key={comm.id} className="hover:shadow-brand-elevation transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <Badge className={`${getTypeColor(comm.type)} flex items-center gap-2 font-brand-heading tracking-wide px-3 py-1`}>
                        {getTypeIcon(comm.type)}
                        {comm.type.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-brand-body text-brand-charcoal/60">
                        {new Date(comm.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    {comm.subject && (
                      <h3 className="font-brand-heading font-semibold text-xl mb-3 text-brand-charcoal tracking-wide">
                        {comm.subject}
                      </h3>
                    )}
                    
                    <div className="flex items-center gap-6 text-sm font-brand-body text-brand-charcoal/70 mb-4">
                      <span>
                        <strong>From:</strong> {getPersonName(comm.sender)}
                      </span>
                      <span>
                        <strong>To:</strong> {getPersonName(comm.recipient)}
                      </span>
                      {comm.transactions && (
                        <span>
                          <strong>Re:</strong> {comm.transactions.property_address}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-brand-charcoal font-brand-body whitespace-pre-wrap leading-relaxed">
                      {comm.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Communications;
