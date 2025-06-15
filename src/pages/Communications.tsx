
import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Send, Mail, Phone, User, Filter, Search, Plus } from 'lucide-react';
import { toast } from 'sonner';
import AppHeader from '@/components/AppHeader';

const Communications = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch communications with explicit column aliases to avoid ambiguity
  const { data: communications, isLoading } = useQuery({
    queryKey: ['communications', selectedFilter, searchTerm],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communications')
        .select(`
          *,
          sender_profile:sender_id(first_name, last_name),
          recipient_profile:recipient_id(first_name, last_name),
          transaction:transaction_id(property_address)
        `)
        .order('sent_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch contacts for compose dialog
  const { data: contacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('full_name');
      if (error) throw error;
      return data;
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: {
      recipient_id: string;
      subject?: string;
      content: string;
      type: string;
      transaction_id?: string;
    }) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('communications')
        .insert({
          ...messageData,
          sender_id: user.data.user.id,
          status: 'sent'
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      toast.success('Message sent successfully');
      setComposeOpen(false);
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  });

  const filteredCommunications = communications?.filter(comm => {
    const matchesFilter = selectedFilter === 'all' || comm.type === selectedFilter;
    const matchesSearch = !searchTerm || 
      comm.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <AppHeader />
        <div className="container mx-auto p-6">
          <div className="text-center">Loading communications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <AppHeader />
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Communications</h1>
          </div>
          <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Compose Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Compose Message</DialogTitle>
              </DialogHeader>
              <ComposeForm 
                contacts={contacts || []}
                onSend={(data) => sendMessageMutation.mutate(data)}
                isLoading={sendMessageMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Message Type</Label>
                  <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Messages</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="internal">Internal Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Messages:</span>
                    <span className="font-medium">{communications?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>This Week:</span>
                    <span className="font-medium">
                      {communications?.filter(c => 
                        new Date(c.sent_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      ).length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Messages list */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {filteredCommunications?.map((communication) => (
                <Card key={communication.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          {communication.type === 'email' && <Mail className="h-4 w-4 text-primary" />}
                          {communication.type === 'sms' && <MessageSquare className="h-4 w-4 text-primary" />}
                          {communication.type === 'call' && <Phone className="h-4 w-4 text-primary" />}
                          {communication.type === 'internal' && <User className="h-4 w-4 text-primary" />}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              From: {communication.sender_profile?.first_name} {communication.sender_profile?.last_name}
                            </span>
                            <Badge variant="outline">{communication.type}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            To: {communication.recipient_profile?.first_name} {communication.recipient_profile?.last_name}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(communication.sent_at).toLocaleDateString()}
                      </div>
                    </div>

                    {communication.subject && (
                      <h3 className="font-semibold mb-2">{communication.subject}</h3>
                    )}
                    
                    <div className="text-sm text-muted-foreground mb-3 line-clamp-3">
                      {communication.content}
                    </div>

                    {communication.transaction && (
                      <div className="text-xs text-muted-foreground">
                        Related to: {communication.transaction.property_address}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {filteredCommunications?.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No communications found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || selectedFilter !== 'all' 
                      ? 'Try adjusting your search or filters' 
                      : 'Start a conversation with your clients'
                    }
                  </p>
                  <Button onClick={() => setComposeOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ComposeFormProps {
  contacts: any[];
  onSend: (data: any) => void;
  isLoading: boolean;
}

const ComposeForm: React.FC<ComposeFormProps> = ({ contacts, onSend, isLoading }) => {
  const [formData, setFormData] = useState({
    recipient_id: '',
    subject: '',
    content: '',
    type: 'email'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipient_id || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSend(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Recipient</Label>
          <Select value={formData.recipient_id} onValueChange={(value) => setFormData({...formData, recipient_id: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select recipient" />
            </SelectTrigger>
            <SelectContent>
              {contacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="internal">Internal Note</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Subject</Label>
        <Input
          value={formData.subject}
          onChange={(e) => setFormData({...formData, subject: e.target.value})}
          placeholder="Message subject"
        />
      </div>

      <div>
        <Label>Message</Label>
        <Textarea
          value={formData.content}
          onChange={(e) => setFormData({...formData, content: e.target.value})}
          placeholder="Type your message here..."
          rows={6}
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Message'}
        </Button>
      </div>
    </form>
  );
};

export default Communications;
