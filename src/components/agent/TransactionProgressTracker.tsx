
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Transaction = Tables<'transactions'> & {
  tasks: Tables<'tasks'>[];
};

interface TransactionProgressTrackerProps {
  transaction: Transaction;
}

const TransactionProgressTracker = ({ transaction }: TransactionProgressTrackerProps) => {
  // Define transaction phases and their typical tasks
  const phases = [
    {
      name: 'Contract',
      tasks: ['Contract Review', 'Client Signatures', 'Compliance Check']
    },
    {
      name: 'Inspections',
      tasks: ['Schedule Inspection', 'Inspection Report', 'Repair Negotiations']
    },
    {
      name: 'Appraisal',
      tasks: ['Order Appraisal', 'Appraisal Review', 'Value Confirmation']
    },
    {
      name: 'Final Steps',
      tasks: ['Final Walkthrough', 'Title Review', 'Closing Preparation']
    },
    {
      name: 'Closing',
      tasks: ['Closing Documents', 'Fund Transfer', 'Key Exchange']
    }
  ];

  // Map actual tasks to phases (simplified logic for demo)
  const getTaskStatus = (taskTitle: string) => {
    const matchingTask = transaction.tasks?.find(task => 
      task.title.toLowerCase().includes(taskTitle.toLowerCase())
    );
    
    if (matchingTask?.is_completed) return 'completed';
    if (matchingTask) return 'active';
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'active':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-700 bg-emerald-50';
      case 'active':
        return 'text-blue-700 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card className="border-brand-taupe/20 shadow-brand-subtle">
      <CardHeader>
        <CardTitle className="font-brand-heading text-brand-charcoal text-xl">
          Transaction Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {phases.map((phase, phaseIndex) => (
            <div key={phaseIndex} className="relative">
              {/* Phase Header */}
              <div className="flex items-center mb-4">
                <h3 className="text-lg font-brand-heading font-semibold text-brand-charcoal tracking-wide uppercase">
                  {phase.name}
                </h3>
                <div className="flex-1 h-px bg-brand-taupe/30 ml-6"></div>
              </div>

              {/* Phase Tasks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-4">
                {phase.tasks.map((taskTitle, taskIndex) => {
                  const status = getTaskStatus(taskTitle);
                  return (
                    <div
                      key={taskIndex}
                      className={`flex items-center p-4 rounded-lg border transition-all duration-300 ${
                        status === 'completed' 
                          ? 'border-emerald-200 bg-emerald-50' 
                          : status === 'active'
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="mr-3">
                        {getStatusIcon(status)}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-brand-body ${
                          status === 'completed' ? 'line-through text-emerald-600' : 'text-brand-charcoal'
                        }`}>
                          {taskTitle}
                        </p>
                        <Badge className={`${getStatusColor(status)} text-xs mt-1`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Connector Line */}
              {phaseIndex < phases.length - 1 && (
                <div className="absolute left-6 top-16 w-px h-8 bg-brand-taupe/30"></div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionProgressTracker;
