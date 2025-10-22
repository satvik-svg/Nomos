'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchBar({ 
  onSearch, 
  placeholder = 'Search posts by title, content, or creator...',
  autoFocus = false 
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (query.trim().length < 2) {
      return;
    }

    if (onSearch) {
      onSearch(query.trim());
    } else {
      // Navigate to explore page with search query
      router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
    }
  }, [query, onSearch, router]);

  const handleClear = useCallback(() => {
    setQuery('');
    if (onSearch) {
      onSearch('');
    } else {
      router.push('/explore');
    }
  }, [onSearch, router]);

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className={`relative flex items-center transition-all ${
        isFocused ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-300'
      } rounded-lg bg-white`}>
        {/* Search Icon */}
        <div className="absolute left-3 flex items-center pointer-events-none">
          <svg 
            className="w-5 h-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-20 py-3 text-gray-900 placeholder-gray-500 bg-transparent border-0 focus:outline-none focus:ring-0"
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-16 flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Search Button */}
        <button
          type="submit"
          disabled={query.trim().length < 2}
          className="absolute right-2 px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Search
        </button>
      </div>

      {/* Character Count Helper */}
      {query.length > 0 && query.length < 2 && (
        <p className="mt-1 text-xs text-gray-500">
          Enter at least 2 characters to search
        </p>
      )}
    </form>
  );
}
