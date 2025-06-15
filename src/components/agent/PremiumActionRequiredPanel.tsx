
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Task = Tables<'tasks'>;

interface PremiumActionRequiredPanelProps {
  pendingTasks: Task[];
}

const PremiumActionRequiredPanel = ({ pendingTasks }: PremiumActionRequiredPanelProps) => {
  const actionRequiredTasks = pendingTasks.filter(task => task.requires_agent_action);

  if (actionRequiredTasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-brand-taupe/20 bg-gradient-to-br from-emerald-50/50 to-white shadow-brand-subtle">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 font-brand-heading text-lg text-brand-charcoal tracking-wide">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              All Clear
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-brand-charcoal font-brand-body leading-relaxed mb-4">
                  Nothing is needed from you at this time. Our team is coordinating all moving parts behind the scenes and will reach out proactively if anything requires your attention.
                </p>
                <div className="text-brand-charcoal/60 text-sm font-brand-body italic">
                  You're in expert hands. Relax and let us handle the details.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-white shadow-brand-elevation">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 font-brand-heading text-lg text-brand-charcoal tracking-wide">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Action Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {actionRequiredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white/80 rounded-lg p-6 border border-amber-200/50 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 space-y-3">
                  <h4 className="font-brand-heading font-semibold text-brand-charcoal tracking-wide">
                    {task.title}
                  </h4>
                  {task.agent_action_prompt && (
                    <p className="text-brand-charcoal/70 font-brand-body leading-relaxed">
                      {task.agent_action_prompt}
                    </p>
                  )}
                  {task.due_date && (
                    <p className="text-brand-charcoal/50 text-sm font-brand-body">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  )}
                  <Button 
                    size="sm" 
                    className="bg-brand-charcoal hover:bg-brand-taupe-dark text-white font-brand-heading tracking-wide uppercase text-xs px-4 py-2"
                  >
                    Take Action
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
          
          <div className="pt-4 border-t border-amber-200/50">
            <p className="text-brand-charcoal/60 text-sm font-brand-body italic text-center">
              Our team is standing by to assist you with any questions.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PremiumActionRequiredPanel;
