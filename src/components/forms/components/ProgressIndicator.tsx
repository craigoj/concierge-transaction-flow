
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStepId: string;
  completedStepIds: string[];
  onStepClick?: (stepId: string) => void;
  allowStepNavigation?: boolean;
  showProgress?: boolean;
  showDescriptions?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const ProgressIndicator = ({
  steps,
  currentStepId,
  completedStepIds,
  onStepClick,
  allowStepNavigation = true,
  showProgress = true,
  showDescriptions = true,
  orientation = 'horizontal',
  className
}: ProgressIndicatorProps) => {
  const currentStepIndex = steps.findIndex(step => step.id === currentStepId);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  const isStepCompleted = (stepId: string) => completedStepIds.includes(stepId);
  const isStepCurrent = (stepId: string) => stepId === currentStepId;
  const isStepClickable = (stepId: string) => {
    return allowStepNavigation && (isStepCompleted(stepId) || isStepCurrent(stepId)) && onStepClick;
  };

  const getStepStatus = (stepId: string) => {
    if (isStepCompleted(stepId)) return 'completed';
    if (isStepCurrent(stepId)) return 'current';
    return 'pending';
  };

  if (orientation === 'vertical') {
    return (
      <div className={cn("space-y-4", className)}>
        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-brand-heading tracking-wide uppercase text-brand-charcoal">
                Progress
              </span>
              <span className="text-brand-charcoal/60">
                {currentStepIndex + 1} of {steps.length}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        <div className="space-y-3">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const isClickable = isStepClickable(step.id);

            return (
              <div key={step.id} className="flex items-start gap-4">
                {/* Step indicator */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => isClickable && onStepClick?.(step.id)}
                    disabled={!isClickable}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                      status === 'completed' && "bg-green-600 border-green-600 text-white",
                      status === 'current' && "bg-brand-charcoal border-brand-charcoal text-brand-background",
                      status === 'pending' && "bg-white border-brand-taupe text-brand-charcoal/60",
                      isClickable && "hover:scale-110 cursor-pointer",
                      !isClickable && "cursor-default"
                    )}
                  >
                    {status === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : step.icon ? (
                      step.icon
                    ) : (
                      <span className="text-sm font-bold">{index + 1}</span>
                    )}
                  </button>

                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "w-0.5 h-8 mt-2 transition-colors duration-300",
                      isStepCompleted(step.id) ? "bg-green-600" : "bg-brand-taupe/30"
                    )} />
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 min-w-0 pb-8">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={cn(
                      "font-brand-heading text-sm tracking-wide uppercase",
                      status === 'current' && "text-brand-charcoal font-semibold",
                      status === 'completed' && "text-green-700",
                      status === 'pending' && "text-brand-charcoal/60"
                    )}>
                      {step.title}
                    </h3>
                    
                    {step.required && status === 'pending' && (
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    )}
                    
                    {status === 'completed' && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        Complete
                      </Badge>
                    )}
                  </div>

                  {showDescriptions && step.description && (
                    <p className={cn(
                      "text-sm font-brand-body",
                      status === 'current' && "text-brand-charcoal/80",
                      status === 'completed' && "text-green-600/80",
                      status === 'pending' && "text-brand-charcoal/50"
                    )}>
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Horizontal orientation
  return (
    <div className={cn("space-y-6", className)}>
      {showProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-brand-heading tracking-brand-wide text-brand-charcoal uppercase">
              Step {currentStepIndex + 1} of {steps.length}
            </h2>
            <span className="text-sm text-brand-charcoal/60">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      )}

      {/* Horizontal steps */}
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-brand-taupe/30">
          <div 
            className="h-full bg-brand-charcoal transition-all duration-500 ease-out"
            style={{ width: `${(completedStepIds.length / steps.length) * 100}%` }}
          />
        </div>

        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isClickable = isStepClickable(step.id);

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <button
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 mb-3",
                  status === 'completed' && "bg-brand-charcoal border-brand-charcoal text-brand-background",
                  status === 'current' && "bg-brand-charcoal border-brand-charcoal text-brand-background ring-4 ring-brand-charcoal/20",
                  status === 'pending' && "bg-white border-brand-taupe text-brand-charcoal/60",
                  isClickable && "hover:scale-110 cursor-pointer",
                  !isClickable && "cursor-default"
                )}
              >
                {status === 'completed' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : step.icon ? (
                  step.icon
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </button>

              <div className="text-center max-w-24">
                <h3 className={cn(
                  "font-brand-heading text-xs tracking-wide uppercase mb-1",
                  status === 'current' && "text-brand-charcoal font-semibold",
                  status === 'completed' && "text-brand-charcoal",
                  status === 'pending' && "text-brand-charcoal/60"
                )}>
                  {step.title}
                </h3>

                {showDescriptions && step.description && (
                  <p className={cn(
                    "text-xs font-brand-body",
                    status === 'current' && "text-brand-charcoal/80",
                    status === 'completed' && "text-brand-charcoal/70",
                    status === 'pending' && "text-brand-charcoal/50"
                  )}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current step details */}
      <div className="text-center p-4 bg-brand-cream/30 rounded-lg border border-brand-taupe/20">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h3 className="text-lg font-brand-heading tracking-wide uppercase text-brand-charcoal">
            {steps[currentStepIndex]?.title}
          </h3>
          {steps[currentStepIndex]?.required && (
            <Badge variant="outline">Required</Badge>
          )}
        </div>
        
        {showDescriptions && steps[currentStepIndex]?.description && (
          <p className="text-brand-charcoal/70 font-brand-body">
            {steps[currentStepIndex].description}
          </p>
        )}
      </div>
    </div>
  );
};
