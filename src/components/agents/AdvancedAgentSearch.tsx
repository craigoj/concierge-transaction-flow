
import { useState, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Search, Filter, X, Calendar as CalendarIcon, SlidersHorizontal } from "lucide-react";
import { format } from "date-fns";

interface SearchFilters {
  searchTerm: string;
  status: string;
  brokerage: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  experience: string;
  location: string;
}

interface AdvancedAgentSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  availableBrokerages: string[];
}

export const AdvancedAgentSearch = ({ onFiltersChange, availableBrokerages }: AdvancedAgentSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    status: 'all',
    brokerage: 'all',
    dateRange: { from: null, to: null },
    experience: 'all',
    location: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  }, [filters, onFiltersChange]);

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      searchTerm: '',
      status: 'all',
      brokerage: 'all',
      dateRange: { from: null, to: null },
      experience: 'all',
      location: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.status !== 'all') count++;
    if (filters.brokerage !== 'all') count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.experience !== 'all') count++;
    if (filters.location) count++;
    return count;
  }, [filters]);

  return (
    <div className="space-y-4">
      {/* Basic Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search agents by name, email, or phone..."
            value={filters.searchTerm}
            onChange={(e) => updateFilters({ searchTerm: e.target.value })}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={filters.status} onValueChange={(value) => updateFilters({ status: value })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Active</SelectItem>
              <SelectItem value="sent">Invited</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showAdvanced ? "default" : "outline"}
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Advanced
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          {/* Brokerage Filter */}
          <div className="space-y-2">
            <Label>Brokerage</Label>
            <Select value={filters.brokerage} onValueChange={(value) => updateFilters({ brokerage: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All Brokerages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brokerages</SelectItem>
                {availableBrokerages.map((brokerage) => (
                  <SelectItem key={brokerage} value={brokerage}>
                    {brokerage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Experience Filter */}
          <div className="space-y-2">
            <Label>Experience Level</Label>
            <Select value={filters.experience} onValueChange={(value) => updateFilters({ experience: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="0-2">0-2 years</SelectItem>
                <SelectItem value="3-5">3-5 years</SelectItem>
                <SelectItem value="6-10">6-10 years</SelectItem>
                <SelectItem value="10+">10+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              placeholder="City, State, ZIP"
              value={filters.location}
              onChange={(e) => updateFilters({ location: e.target.value })}
            />
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label>Registration Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                        {format(filters.dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange.from || new Date()}
                  selected={{
                    from: filters.dateRange.from || undefined,
                    to: filters.dateRange.to || undefined,
                  }}
                  onSelect={(range) =>
                    updateFilters({
                      dateRange: {
                        from: range?.from || null,
                        to: range?.to || null,
                      },
                    })
                  }
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.searchTerm}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters({ searchTerm: '' })}
              />
            </Badge>
          )}
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters({ status: 'all' })}
              />
            </Badge>
          )}
          {filters.brokerage !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Brokerage: {filters.brokerage}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters({ brokerage: 'all' })}
              />
            </Badge>
          )}
          {filters.location && (
            <Badge variant="secondary" className="gap-1">
              Location: {filters.location}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters({ location: '' })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
