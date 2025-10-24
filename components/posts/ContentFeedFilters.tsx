'use client';

import { useState } from 'react';

export interface FilterOptions {
  contentType: 'all' | 'free' | 'premium';
  sortBy: 'recent' | 'popular' | 'trending';
  creatorOnly: boolean;
}

interface ContentFeedFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  showCreatorFilter?: boolean;
}

export default function ContentFeedFilters({ 
  filters, 
  onFilterChange,
  showCreatorFilter = true 
}: ContentFeedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleContentTypeChange = (contentType: FilterOptions['contentType']) => {
    onFilterChange({ ...filters, contentType });
  };

  const handleSortChange = (sortBy: FilterOptions['sortBy']) => {
    onFilterChange({ ...filters, sortBy });
  };

  const handleCreatorToggle = () => {
    onFilterChange({ ...filters, creatorOnly: !filters.creatorOnly });
  };

  const handleReset = () => {
    onFilterChange({
      contentType: 'all',
      sortBy: 'recent',
      creatorOnly: false
    });
  };

  const hasActiveFilters = 
    filters.contentType !== 'all' || 
    filters.sortBy !== 'recent' || 
    filters.creatorOnly;

  return (
    <div className="bg-black border border-gray-200 rounded-lg p-4 mb-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h3 className="text-sm font-semibold text-white">Filters</h3>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs font-medium bg-black  rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Reset
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg 
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Type Filter - Always Visible */}
      <div className="flex space-x-2 pb-4 border-b border-gray-200">
        <button
          onClick={() => handleContentTypeChange('all')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filters.contentType === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Posts
        </button>
        <button
          onClick={() => handleContentTypeChange('free')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filters.contentType === 'free'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Free
        </button>
        <button
          onClick={() => handleContentTypeChange('premium')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filters.contentType === 'premium'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>Premium</span>
          </span>
        </button>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="pt-4 space-y-4">
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleSortChange('recent')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filters.sortBy === 'recent'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => handleSortChange('popular')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filters.sortBy === 'popular'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Popular
              </button>
              <button
                onClick={() => handleSortChange('trending')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filters.sortBy === 'trending'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Trending
              </button>
            </div>
          </div>

          {/* Creator Filter */}
          {showCreatorFilter && (
            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.creatorOnly}
                  onChange={handleCreatorToggle}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Show creator posts only
                </span>
              </label>
              <p className="mt-1 text-xs text-gray-500 ml-6">
                Filter posts from verified creators
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
