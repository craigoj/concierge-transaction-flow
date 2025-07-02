
import React, { useState } from 'react';
import { useRealtimeTransactions } from '@/hooks/useRealtimeTransactions';
import { useUserRole } from '@/hooks/useUserRole';
import { TransactionProgressCard } from './TransactionProgressCard';
import { ProgressFilterControls } from './ProgressFilterControls';
import { BulkTransactionActions } from './BulkTransactionActions';
import { AgentPerformancePanel } from './AgentPerformancePanel';
import { ProgressFilters, SortBy, ViewMode, TransactionWithProgress } from '@/types/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedTransactionGridProps {
  agentId?: string;
  className?: string;
}

export const EnhancedTransactionGrid: React.FC<EnhancedTransactionGridProps> = ({
  agentId,
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

  // Filter states
  const [filters, setFilters] = useState<ProgressFilters>({});
  const [sortBy, setSortBy] = useState<SortBy>('created_at');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>([]);

  // For agents, show only their transactions
  const effectiveAgentId = role === 'agent' ? currentUser?.id : agentId;

  const {
    data: transactions,
    isLoading,
    error,
    connectionStatus
  } = useRealtimeTransactions({
    agentId: effectiveAgentId,
    filters,
    sortBy
  });

  const handleTransactionSelect = (transactionId: string, selected: boolean) => {
    setSelectedTransactionIds(prev => 
      selected 
        ? [...prev, transactionId]
        : prev.filter(id => id !== transactionId)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedTransactionIds(selected ? (transactions?.map(t => t.id) || []) : []);
  };

  const handleViewDetails = (transactionId: string) => {
    window.location.href = `/transactions/${transactionId}`;
  };

  const handleQuickAction = (action: any) => {
    // Handle quick actions like contact client, add task, etc.
    console.log('Quick action:', action);
  };

  if (isLoading) {
    return (
      <div className={`enhanced-transaction-grid ${className}`}>
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-charcoal mx-auto mb-4" />
            <p className="text-brand-charcoal/60 font-brand-body">Loading transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`enhanced-transaction-grid ${className}`}>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <Building className="h-12 w-12 mx-auto mb-2" />
              <p className="font-semibold">Error Loading Transactions</p>
              <p className="text-sm text-gray-600 mt-1">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`enhanced-transaction-grid space-y-6 ${className}`}>
      {/* Connection Status Indicator */}
      {connectionStatus !== 'connected' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-yellow-800 text-sm font-medium">
            Real-time updates {connectionStatus === 'reconnecting' ? 'reconnecting...' : 'disconnected'}
          </p>
        </div>
      )}

      {/* Filter Controls */}
      <ProgressFilterControls
        filters={filters}
        sortBy={sortBy}
        viewMode={viewMode}
        transactionCount={transactions?.length || 0}
        onFilterChange={setFilters}
        onSortChange={setSortBy}
        onViewModeChange={setViewMode}
      />

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Transactions Grid */}
        <div className="xl:col-span-3">
          {transactions && transactions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {transactions.map((transaction) => (
                <TransactionProgressCard
                  key={transaction.id}
                  transaction={transaction}
                  onViewDetails={() => handleViewDetails(transaction.id)}
                  onQuickAction={handleQuickAction}
                  className="transition-transform hover:scale-105"
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Building className="h-16 w-16 text-brand-taupe/40 mx-auto mb-4" />
                <h3 className="text-xl font-brand-heading text-brand-charcoal mb-2">
                  No Transactions Found
                </h3>
                <p className="text-brand-charcoal/60 font-brand-body">
                  {Object.keys(filters).length > 0 || filters.searchQuery
                    ? 'No transactions match your current filters.'
                    : 'No transactions have been created yet.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Performance Panel */}
        <div className="xl:col-span-1">
          <AgentPerformancePanel
            agentId={effectiveAgentId}
            transactions={transactions || []}
          />
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <BulkTransactionActions
        selectedTransactionIds={selectedTransactionIds}
        onClearSelection={() => setSelectedTransactionIds([])}
      />
    </div>
  );
};
