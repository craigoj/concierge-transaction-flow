
import React from 'react';
import { Tables } from '@/integrations/supabase/types';
import HorizontalTimeline from './timeline/HorizontalTimeline';
import { useRealtime } from '@/hooks/useRealtime';

type Transaction = Tables<'transactions'> & {
  tasks: Tables<'tasks'>[];
};

interface TransactionProgressTrackerProps {
  transaction: Transaction;
}

const TransactionProgressTracker = ({ transaction }: TransactionProgressTrackerProps) => {
  // Enable real-time updates for tasks
  useRealtime({
    table: 'tasks',
    queryKeys: [['agent-transaction', transaction.id]],
    filter: { column: 'transaction_id', value: transaction.id }
  });

  return (
    <div className="space-y-8">
      <HorizontalTimeline tasks={transaction.tasks || []} />
    </div>
  );
};

export default TransactionProgressTracker;
