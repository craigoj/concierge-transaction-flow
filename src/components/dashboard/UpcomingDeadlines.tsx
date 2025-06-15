
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface BaseDeadline {
  id: string;
  type: 'closing' | 'task';
  title: string;
  date: string;
  priority: string;
}

interface ClosingDeadline extends BaseDeadline {
  type: 'closing';
  client?: string;
}

interface TaskDeadline extends BaseDeadline {
  type: 'task';
  property?: string;
  priority: 'low' | 'medium' | 'high';
}

type DeadlineItem = ClosingDeadline | TaskDeadline;

const UpcomingDeadlines = () => {
  const navigate = useNavigate();

  const { data: deadlines, isLoading } = useQuery({
    queryKey: ['upcomingDeadlines'],
    queryFn: async () => {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Get transactions with closing dates in the next week
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select(`
          id,
          property_address,
          closing_date,
          status,
          clients (full_name)
        `)
        .gte('closing_date', today.toISOString().split('T')[0])
        .lte('closing_date', nextWeek.toISOString().split('T')[0])
        .neq('status', 'closed')
        .order('closing_date', { ascending: true });

      if (transactionError) throw transactionError;

      // Get upcoming tasks
      const { data: tasks, error: taskError } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          due_date,
          priority,
          transaction_id,
          transactions (property_address)
        `)
        .gte('due_date', today.toISOString().split('T')[0])
        .lte('due_date', nextWeek.toISOString().split('T')[0])
        .eq('is_completed', false)
        .order('due_date', { ascending: true });

      if (taskError) throw taskError;

      return {
        transactions: transactions || [],
        tasks: tasks || []
      };
    },
  });

  const getDaysUntil = (date: string) => {
    const today = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getUrgencyColor = (days: number) => {
    if (days <= 1) return 'text-red-600';
    if (days <= 3) return 'text-orange-600';
    return 'text-blue-600';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const allDeadlines: DeadlineItem[] = [
    ...deadlines?.transactions.map(t => ({
      id: t.id,
      type: 'closing' as const,
      title: `Closing: ${t.property_address}`,
      date: t.closing_date,
      client: t.clients?.[0]?.full_name,
      priority: 'high'
    })) || [],
    ...deadlines?.tasks.map(t => ({
      id: t.id,
      type: 'task' as const,
      title: t.title,
      date: t.due_date,
      property: t.transactions?.property_address,
      priority: t.priority as 'low' | 'medium' | 'high'
    })) || []
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        {allDeadlines.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No upcoming deadlines</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allDeadlines.slice(0, 5).map((deadline) => {
              const daysUntil = getDaysUntil(deadline.date);
              return (
                <div key={`${deadline.type}-${deadline.id}`} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {deadline.type === 'closing' ? (
                        <Calendar className="h-4 w-4 text-primary" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {deadline.title}
                      </p>
                      {deadline.type === 'closing' && deadline.client && (
                        <p className="text-xs text-muted-foreground">
                          Client: {deadline.client}
                        </p>
                      )}
                      {deadline.type === 'task' && deadline.property && (
                        <p className="text-xs text-muted-foreground">
                          Property: {deadline.property}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getPriorityColor(deadline.priority)} className="text-xs">
                      {deadline.priority}
                    </Badge>
                    <span className={`text-xs font-medium ${getUrgencyColor(daysUntil)}`}>
                      {daysUntil === 0 ? 'Today' : 
                       daysUntil === 1 ? 'Tomorrow' : 
                       `${daysUntil} days`}
                    </span>
                  </div>
                </div>
              );
            })}
            {allDeadlines.length > 5 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full"
                onClick={() => navigate('/calendar')}
              >
                View all deadlines
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingDeadlines;
