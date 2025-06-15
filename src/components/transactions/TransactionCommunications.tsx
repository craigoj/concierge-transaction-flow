
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MessageSquare, Plus, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TransactionCommunicationsProps {
  transactionId: string;
}

const TransactionCommunications = ({ transactionId }: TransactionCommunicationsProps) => {
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [messageForm, setMessageForm] = useState({
    type: 'email',
    recipient: '',
    subject: '',
    message: ''
  });

  // Mock communication data - in real app, this would come from the database
  const communications = [
    {
      id: '1',
      type: 'email',
      subject: 'Welcome to your transaction',
      recipient: 'john.doe@email.com',
      sender: 'agent@agentconcierge.com',
      date: new Date().toISOString(),
      status: 'sent'
    },
    {
      id: '2',
      type: 'phone',
      subject: 'Initial consultation call',
      recipient: '+1 (555) 123-4567',
      date: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed',
      duration: '15 minutes'
    },
    {
      id: '3',
      type: 'sms',
      subject: 'Reminder: Document signing tomorrow',
      recipient: '+1 (555) 123-4567',
      date: new Date(Date.now() - 172800000).toISOString(),
      status: 'delivered'
    }
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would send the message via email/SMS
    console.log('Sending message:', messageForm);
    setNewMessageOpen(false);
    setMessageForm({ type: 'email', recipient: '', subject: '', message: '' });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Communications</h2>
        <Dialog open={newMessageOpen} onOpenChange={setNewMessageOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send New Message</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Message Type</Label>
                  <Select value={messageForm.type} onValueChange={(value) => setMessageForm(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="recipient">Recipient</Label>
                  <Input
                    id="recipient"
                    value={messageForm.recipient}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, recipient: e.target.value }))}
                    placeholder={messageForm.type === 'email' ? 'email@example.com' : '+1 (555) 123-4567'}
                    required
                  />
                </div>
              </div>
              
              {(messageForm.type === 'email' || messageForm.type === 'sms') && (
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                    required
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="message">
                  {messageForm.type === 'phone' ? 'Call Notes' : 'Message'}
                </Label>
                <Textarea
                  id="message"
                  value={messageForm.message}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setNewMessageOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  {messageForm.type === 'phone' ? 'Log Call' : 'Send Message'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Communication History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {communications.map((comm) => (
              <div key={comm.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                  {getTypeIcon(comm.type)}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{comm.subject}</h4>
                    <Badge className={getStatusColor(comm.status)}>
                      {comm.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>To: {comm.recipient}</p>
                    <p>Date: {new Date(comm.date).toLocaleString()}</p>
                    {comm.duration && <p>Duration: {comm.duration}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Mail className="h-6 w-6" />
              <span>Send Email Update</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <MessageSquare className="h-6 w-6" />
              <span>Send SMS Reminder</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Phone className="h-6 w-6" />
              <span>Schedule Call</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionCommunications;
