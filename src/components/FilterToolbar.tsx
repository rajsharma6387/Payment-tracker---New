import React from 'react';
import { FilterState, CategoryType, UserProfile } from '../types';
import { 
  Search, 
  Filter, 
  Calendar, 
  X, 
  User, 
  Layers
} from 'lucide-react';

interface FilterToolbarProps {
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  onResetFilters: () => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  resultCount: number;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  currentUser,
  allUsers,
  resultCount,
}) => {
  const isManager = currentUser.role === 'manager';

  const hasActiveFilters = 
    filters.searchQuery.trim() !== '' ||
    filters.category !== 'ALL' ||
    filters.status !== 'ALL' ||
    (isManager && filters.assignedMemberId !== 'ALL') ||
    filters.dateRange !== 'ALL';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Search bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="input-search-customers"
            type="text"
            placeholder="Search by customer name, remarks, or contact..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all placeholder:text-slate-400"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Category Dropdown */}
          <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <select
              id="select-category-filter"
              value={filters.category}
              onChange={(e) => onFilterChange({ category: e.target.value as 'ALL' | CategoryType })}
              className="bg-transparent text-slate-700 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="AMC">AMC</option>
              <option value="Solution">Solution</option>
              <option value="Outstanding">Outstanding</option>
            </select>
          </div>

          {/* Payment Status Dropdown */}
          <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              id="select-status-filter"
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value as FilterState['status'] })}
              className="bg-transparent text-slate-700 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="RECEIVED">Receipt Received</option>
              <option value="NOT_RECEIVED">Not Received</option>
              <option value="PARTIAL">Partially Received</option>
              <option value="OVERDUE">Overdue Only</option>
            </select>
          </div>

          {/* Date Range Dropdown */}
          <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              id="select-date-range"
              value={filters.dateRange}
              onChange={(e) => onFilterChange({ dateRange: e.target.value as FilterState['dateRange'] })}
              className="bg-transparent text-slate-700 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Dates</option>
              <option value="THIS_MONTH">This Month (Sep 2026)</option>
              <option value="NEXT_30_DAYS">Next 30 Days</option>
              <option value="OVERDUE">Past Due</option>
              <option value="CUSTOM">Custom Date Range</option>
            </select>
          </div>

          {/* Manager Only: Filter by Team Member */}
          {isManager && (
            <div className="flex items-center space-x-1 bg-purple-50 border border-purple-200 rounded-lg px-2.5 py-1.5 text-xs text-purple-900">
              <User className="w-3.5 h-3.5 text-purple-600" />
              <select
                id="select-team-member-filter"
                value={filters.assignedMemberId}
                onChange={(e) => onFilterChange({ assignedMemberId: e.target.value })}
                className="bg-transparent text-purple-900 font-medium focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All Team Members</option>
                {allUsers
                  .filter((u) => u.role === 'team_member')
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              id="btn-clear-filters"
              onClick={onResetFilters}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Custom Date Range pickers if selected */}
      {filters.dateRange === 'CUSTOM' && (
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-medium text-slate-600">Custom Date Period:</span>
          <div className="flex items-center space-x-2">
            <label className="text-slate-500">From:</label>
            <input
              type="date"
              value={filters.customStartDate || ''}
              onChange={(e) => onFilterChange({ customStartDate: e.target.value })}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-slate-500">To:</label>
            <input
              type="date"
              value={filters.customEndDate || ''}
              onChange={(e) => onFilterChange({ customEndDate: e.target.value })}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800"
            />
          </div>
        </div>
      )}

      {/* Result feedback bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <div>
          Showing <span className="font-semibold text-slate-800">{resultCount}</span> customer entries
          {!isManager && (
            <span className="text-slate-400 ml-1">
              (Restricted to <span className="font-medium text-slate-700">{currentUser.name}</span>'s portfolio)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
