
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Grid, List, Columns, X } from 'lucide-react';
import { ProgressFilters, SortBy, ViewMode } from '@/types/progress';

interface ProgressFilterControlsProps {
  filters: ProgressFilters;
  sortBy: SortBy;
  viewMode: ViewMode;
  transactionCount: number;
  onFilterChange: (filters: ProgressFilters) => void;
  onSortChange: (sort: SortBy) => void;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

export const ProgressFilterControls: React.FC<ProgressFilterControlsProps> = ({
  filters,
  sortBy,
  viewMode,
  transactionCount,
  onFilterChange,
  onSortChange,
  onViewModeChange,
  className = ''
}) => {
  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, searchQuery: value });
  };

  const handleServiceFilter = (value: string) => {
    // Treat "all_tiers" as clearing the filter
    const services = (value === 'all_tiers') ? [] : [value];
    onFilterChange({ ...filters, serviceFilter: services });
  };

  const handleStatusFilter = (value: string) => {
    // Treat "all_status" as clearing the filter
    const statuses = (value === 'all_status') ? [] : [value];
    onFilterChange({ ...filters, statusFilter: statuses });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = 
    filters.searchQuery || 
    filters.serviceFilter?.length || 
    filters.statusFilter?.length || 
    filters.riskFilter?.length;

  // Get current filter values for display
  const currentServiceFilter = filters.serviceFilter?.length ? filters.serviceFilter[0] : 'all_tiers';
  const currentStatusFilter = filters.statusFilter?.length ? filters.statusFilter[0] : 'all_status';

  return (
    <div className={`progress-filter-controls ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search properties, clients..."
              value={filters.searchQuery || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          {/* Service Tier Filter */}
          <Select
            value={currentServiceFilter}
            onValueChange={handleServiceFilter}
          >
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Service Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_tiers">All Tiers</SelectItem>
              <SelectItem value="buyer_core">Core</SelectItem>
              <SelectItem value="buyer_elite">Elite</SelectItem>
              <SelectItem value="white_glove_buyer">White Glove</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={currentStatusFilter}
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_status">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="intake">Intake</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort and View Controls */}
        <div className="flex items-center gap-3">
          {/* Sort */}
          <Select value={sortBy} onValueChange={(value: SortBy) => onSortChange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Recent</SelectItem>
              <SelectItem value="closing_date">Closing Date</SelectItem>
              <SelectItem value="risk_level">Risk Level</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="rounded-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('kanban')}
              className="rounded-l-none"
            >
              <Columns className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters and Results */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <>
              <span className="text-sm text-gray-500">Filters:</span>
              {filters.searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {filters.searchQuery}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleSearchChange('')}
                  />
                </Badge>
              )}
              {filters.serviceFilter?.map(service => (
                <Badge key={service} variant="secondary" className="flex items-center gap-1">
                  {service}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleServiceFilter('all_tiers')}
                  />
                </Badge>
              ))}
              {filters.statusFilter?.map(status => (
                <Badge key={status} variant="secondary" className="flex items-center gap-1">
                  {status}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleStatusFilter('all_status')}
                  />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                Clear all
              </Button>
            </>
          )}
        </div>
        
        <div className="text-sm text-gray-500">
          {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};
