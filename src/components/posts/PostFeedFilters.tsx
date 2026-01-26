'use client';

import { useState, useEffect, useCallback } from 'react';
import { PostFilters } from '@/types/posts';

interface PostFeedFiltersProps {
  onFilterChange: (filters: PostFilters) => void;
  currentFilters?: PostFilters;
}

export default function PostFeedFilters({ 
  onFilterChange, 
  currentFilters = {} 
}: PostFeedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<PostFilters>(currentFilters);
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce search (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== (currentFilters.tags?.[0] || '')) {
        const newFilters = {
          ...localFilters,
          tags: searchTerm ? [searchTerm] : undefined,
        };
        onFilterChange(newFilters);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleFollowingToggle = useCallback(() => {
    const newFilters = {
      ...localFilters,
      following_only: !localFilters.following_only,
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  }, [localFilters, onFilterChange]);

  const handleClearFilters = useCallback(() => {
    setLocalFilters({});
    setSearchTerm('');
    onFilterChange({});
  }, [onFilterChange]);

  const hasActiveFilters = localFilters.following_only || searchTerm;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por tags..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Following Toggle */}
        <button
          onClick={handleFollowingToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            localFilters.following_only
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span className="hidden sm:inline">Seguindo</span>
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span className="hidden sm:inline">Limpar</span>
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {localFilters.following_only && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
              Seguindo apenas
              <button
                onClick={handleFollowingToggle}
                className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {searchTerm && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
              Tag: {searchTerm}
              <button
                onClick={() => setSearchTerm('')}
                className="hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-0.5"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
