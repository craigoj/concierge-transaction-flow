
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransactionProgressCard } from './TransactionProgressCard';
import { ProgressFilterControls } from './ProgressFilterControls';
import { AgentPerformancePanel } from './AgentPerformancePanel';
import { useRealtimeTransactions } from '@/hooks/useRealtimeTransactions';
import { TransactionWithProgress, ProgressFilters, SortBy, ViewMode, QuickAction } from '@/types/progress';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MultiTransactionProgressGridProps {
  agentId?: string;
  className?: string;
}

export const MultiTransactionProgressGrid: React.FC<MultiTransactionProgressGridProps> = ({
  agentId,
  className = ''
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [filters, setFilters] = useState<ProgressFilters>({});
  const [sortBy, setSortBy] = useState<SortBy>('created_at');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const { data: transactions, isLoading, error, connectionStatus } = useRealtimeTransactions({
    agentId,
    filters,
    sortBy
  });

  // Calculate grid columns based on screen size and view mode
  const getGridClassName = useMemo(() => {
    switch (viewMode) {
      case 'list':
        return 'grid grid-cols-1 gap-4';
      case 'kanban':
        return 'flex flex-col md:flex-row gap-6';
      default: // grid
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
    }
  }, [viewMode]);

  const handleFilterChange = (newFilters: ProgressFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSort: SortBy) => {
    setSortBy(newSort);
  };

  const handleViewDetails = (transactionId: string) => {
    navigate(`/transactions/${transactionId}`);
  };

  const handleQuickAction = (action: QuickAction) => {
    switch (action.action) {
      case 'contact_client':
        toast({
          title: "Contact Client",
          description: "Opening client contact options...",
        });
        break;
      case 'add_task':
        toast({
          title: "Add Task",
          description: "Opening task creation dialog...",
        });
        break;
      case 'escalate':
        toast({
          title: "Escalate Transaction",
          description: "Escalating to coordinator...",
        });
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        <div className="text-center">
          <p className="text-lg font-medium">Error loading transactions</p>
          <p className="text-sm text-gray-500 mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`multi-transaction-progress-grid ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Transaction Progress</h2>
        <div className="flex items-center gap-2">
          <Badge 
            variant={connectionStatus === 'connected' ? 'default' : 'destructive'}
            className="flex items-center gap-1"
          >
            {connectionStatus === 'connected' ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            {connectionStatus === 'connected' ? 'Live' : 'Offline'}
          </Badge>
        </div>
      </div>

      {/* Filter Controls */}
      <ProgressFilterControls
        filters={filters}
        sortBy={sortBy}
        viewMode={viewMode}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onViewModeChange={setViewMode}
        transactionCount={transactions?.length || 0}
        className="mb-6"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading transactions...</span>
              </div>
            </div>
          ) : !transactions?.length ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <p className="text-lg font-medium">No transactions found</p>
                <p className="text-sm mt-1">Try adjusting your filters or create a new transaction</p>
              </div>
            </div>
          ) : (
            <div className={getGridClassName}>
              {transactions.map((transaction) => (
                <TransactionProgressCard
                  key={transaction.id}
                  transaction={transaction}
                  onViewDetails={() => handleViewDetails(transaction.id)}
                  onQuickAction={handleQuickAction}
                />
              ))}
            </div>
          )}
        </div>

        {/* Performance Panel */}
        <div className="lg:col-span-1">
          <AgentPerformancePanel
            agentId={agentId}
            transactions={transactions || []}
          />
        </div>
      </div>
    </div>
  );
};
