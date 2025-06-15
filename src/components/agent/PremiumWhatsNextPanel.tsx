
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Sparkles } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Transaction = Tables<'transactions'> & {
  tasks: Tables<'tasks'>[];
};

interface PremiumWhatsNextPanelProps {
  transaction: Transaction;
}

const PremiumWhatsNextPanel = ({ transaction }: PremiumWhatsNextPanelProps) => {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="border-brand-taupe/20 bg-gradient-to-br from-white to-brand-cream/20 shadow-brand-subtle overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-taupe/10 to-transparent rounded-full transform translate-x-16 -translate-y-16" />
        
        <CardHeader className="pb-6 relative">
          <CardTitle className="flex items-center gap-3 font-brand-heading text-lg text-brand-charcoal tracking-wide">
            <div className="w-8 h-8 bg-brand-taupe/20 rounded-full flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-brand-taupe" />
            </div>
            What's Next
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-cream to-brand-taupe/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="h-5 w-5 text-brand-taupe" />
              </div>
              <div className="flex-1">
                <p className="text-brand-charcoal font-brand-body leading-relaxed text-base">
                  {getWhatsNextMessage()}
                </p>
              </div>
            </div>
            
            <div className="pt-6 border-t border-brand-taupe/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-charcoal/60 font-brand-body italic">
                  Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="flex items-center gap-2 text-brand-taupe">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs font-brand-heading uppercase tracking-wide">Live</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PremiumWhatsNextPanel;
