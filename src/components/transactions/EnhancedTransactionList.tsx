
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TransactionListWithBulk } from './TransactionListWithBulk';
import { TransactionFilters } from './TransactionFilters';
import { useTransactionFilters } from '@/hooks/useTransactionFilters';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

type TransactionWithRelations = Database['public']['Tables']['transactions']['Row'] & {
  clients: Database['public']['Tables']['clients']['Row'][] | null;
  tasks: Database['public']['Tables']['tasks']['Row'][] | null;
};

interface EnhancedTransactionListProps {
  className?: string;
}

export const EnhancedTransactionList: React.FC<EnhancedTransactionListProps> = ({
  className = ''
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch all transactions
  const { data: transactions = [], isLoading, refetch } = useQuery({
    queryKey: ['transactions-enhanced'],
    queryFn: async (): Promise<TransactionWithRelations[]> => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          clients (*),
          tasks (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load transactions",
        });
        throw error;
      }
      return data as TransactionWithRelations[];
    },
  });

  // Use the filter hook
  const {
    filters,
    setFilters,
    filteredTransactions,
    savedFilters,
    saveFilter,
    loadFilter,
    filterStats
  } = useTransactionFilters(transactions);

  const handleTransactionClick = (id: string) => {
    navigate(`/transactions/${id}`);
  };

  const handleSuccess = () => {
    refetch();
  };

  return (
    <div className={`enhanced-transaction-list space-y-6 ${className}`}>
      {/* Filter Interface */}
      <TransactionFilters
        filters={filters}
        onFiltersChange={setFilters}
        savedFilters={savedFilters}
        onSaveFilter={saveFilter}
        onLoadFilter={loadFilter}
      />

      {/* Filter Results Summary */}
      {filterStats.hasActiveFilters && (
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Showing <strong>{filterStats.filtered}</strong> of <strong>{filterStats.total}</strong> transactions
                </span>
                {filterStats.hidden > 0 && (
                  <Badge variant="outline">
                    {filterStats.hidden} hidden by filters
                  </Badge>
                )}
              </div>
              <Badge variant="secondary">
                {filterStats.activeFilterCount} filter{filterStats.activeFilterCount !== 1 ? 's' : ''} active
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction List */}
      <TransactionListWithBulk
        transactions={filteredTransactions}
        isLoading={isLoading}
        onTransactionClick={handleTransactionClick}
        enableBulkActions={true}
        onSuccess={handleSuccess}
      />
    </div>
  );
};
