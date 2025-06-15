
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, TrendingRight } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Transaction = Tables<'transactions'> & {
  tasks: Tables<'tasks'>[];
};

interface WhatsNextPanelProps {
  transaction: Transaction;
}

const WhatsNextPanel = ({ transaction }: WhatsNextPanelProps) => {
  // Generate contextual "what's next" message based on transaction status and tasks
  const getWhatsNextMessage = () => {
    const activeTasks = transaction.tasks?.filter(task => !task.is_completed) || [];
    const recentCompletedTasks = transaction.tasks?.filter(task => 
      task.is_completed && task.completed_at && 
      new Date(task.completed_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ) || [];

    if (transaction.status === 'intake') {
      return "We have received your transaction submission and are setting up the coordination process. Our team is preparing the initial documentation and will reach out within 24 hours with next steps.";
    }

    if (recentCompletedTasks.length > 0) {
      const lastCompleted = recentCompletedTasks[0];
      return `Great progress! We've just completed "${lastCompleted.title}". Our team is now focusing on the next priority items and will keep you updated on any developments that require your attention.`;
    }

    if (activeTasks.length > 0) {
      const nextTask = activeTasks.find(task => task.priority === 'high') || activeTasks[0];
      return `We are currently working on "${nextTask.title}". This is our primary focus, and we expect to have updates for you soon. No action is required from you at this time.`;
    }

    if (transaction.status === 'active') {
      return "Your transaction is progressing smoothly. Our team is coordinating all moving parts behind the scenes and will proactively communicate any updates or action items as they arise.";
    }

    return "Everything is on track. We are monitoring all aspects of your transaction and will reach out immediately if anything requires your attention.";
  };

  return (
    <Card className="border-brand-taupe/20 bg-white shadow-brand-subtle">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 font-brand-heading text-lg text-brand-charcoal">
          <TrendingRight className="h-5 w-5 text-brand-taupe" />
          What's Next
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-brand-cream rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <Clock className="h-5 w-5 text-brand-taupe" />
          </div>
          <div className="flex-1">
            <p className="text-brand-charcoal font-brand-body leading-relaxed">
              {getWhatsNextMessage()}
            </p>
            <div className="mt-4 pt-4 border-t border-brand-taupe/20">
              <p className="text-brand-charcoal/60 text-sm font-brand-body italic">
                Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsNextPanel;
