
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MapPin, User, Building, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/use-debounce';

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
  clients?: Database['public']['Tables']['clients']['Row'][];
};

interface QuickSearchProps {
  className?: string;
  placeholder?: string;
}

export const QuickSearch: React.FC<QuickSearchProps> = ({
  className = '',
  placeholder = 'Quick search transactions...'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  // Debounce the search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Search query
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['transaction-search', debouncedSearchTerm],
    queryFn: async (): Promise<Transaction[]> => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        return [];
      }

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          clients (*)
        `)
        .or(`property_address.ilike.%${debouncedSearchTerm}%,city.ilike.%${debouncedSearchTerm}%,state.ilike.%${debouncedSearchTerm}%`)
        .limit(10)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: debouncedSearchTerm.length >= 2
  });

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.quick-search-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTransactionSelect = (transaction: Transaction) => {
    navigate(`/transactions/${transaction.id}`);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    setIsOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'intake': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`quick-search-container relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && debouncedSearchTerm.length >= 2 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map((transaction) => (
                  <button
                    key={transaction.id}
                    onClick={() => handleTransactionSelect(transaction)}
                    className="w-full text-left p-4 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {transaction.property_address}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {transaction.city}, {transaction.state}
                          </div>
                          {transaction.clients && transaction.clients.length > 0 && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {transaction.clients[0].full_name}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status.toUpperCase()}
                        </span>
                        {transaction.purchase_price && (
                          <span className="text-sm font-medium text-gray-700">
                            ${transaction.purchase_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No transactions found for "{debouncedSearchTerm}"
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
