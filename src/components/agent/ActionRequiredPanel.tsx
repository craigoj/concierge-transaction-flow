
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Task = Tables<'tasks'>;

interface ActionRequiredPanelProps {
  pendingTasks: Task[];
}

const ActionRequiredPanel = ({ pendingTasks }: ActionRequiredPanelProps) => {
  const actionRequiredTasks = pendingTasks.filter(task => 
    !task.is_completed && task.priority === 'high'
  );

  const hasActionRequired = actionRequiredTasks.length > 0;

  return (
    <Card className={`transition-all duration-300 ${
      hasActionRequired 
        ? 'border-amber-300 bg-amber-50/50 shadow-amber-100' 
        : 'border-brand-taupe/20 bg-white shadow-brand-subtle'
    }`}>
      <CardHeader className="pb-4">
        <CardTitle className={`flex items-center gap-3 font-brand-heading text-lg ${
          hasActionRequired ? 'text-amber-800' : 'text-brand-charcoal'
        }`}>
          {hasActionRequired ? (
            <AlertCircle className="h-5 w-5 text-amber-600" />
          ) : (
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          )}
          Action Required by You
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasActionRequired ? (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-l-4 border-amber-400 bg-amber-50`}>
              <p className="font-brand-heading font-semibold text-amber-800 mb-2 uppercase tracking-wide">
                Action Required
              </p>
              {actionRequiredTasks.map((task, index) => (
                <div key={task.id} className="mb-3 last:mb-0">
                  <p className="font-brand-body text-amber-800 font-medium">
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-amber-700 text-sm mt-1 font-brand-body">
                      {task.description}
                    </p>
                  )}
                  {task.due_date && (
                    <p className="text-amber-600 text-xs mt-2 font-brand-body">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="text-brand-charcoal font-brand-body text-lg font-medium mb-2">
              Nothing is needed from you at this time
            </p>
            <p className="text-brand-charcoal/60 font-brand-body">
              We are handling everything and will update you as soon as action is required.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActionRequiredPanel;
