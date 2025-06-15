
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Task = Tables<'tasks'>;

interface MilestoneItemProps {
  task: Task;
  isPhaseActive: boolean;
}

const MilestoneItem = ({ task, isPhaseActive }: MilestoneItemProps) => {
  const isCompleted = task.is_completed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-4 p-4 rounded-lg border transition-all duration-300 hover:shadow-md"
      style={{
        borderColor: isCompleted 
          ? '#10b981' 
          : isPhaseActive 
          ? '#d2b48c' 
          : '#e5e7eb',
        backgroundColor: isCompleted 
          ? '#ecfdf5' 
          : isPhaseActive 
          ? '#fefcf8' 
          : '#ffffff'
      }}
    >
      {/* Animated Checkmark Area */}
      <div className="flex-shrink-0 mt-0.5">
        <motion.div
          animate={{
            scale: isCompleted ? [1, 1.2, 1] : 1,
            opacity: isCompleted ? 1 : 0.5
          }}
          transition={{ duration: 0.3 }}
        >
          {isCompleted ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 500,
                damping: 25,
                duration: 0.3
              }}
            >
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </motion.div>
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
              {isPhaseActive && (
                <Clock className="h-3 w-3 text-brand-taupe" />
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <motion.h4
          animate={{
            color: isCompleted 
              ? '#047857' 
              : isPhaseActive 
              ? '#1f2937' 
              : '#6b7280',
            textDecoration: isCompleted ? 'line-through' : 'none'
          }}
          transition={{ duration: 0.3 }}
          className="font-brand-body font-medium leading-tight"
        >
          {task.title}
        </motion.h4>
        
        {task.description && (
          <p className={`text-sm mt-1 transition-all duration-300 ${
            isCompleted 
              ? 'text-emerald-600/70 line-through' 
              : 'text-brand-charcoal/60'
          }`}>
            {task.description}
          </p>
        )}

        {task.due_date && (
          <p className="text-xs mt-2 text-brand-charcoal/50">
            Due: {new Date(task.due_date).toLocaleDateString()}
          </p>
        )}

        {isCompleted && task.completed_at && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs mt-1 text-emerald-600"
          >
            Completed: {new Date(task.completed_at).toLocaleDateString()}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

export default MilestoneItem;
