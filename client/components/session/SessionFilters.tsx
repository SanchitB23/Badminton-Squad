"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Filter, SortAsc, SortDesc, X } from "lucide-react";

export type SessionFilter = {
  status: 'all' | 'responded' | 'not_responded' | 'created_by_me';
  sort: 'start_time' | 'created_at' | 'response_count';
  sortOrder: 'asc' | 'desc';
};

interface SessionFiltersProps {
  filters: SessionFilter;
  onFiltersChange: (filters: SessionFilter) => void;
  totalSessions: number;
  filteredCount: number;
}

export function SessionFilters({
  filters,
  onFiltersChange,
  totalSessions,
  filteredCount,
}: SessionFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof SessionFilter, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      status: 'all',
      sort: 'start_time',
      sortOrder: 'asc',
    });
  };

  const hasActiveFilters = filters.status !== 'all' || filters.sort !== 'start_time' || filters.sortOrder !== 'asc';

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-primary text-primary-foreground rounded-full w-2 h-2" />
              )}
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="gap-2 text-muted-foreground"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            Showing {filteredCount} of {totalSessions} sessions
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  <SelectItem value="responded">I've Responded</SelectItem>
                  <SelectItem value="not_responded">Need Response</SelectItem>
                  <SelectItem value="created_by_me">Created by Me</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort by</label>
              <Select 
                value={filters.sort} 
                onValueChange={(value) => handleFilterChange('sort', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="start_time">Session Time</SelectItem>
                  <SelectItem value="created_at">Created Date</SelectItem>
                  <SelectItem value="response_count">Response Count</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort order</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full justify-start gap-2"
              >
                {filters.sortOrder === 'asc' ? (
                  <>
                    <SortAsc className="h-4 w-4" />
                    Ascending
                  </>
                ) : (
                  <>
                    <SortDesc className="h-4 w-4" />
                    Descending
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}