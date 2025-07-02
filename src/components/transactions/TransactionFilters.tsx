
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, X, Save, Star } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Database } from '@/integrations/supabase/types';

type TransactionStatus = Database['public']['Enums']['transaction_status'];
type ServiceTier = Database['public']['Enums']['service_tier_type'];

export interface TransactionFilterState {
  search: string;
  status: TransactionStatus | 'all';
  serviceTier: ServiceTier | 'all';
  priceMin: string;
  priceMax: string;
  dateRange: DateRange | undefined;
  agent: string;
  city: string;
  state: string;
}

interface TransactionFiltersProps {
  filters: TransactionFilterState;
  onFiltersChange: (filters: TransactionFilterState) => void;
  onSaveFilter?: (name: string, filters: TransactionFilterState) => void;
  savedFilters?: Array<{ name: string; filters: TransactionFilterState }>;
  onLoadFilter?: (filters: TransactionFilterState) => void;
  className?: string;
}

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

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onFiltersChange,
  onSaveFilter,
  savedFilters = [],
  onLoadFilter,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const updateFilter = (key: keyof TransactionFilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange(initialFilters);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'search') return value !== '';
    if (key === 'status' || key === 'serviceTier') return value !== 'all';
    if (key === 'dateRange') return value !== undefined;
    return value !== '' && value !== undefined;
  });

  const getActiveFilterCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'search') return value !== '';
      if (key === 'status' || key === 'serviceTier') return value !== 'all';
      if (key === 'dateRange') return value !== undefined;
      return value !== '' && value !== undefined;
    }).length;
  };

  const handleSaveFilter = () => {
    if (saveFilterName.trim() && onSaveFilter) {
      onSaveFilter(saveFilterName.trim(), filters);
      setSaveFilterName('');
      setShowSaveDialog(false);
    }
  };

  return (
    <Card className={`transaction-filters ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-1"
            >
              <Filter className="h-4 w-4" />
              {isExpanded ? 'Less' : 'More'} Filters
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Primary Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by address, client name, or notes..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="intake">Intake</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.serviceTier} onValueChange={(value) => updateFilter('serviceTier', value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Service Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="buyer_core">Core Buyer</SelectItem>
              <SelectItem value="buyer_elite">Elite Buyer</SelectItem>
              <SelectItem value="white_glove_buyer">White Glove Buyer</SelectItem>
              <SelectItem value="listing_core">Core Listing</SelectItem>
              <SelectItem value="listing_elite">Elite Listing</SelectItem>
              <SelectItem value="white_glove_listing">White Glove Listing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Saved Filters */}
        {savedFilters.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2 flex items-center gap-1">
              <Star className="h-4 w-4" />
              Saved Filters
            </div>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map((saved, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onLoadFilter?.(saved.filters)}
                  className="gap-1"
                >
                  {saved.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        {isExpanded && (
          <>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Price Range</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={filters.priceMin}
                    onChange={(e) => updateFilter('priceMin', e.target.value)}
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={filters.priceMax}
                    onChange={(e) => updateFilter('priceMax', e.target.value)}
                  />
                </div>
              </div>

              {/* Location Filters */}
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Input
                  placeholder="Enter city"
                  value={filters.city}
                  onChange={(e) => updateFilter('city', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">State</label>
                <Input
                  placeholder="Enter state"
                  value={filters.state}
                  onChange={(e) => updateFilter('state', e.target.value)}
                />
              </div>

              {/* Date Range */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Closing Date Range</label>
                <DatePickerWithRange
                  date={filters.dateRange}
                  onDateChange={(dateRange) => updateFilter('dateRange', dateRange)}
                />
              </div>
            </div>

            {/* Save Filter */}
            {hasActiveFilters && onSaveFilter && (
              <div className="pt-4 border-t">
                {!showSaveDialog ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSaveDialog(true)}
                    className="gap-1"
                  >
                    <Save className="h-4 w-4" />
                    Save Current Filter
                  </Button>
                ) : (
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Filter name"
                      value={saveFilterName}
                      onChange={(e) => setSaveFilterName(e.target.value)}
                      className="max-w-xs"
                    />
                    <Button size="sm" onClick={handleSaveFilter}>
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSaveDialog(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
