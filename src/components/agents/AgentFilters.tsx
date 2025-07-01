
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, Filter, X } from "lucide-react";
import { format } from "date-fns";

interface FilterOptions {
  search: string;
  status: string;
  brokerage: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  invitedBy: string;
  hasOnboarded: string;
}

interface AgentFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  brokerages: string[];
  coordinators: Array<{ id: string; name: string }>;
}

export const AgentFilters = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  brokerages,
  coordinators 
}: AgentFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== null && value !== '' && value !== 'all'
  );

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      value !== null && value !== '' && value !== 'all'
    ).length;
  };

  return (
    <div className="space-y-4">
      {/* Basic Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search agents by name, email, or phone..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {getActiveFilterCount()}
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Invitation Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Brokerage Filter */}
            <div>
              <Label>Brokerage</Label>
              <Select value={filters.brokerage} onValueChange={(value) => updateFilter('brokerage', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All brokerages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brokerages</SelectItem>
                  {brokerages.map((brokerage) => (
                    <SelectItem key={brokerage} value={brokerage}>
                      {brokerage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Invited By Filter */}
            <div>
              <Label>Invited By</Label>
              <Select value={filters.invitedBy} onValueChange={(value) => updateFilter('invitedBy', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All coordinators" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Coordinators</SelectItem>
                  {coordinators.map((coordinator) => (
                    <SelectItem key={coordinator.id} value={coordinator.id}>
                      {coordinator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Onboarding Status */}
            <div>
              <Label>Onboarding</Label>
              <Select value={filters.hasOnboarded} onValueChange={(value) => updateFilter('hasOnboarded', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All agents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  <SelectItem value="completed">Onboarded</SelectItem>
                  <SelectItem value="pending">Not Onboarded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center space-x-4">
            <Label>Date Range:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    {filters.dateFrom ? format(filters.dateFrom, "MMM dd, yyyy") : "From"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom || undefined}
                  onSelect={(date) => updateFilter('dateFrom', date || null)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <span className="text-gray-500">to</span>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    {filters.dateTo ? format(filters.dateTo, "MMM dd, yyyy") : "To"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateTo || undefined}
                  onSelect={(date) => updateFilter('dateTo', date || null)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm font-medium text-gray-700">Active Filters:</span>
              {filters.search && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Search: {filters.search}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('search', '')}
                  />
                </Badge>
              )}
              {filters.status !== 'all' && filters.status && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Status: {filters.status}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('status', 'all')}
                  />
                </Badge>
              )}
              {filters.brokerage !== 'all' && filters.brokerage && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Brokerage: {filters.brokerage}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('brokerage', 'all')}
                  />
                </Badge>
              )}
              {filters.dateFrom && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>From: {format(filters.dateFrom, "MMM dd")}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('dateFrom', null)}
                  />
                </Badge>
              )}
              {filters.dateTo && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>To: {format(filters.dateTo, "MMM dd")}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('dateTo', null)}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
