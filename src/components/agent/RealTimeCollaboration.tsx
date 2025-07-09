import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, MessageCircle, Send, Eye, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface RealTimeCollaborationProps {
  transactionId: string;
}

interface PresenceState {
  user_id: string;
  user_name: string;
  user_role: string;
  last_seen: string;
  current_section?: string;
}

interface ActivityUpdate {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  details: string;
  timestamp: string;
}

const RealTimeCollaboration = ({ transactionId }: RealTimeCollaborationProps) => {
  const [presenceData, setPresenceData] = useState<Record<string, PresenceState[]>>({});
  const [activityFeed, setActivityFeed] = useState<ActivityUpdate[]>([]);
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel(`transaction-${transactionId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Transform the presence state to match our interface
        const transformedState: Record<string, PresenceState[]> = {};
        for (const [key, presences] of Object.entries(state)) {
          transformedState[key] = (presences as unknown[]).map((presence: unknown) => {
            const p = presence as Record<string, unknown>;
            return {
              user_id: p.user_id as string,
              user_name: p.user_name as string,
              user_role: p.user_role as string,
              last_seen: p.last_seen as string,
              current_section: p.current_section as string | undefined,
            };
          });
        }
        setPresenceData(transformedState);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const user = newPresences[0] as PresenceState;
        if (user && user.user_name) {
          toast({
            title: 'User Joined',
            description: `${user.user_name} is now viewing this transaction`,
          });
        }
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const user = leftPresences[0] as PresenceState;
        if (user && user.user_name) {
          toast({
            title: 'User Left',
            description: `${user.user_name} has left the transaction`,
          });
        }
      })
      .on('broadcast', { event: 'activity' }, ({ payload }) => {
        setActivityFeed((prev) => [payload as ActivityUpdate, ...prev.slice(0, 9)]);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);

          // Get current user info
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name, last_name, role')
              .eq('id', user.id)
              .single();

            if (profile) {
              await channel.track({
                user_id: user.id,
                user_name: `${profile.first_name} ${profile.last_name}`,
                user_role: profile.role,
                last_seen: new Date().toISOString(),
                current_section: 'overview',
              });
            }
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [transactionId, toast]);

  const broadcastActivity = async (action: string, details: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();

    if (profile) {
      const channel = supabase.channel(`transaction-${transactionId}`);
      await channel.send({
        type: 'broadcast',
        event: 'activity',
        payload: {
          id: Date.now().toString(),
          user_id: user.id,
          user_name: `${profile.first_name} ${profile.last_name}`,
          action,
          details,
          timestamp: new Date().toISOString(),
        },
      });
    }
  };

  const sendQuickMessage = async () => {
    if (!message.trim()) return;

    await broadcastActivity('sent_message', message);
    setMessage('');
  };

  const activeUsers = Object.values(presenceData)
    .flat()
    .filter((user) => {
      const lastSeen = new Date(user.last_seen);
      const now = new Date();
      return now.getTime() - lastSeen.getTime() < 5 * 60 * 1000; // 5 minutes
    });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'coordinator':
        return 'bg-purple-100 text-purple-800';
      case 'agent':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-brand-charcoal/60">
          {isConnected ? 'Connected' : 'Connecting...'}
        </span>
      </div>

      {/* Active Users */}
      <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Active Users ({activeUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeUsers.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              <AnimatePresence>
                {activeUsers.map((user) => (
                  <motion.div
                    key={user.user_id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2 p-2 bg-brand-cream/50 rounded-lg border border-brand-taupe/20"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(user.user_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-brand-charcoal">{user.user_name}</p>
                      <Badge className={`text-xs ${getRoleColor(user.user_role)}`}>
                        {user.user_role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-green-500">
                      <Eye className="h-3 w-3" />
                      <span className="text-xs">Online</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-4">
              <Users className="h-8 w-8 text-brand-taupe/40 mx-auto mb-2" />
              <p className="text-sm text-brand-charcoal/60">No other users currently viewing</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Communication */}
      <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Quick Communication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Send a quick message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendQuickMessage()}
            />
            <Button onClick={sendQuickMessage} disabled={!message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => broadcastActivity('needs_review', 'Requesting coordinator review')}
            >
              Request Review
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => broadcastActivity('task_complete', 'Completed pending tasks')}
            >
              Tasks Complete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => broadcastActivity('document_ready', 'Documents ready for signature')}
            >
              Docs Ready
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activityFeed.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {activityFeed.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-start gap-3 p-3 border border-brand-taupe/20 rounded-lg bg-brand-cream/30"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(activity.user_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-brand-charcoal">
                          {activity.user_name}
                        </span>
                        <span className="text-sm text-brand-charcoal/60">
                          {activity.action.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-brand-charcoal/70">{activity.details}</p>
                      <p className="text-xs text-brand-charcoal/50 mt-1">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-6">
              <Clock className="h-12 w-12 text-brand-taupe/40 mx-auto mb-3" />
              <p className="text-brand-charcoal/60">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeCollaboration;
