
import React from 'react';
import { MultiTransactionProgressGrid } from '@/components/progress/MultiTransactionProgressGrid';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface EnhancedTransactionListProps {
  transactions?: any[];
  isLoading?: boolean;
  onTransactionClick?: (id: string) => void;
  enableBulkActions?: boolean;
  className?: string;
}

export const EnhancedTransactionList: React.FC<EnhancedTransactionListProps> = ({
  className = ''
}) => {
  const { role } = useUserRole();
  
  // Get current user ID for agent-specific filtering
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // For agents, show only their transactions
  const agentId = role === 'agent' ? currentUser?.id : undefined;

  return (
    <div className={`enhanced-transaction-list ${className}`}>
      <MultiTransactionProgressGrid 
        agentId={agentId}
        className="w-full"
      />
    </div>
  );
};
