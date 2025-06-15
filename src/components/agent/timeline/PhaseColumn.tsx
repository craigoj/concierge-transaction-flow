
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import MilestoneItem from './MilestoneItem';

type Task = Tables<'tasks'>;

interface PhaseColumnProps {
  phase: string;
  tasks: Task[];
  isActive: boolean;
  isCompleted: boolean;
}

const PhaseColumn = ({ phase, tasks, isActive, isCompleted }: PhaseColumnProps) => {
  return (
    <div className="flex-1 min-w-0">
      {/* Phase Header */}
      <div className={`flex items-center gap-3 mb-6 p-4 rounded-lg transition-all duration-300 ${
        isActive 
          ? 'bg-brand-cream/30' 
          : isCompleted 
          ? 'bg-emerald-50' 
          : 'bg-transparent'
      }`}>
        {isCompleted && (
          <CheckCircle className="h-6 w-6 text-emerald-600" />
        )}
        <h3 className={`text-lg font-brand-heading tracking-wide uppercase transition-all duration-300 ${
          isActive 
            ? 'text-brand-charcoal font-semibold' 
            : isCompleted 
            ? 'text-emerald-700 font-medium' 
            : 'text-brand-charcoal/60 font-medium'
        }`}>
          {phase}
        </h3>
      </div>

      {/* Phase Tasks */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <MilestoneItem
            key={task.id}
            task={task}
            isPhaseActive={isActive}
          />
        ))}
      </div>
    </div>
  );
};

export default PhaseColumn;
