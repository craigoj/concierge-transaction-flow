
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Check, X, Clock, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
  id: string;
  type: 'task' | 'deadline' | 'message' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

const NotificationCenter = () => {
  // Mock notifications data - this will be replaced with real data from Supabase
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'deadline',
      title: 'Contract Deadline Approaching',
      description: '123 Oceanview Drive contract expires in 2 days',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isRead: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'task',
      title: 'Task Completed',
      description: 'Inspection report uploaded for 456 Colonial Avenue',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isRead: false,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'message',
      title: 'New Message',
      description: 'Client inquiry about closing timeline',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      isRead: true,
      priority: 'medium'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const getNotificationIcon = (type: string, priority: string) => {
    switch (type) {
      case 'deadline':
        return <Clock className={`h-4 w-4 ${priority === 'high' ? 'text-red-500' : 'text-orange-500'}`} />;
      case 'task':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'message':
        return <Bell className="h-4 w-4 text-blue-500" />;
      case 'system':
        return <AlertTriangle className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-muted/50 rounded-xl">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white border-border/50 shadow-lg p-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg mb-2 cursor-pointer hover:bg-muted/50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50/50 border-l-2 border-l-blue-500' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium text-foreground">
                          {notification.title}
                        </p>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {notification.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationCenter;
