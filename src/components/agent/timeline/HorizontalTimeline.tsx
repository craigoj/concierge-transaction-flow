
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import PhaseColumn from './PhaseColumn';

type Task = Tables<'tasks'>;

interface HorizontalTimelineProps {
  tasks: Task[];
}

const PHASES = ['Contract', 'Inspections', 'Appraisal', 'Financing', 'Closing'];

const HorizontalTimeline = ({ tasks }: HorizontalTimelineProps) => {
  // Group tasks by phase
  const tasksByPhase = tasks.reduce((acc, task) => {
    const phase = task.phase || 'Contract';
    if (!acc[phase]) {
      acc[phase] = [];
    }
    acc[phase].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Determine active phase (first phase with incomplete tasks)
  const getPhaseStatus = (phase: string) => {
    const phaseTasks = tasksByPhase[phase] || [];
    const completedTasks = phaseTasks.filter(task => task.is_completed);
    const isCompleted = phaseTasks.length > 0 && completedTasks.length === phaseTasks.length;
    
    return {
      isCompleted,
      hasIncompleteTasks: phaseTasks.length > 0 && completedTasks.length < phaseTasks.length
    };
  };

  // Find the active phase (first phase with incomplete tasks)
  const activePhase = PHASES.find(phase => {
    const status = getPhaseStatus(phase);
    return status.hasIncompleteTasks;
  });

  return (
    <div className="bg-white rounded-xl shadow-brand-subtle border border-brand-taupe/20 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-brand-heading font-semibold text-brand-charcoal tracking-wide">
          Transaction Timeline
        </h2>
        <p className="text-brand-charcoal/60 font-brand-serif mt-2">
          Track the progress of your transaction through each phase
        </p>
      </div>

      <div className="flex items-start gap-6 overflow-x-auto pb-4">
        {PHASES.map((phase, index) => {
          const status = getPhaseStatus(phase);
          const isActive = activePhase === phase;
          const phaseTasks = tasksByPhase[phase] || [];

          return (
            <React.Fragment key={phase}>
              <PhaseColumn
                phase={phase}
                tasks={phaseTasks}
                isActive={isActive}
                isCompleted={status.isCompleted}
              />
              
              {/* Connector Arrow */}
              {index < PHASES.length - 1 && (
                <div className="flex items-center justify-center mt-12 flex-shrink-0">
                  <ChevronRight className="h-6 w-6 text-brand-taupe/40" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default HorizontalTimeline;
