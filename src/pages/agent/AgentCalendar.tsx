
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CalendarDays, Clock, MapPin, Users, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/components/navigation/Breadcrumb';

const AgentCalendar = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: upcomingEvents, isLoading } = useQuery({
    queryKey: ['agent-calendar-events'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get tasks with due dates as calendar events
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          transactions!inner (
            id,
            property_address,
            agent_id
          )
        `)
        .eq('transactions.agent_id', user.id)
        .not('due_date', 'is', null)
        .gte('due_date', new Date().toISOString().split('T')[0])
        .order('due_date', { ascending: true })
        .limit(10);

      if (tasksError) throw tasksError;

      // Transform tasks to calendar events
      return tasks?.map(task => ({
        id: task.id,
        title: task.title,
        date: task.due_date,
        type: 'task',
        location: task.transactions?.property_address,
        priority: task.priority,
        isCompleted: task.is_completed
      })) || [];
    }
  });

  const getEventTypeColor = (type: string, priority?: string) => {
    if (type === 'task') {
      switch (priority) {
        case 'high': return 'bg-red-100 text-red-800 border-red-200';
        case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'low': return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-blue-100 text-blue-800 border-blue-200';
      }
    }
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const todaysEvents = upcomingEvents?.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  }) || [];

  const thisWeekEvents = upcomingEvents?.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return eventDate >= today && eventDate <= weekFromNow;
  }) || [];

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <Breadcrumb />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-brand-taupe/10 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <Breadcrumb />
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-brand-heading font-bold text-brand-charcoal tracking-wide">
              My Calendar
            </h1>
            <p className="text-brand-charcoal/60 font-brand-body mt-2">
              Stay organized with your upcoming tasks and deadlines
            </p>
          </div>
          <Button className="bg-brand-charcoal hover:bg-brand-taupe-dark text-white">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Event
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-brand-charcoal">{todaysEvents.length}</div>
            <div className="text-sm text-brand-charcoal/60">Today's Events</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <CalendarDays className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-brand-charcoal">{thisWeekEvents.length}</div>
            <div className="text-sm text-brand-charcoal/60">This Week</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-brand-charcoal">
              {upcomingEvents?.length || 0}
            </div>
            <div className="text-sm text-brand-charcoal/60">Upcoming</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-brand-heading tracking-wide">
              <Calendar className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todaysEvents.length > 0 ? (
              todaysEvents.map((event) => (
                <div key={event.id} className={`p-4 rounded-lg border ${getEventTypeColor(event.type, event.priority)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-brand-heading font-semibold">{event.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {event.type.toUpperCase()}
                    </Badge>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm opacity-80 mb-1">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm opacity-80">
                    <Clock className="h-4 w-4" />
                    Due: {new Date(event.date).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-brand-taupe/40 mx-auto mb-3" />
                <p className="text-brand-charcoal/60 font-brand-body">
                  No events scheduled for today
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-brand-heading tracking-wide">
              <CalendarDays className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents && upcomingEvents.length > 0 ? (
              upcomingEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center gap-4 p-4 border border-brand-tauge/20 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full ${
                      event.priority === 'high' ? 'bg-red-400' :
                      event.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-brand-heading font-medium text-brand-charcoal truncate">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-brand-charcoal/60 mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CalendarDays className="h-12 w-12 text-brand-taupe/40 mx-auto mb-3" />
                <p className="text-brand-charcoal/60 font-brand-body">
                  No upcoming events scheduled
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Calendar Integration Notice */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CalendarDays className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-brand-heading font-semibold text-brand-charcoal mb-1">
                Calendar Integration
              </h3>
              <p className="text-brand-charcoal/60 font-brand-body text-sm">
                Connect your Google Calendar or Outlook to sync all your appointments and events.
              </p>
            </div>
            <Button variant="outline">
              Connect Calendar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentCalendar;
