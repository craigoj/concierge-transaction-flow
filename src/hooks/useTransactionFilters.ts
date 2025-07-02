
import { useState, useMemo, useCallback } from 'react';
import { TransactionFilterState } from '@/components/transactions/TransactionFilters';
import { Database } from '@/integrations/supabase/types';
import { isWithinInterval, parseISO } from 'date-fns';

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
  clients?: Database['public']['Tables']['clients']['Row'][];
  tasks?: Database['public']['Tables']['tasks']['Row'][];
};

const initialFilters: TransactionFilterState = {
  search: '',
  status: 'all',
  serviceTier: 'all',
  priceMin: '',
  priceMax: '',
  dateRange: undefined,
  agent: '',
  city: '',
  state: ''
};

export const useTransactionFilters = (transactions: Transaction[] = []) => {
  const [filters, setFilters] = useState<TransactionFilterState>(initialFilters);
  const [savedFilters, setSavedFilters] = useState<Array<{ name: string; filters: TransactionFilterState }>>([]);

  // Filter transactions based on current filter state
  const filteredTransactions = useMemo(() => {
    if (!transactions.length) return [];

    return transactions.filter((transaction) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesAddress = transaction.property_address?.toLowerCase().includes(searchTerm);
        const matchesCity = transaction.city?.toLowerCase().includes(searchTerm);
        const matchesClient = transaction.clients?.some(client => 
          client.full_name?.toLowerCase().includes(searchTerm)
        );
        
        if (!matchesAddress && !matchesCity && !matchesClient) {
          return false;
        }
      }

      // Status filter
      if (filters.status !== 'all' && transaction.status !== filters.status) {
        return false;
      }

      // Service tier filter
      if (filters.serviceTier !== 'all' && transaction.service_tier !== filters.serviceTier) {
        return false;
      }

      // Price range filter
      if (filters.priceMin && transaction.purchase_price) {
        if (Number(transaction.purchase_price) < Number(filters.priceMin)) {
          return false;
        }
      }

      if (filters.priceMax && transaction.purchase_price) {
        if (Number(transaction.purchase_price) > Number(filters.priceMax)) {
          return false;
        }
      }

      // City filter
      if (filters.city && !transaction.city?.toLowerCase().includes(filters.city.toLowerCase())) {
        return false;
      }

      // State filter
      if (filters.state && !transaction.state?.toLowerCase().includes(filters.state.toLowerCase())) {
        return false;
      }

      // Date range filter
      if (filters.dateRange && transaction.closing_date) {
        try {
          const closingDate = parseISO(transaction.closing_date);
          const { from, to } = filters.dateRange;
          
          if (from && to) {
            if (!isWithinInterval(closingDate, { start: from, end: to })) {
              return false;
            }
          } else if (from) {
            if (closingDate < from) {
              return false;
            }
          } else if (to) {
            if (closingDate > to) {
              return false;
            }
          }
        } catch (error) {
          // Invalid date, skip this filter
        }
      }

      return true;
    });
  }, [transactions, filters]);

  // Save a filter preset
  const saveFilter = useCallback((name: string, filterState: TransactionFilterState) => {
    setSavedFilters(prev => [
      ...prev.filter(f => f.name !== name), // Remove existing filter with same name
      { name, filters: filterState }
    ]);
  }, []);

  // Load a saved filter
  const loadFilter = useCallback((filterState: TransactionFilterState) => {
    setFilters(filterState);
  }, []);

  // Remove a saved filter
  const removeSavedFilter = useCallback((name: string) => {
    setSavedFilters(prev => prev.filter(f => f.name !== name));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  // Get filter summary stats
  const filterStats = useMemo(() => {
    const total = transactions.length;
    const filtered = filteredTransactions.length;
    const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
      if (key === 'search') return value !== '';
      if (key === 'status' || key === 'serviceTier') return value !== 'all';
      if (key === 'dateRange') return value !== undefined;
      return value !== '' && value !== undefined;
    }).length;

    return {
      total,
      filtered,
      hidden: total - filtered,
      activeFilterCount,
      hasActiveFilters: activeFilterCount > 0
    };
  }, [transactions.length, filteredTransactions.length, filters]);

  return {
    filters,
    setFilters,
    filteredTransactions,
    savedFilters,
    saveFilter,
    loadFilter,
    removeSavedFilter,
    resetFilters,
    filterStats
  };
};
