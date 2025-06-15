
import { supabase } from '@/integrations/supabase/client';

export interface CalendarEvent {
  transactionId: string;
  eventType: 'contract' | 'inspection' | 'financing' | 'closing';
  eventDate: string;
  title: string;
  description?: string;
}

export const createCalendarEvent = async (event: CalendarEvent) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-calendar-event', {
      body: event,
    });

    if (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }

    console.log('Calendar event created successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to create calendar event:', error);
    throw error;
  }
};

export const syncTransactionDeadlines = async (transactionId: string, closingDate?: string) => {
  if (!closingDate) return;

  const events: CalendarEvent[] = [];
  const closing = new Date(closingDate);

  // Create events for key milestones
  events.push({
    transactionId,
    eventType: 'closing',
    eventDate: closingDate,
    title: 'Closing Day',
    description: 'Final closing and property transfer',
  });

  // 7 days before closing - final walkthrough
  const walkthrough = new Date(closing);
  walkthrough.setDate(walkthrough.getDate() - 7);
  events.push({
    transactionId,
    eventType: 'inspection',
    eventDate: walkthrough.toISOString().split('T')[0],
    title: 'Final Walkthrough',
    description: 'Pre-closing property inspection',
  });

  // 14 days before closing - financing deadline
  const financing = new Date(closing);
  financing.setDate(financing.getDate() - 14);
  events.push({
    transactionId,
    eventType: 'financing',
    eventDate: financing.toISOString().split('T')[0],
    title: 'Financing Deadline',
    description: 'Secure final loan approval',
  });

  // Create all events
  for (const event of events) {
    try {
      await createCalendarEvent(event);
    } catch (error) {
      console.error(`Failed to create event ${event.title}:`, error);
    }
  }
};
