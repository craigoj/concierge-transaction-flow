
import React from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle, Pause } from 'lucide-react';
import { TransactionPhaseProgress, PhaseStatus } from '@/types/progress';

interface ProgressPhaseIndicatorProps {
  phases: TransactionPhaseProgress[];
  currentPhase?: string;
  serviceTier?: string | null;
  isInteractive?: boolean;
  onPhaseClick?: (phase: TransactionPhaseProgress) => void;
}

export const ProgressPhaseIndicator: React.FC<ProgressPhaseIndicatorProps> = ({
  phases,
  currentPhase,
  serviceTier,
  isInteractive = false,
  onPhaseClick
}) => {
  const getServiceTierClass = (tier?: string | null) => {
    switch (tier) {
      case 'buyer_elite':
      case 'listing_elite':
        return 'progress-elite';
      case 'white_glove_buyer':
      case 'white_glove_listing':
        return 'progress-white-glove';
      default:
        return 'progress-core';
    }
  };

  const getPhaseIcon = (status: PhaseStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'blocked':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'at_risk':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'skipped':
        return <Pause className="h-4 w-4 text-gray-400" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const calculateOverallProgress = () => {
    if (!phases.length) return 0;
    const completedCount = phases.filter(p => p.status === 'completed').length;
    return Math.round((completedCount / phases.length) * 100);
  };

  const progressPercentage = calculateOverallProgress();

  return (
    <div className="progress-phase-indicator space-y-3">
      {/* Overall Progress Bar */}
      <div className="progress-bar-container relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`progress-bar h-full rounded-full transition-all duration-500 ${getServiceTierClass(serviceTier)}`}
          style={{ width: `${progressPercentage}%` }}
        />
        <div className="progress-percentage absolute -top-6 right-0 text-sm font-medium text-gray-600">
          {progressPercentage}%
        </div>
      </div>

      {/* Phase Indicators */}
      <div className="phase-indicators flex items-center justify-between">
        {phases.map((phase, index) => (
          <button
            key={phase.id}
            className={`phase-dot flex flex-col items-center space-y-1 ${
              isInteractive ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
            } ${phase.id === currentPhase ? 'current-phase' : ''}`}
            onClick={isInteractive && onPhaseClick ? () => onPhaseClick(phase) : undefined}
            disabled={!isInteractive}
          >
            <div className={`transition-transform duration-200 ${
              phase.id === currentPhase ? 'scale-110' : ''
            }`}>
              {getPhaseIcon(phase.status as PhaseStatus)}
            </div>
            {index < phases.length - 1 && (
              <div className={`connector w-8 h-0.5 ${
                phase.status === 'completed' ? 'bg-green-300' : 'bg-gray-300'
              }`} />
            )}
          </button>
        ))}
      </div>

      {/* Milestone Summary */}
      <div className="milestone-summary text-xs text-gray-500 text-center">
        {phases.filter(p => p.status === 'completed').length} / {phases.length} phases completed
      </div>

      {/* Custom CSS styles */}
      <style>
        {`
          .progress-core .progress-bar {
            background: linear-gradient(90deg, #10b981 0%, #059669 100%);
          }
          .progress-elite .progress-bar {
            background: linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%);
          }
          .progress-white-glove .progress-bar {
            background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
          }
          .current-phase {
            position: relative;
          }
          .current-phase::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-bottom: 4px solid #3b82f6;
          }
        `}
      </style>
    </div>
  );
};
