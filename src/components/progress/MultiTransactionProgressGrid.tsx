
import React from 'react';
import { EnhancedTransactionGrid } from './EnhancedTransactionGrid';

interface MultiTransactionProgressGridProps {
  agentId?: string;
  className?: string;
}

export const MultiTransactionProgressGrid: React.FC<MultiTransactionProgressGridProps> = ({
  agentId,
  className = ''
}) => {
  return (
    <div className={`multi-transaction-progress-grid ${className}`}>
      <EnhancedTransactionGrid 
        agentId={agentId}
        className="w-full"
      />
    </div>
  );
};
