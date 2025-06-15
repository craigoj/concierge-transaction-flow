
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, MessageSquare, Send, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

const Communications = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommunication, setSelectedCommunication] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch communications
  const { data: communications, isLoading } = useQuery({
    queryKey: ['communications', selectedFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('communications')
        .select(`
          *,
          sender:sender_id(first_name, last_name, email),
          recipient:recipient_id(first_name, last_name, email),
          transaction:transaction_id(property_address)
        `)
        .order('created_at', { ascending: false });

      if (selectedFilter !== 'all') {
        query = query.eq('type', selectedFilter);
      }

      if (searchTerm) {
        query = query.or(`content.ilike.%${searchTerm}%,subject.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Real-time subscription for new communications
  useEffect(() => {
    const channel = supabase
      .channel('communications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'communications'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['communications'] });
          toast.success('New message received');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleSendReply = async () => {
    if (!selectedCommunication || !replyContent.trim()) return;

    try {
      const { error } = await supabase
        .from('communications')
        .insert({
          transaction_id: selectedCommunication.transaction_id,
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          recipient_id: selectedCommunication.sender_id,
          subject: `Re: ${selectedCommunication.subject || 'Message'}`,
          content: replyContent,
          type: selectedCommunication.type
        });

      if (error) throw error;

      setReplyContent('');
      toast.success('Reply sent successfully');
      queryClient.invalidateQueries({ queryKey: ['communications'] });
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    }
  };

  const markAsRead = async (communicationId: string) => {
    try {
      const { error } = await supabase
        .from('communications')
        .update({ status: 'read' })
        .eq('id', communicationId);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['communications'] });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading communications...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Communications</h1>
        <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Compose
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Compose Message</DialogTitle>
            </DialogHeader>
            <ComposeMessageForm onSuccess={() => setComposeOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar with filters and message list */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Filter by type</Label>
                <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Messages</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="portal_message">Portal Messages</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Message List */}
          <div className="space-y-2">
            {communications?.map((comm) => (
              <Card
                key={comm.id}
                className={`cursor-pointer transition-colors ${
                  selectedCommunication?.id === comm.id ? 'ring-2 ring-primary' : ''
                } ${comm.status === 'read' ? 'opacity-75' : ''}`}
                onClick={() => {
                  setSelectedCommunication(comm);
                  if (comm.status !== 'read') {
                    markAsRead(comm.id);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {comm.type === 'email' ? (
                          <Mail className="h-4 w-4" />
                        ) : (
                          <MessageSquare className="h-4 w-4" />
                        )}
                        <Badge variant={comm.status === 'read' ? 'secondary' : 'default'}>
                          {comm.status}
                        </Badge>
                      </div>
                      <p className="font-medium text-sm truncate">
                        {comm.sender?.first_name} {comm.sender?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {comm.subject || 'No subject'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {comm.transaction?.property_address}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comm.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main content area */}
        <div className="lg:col-span-2">
          {selectedCommunication ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedCommunication.subject || 'No subject'}</span>
                  <Badge variant="outline">{selectedCommunication.type}</Badge>
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  From: {selectedCommunication.sender?.first_name} {selectedCommunication.sender?.last_name} &lt;{selectedCommunication.sender?.email}&gt;
                  <br />
                  To: {selectedCommunication.recipient?.first_name} {selectedCommunication.recipient?.last_name} &lt;{selectedCommunication.recipient?.email}&gt;
                  <br />
                  Date: {new Date(selectedCommunication.created_at).toLocaleString()}
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none mb-6">
                  <div dangerouslySetInnerHTML={{ __html: selectedCommunication.content }} />
                </div>
                
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium">Reply</Label>
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="mt-2"
                    rows={4}
                  />
                  <Button 
                    onClick={handleSendReply} 
                    className="mt-2"
                    disabled={!replyContent.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a message to view its content</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const ComposeMessageForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    recipient_id: '',
    transaction_id: '',
    subject: '',
    content: '',
    type: 'portal_message'
  });

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .neq('id', (await supabase.auth.getUser()).data.user?.id);
      if (error) throw error;
      return data;
    }
  });

  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, property_address')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('communications')
        .insert({
          ...formData,
          sender_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast.success('Message sent successfully');
      onSuccess();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Recipient</Label>
        <Select value={formData.recipient_id} onValueChange={(value) => setFormData({...formData, recipient_id: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select recipient" />
          </SelectTrigger>
          <SelectContent>
            {profiles?.map((profile) => (
              <SelectItem key={profile.id} value={profile.id}>
                {profile.first_name} {profile.last_name} ({profile.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Transaction (Optional)</Label>
        <Select value={formData.transaction_id} onValueChange={(value) => setFormData({...formData, transaction_id: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select transaction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No transaction</SelectItem>
            {transactions?.map((transaction) => (
              <SelectItem key={transaction.id} value={transaction.id}>
                {transaction.property_address}
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
            <SelectItem value="portal_message">Portal Message</SelectItem>
            <SelectItem value="email">Email</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Subject</Label>
        <Input
          value={formData.subject}
          onChange={(e) => setFormData({...formData, subject: e.target.value})}
          placeholder="Enter subject"
        />
      </div>

      <div>
        <Label>Message</Label>
        <Textarea
          value={formData.content}
          onChange={(e) => setFormData({...formData, content: e.target.value})}
          placeholder="Type your message..."
          rows={6}
          required
        />
      </div>

      <Button type="submit" className="w-full">
        Send Message
      </Button>
    </form>
  );
};

export default Communications;
