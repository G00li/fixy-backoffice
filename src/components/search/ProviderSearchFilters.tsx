'use client';

import { useState, useEffect } from 'react';
import { CloseIcon, ChevronDownIcon } from '@/icons';
import { SearchFilters, Category, SORT_OPTIONS, RADIUS_OPTIONS, SEARCH_VALIDATION } from '@/types/search';

interface ProviderSearchFiltersProps {
  initialFilters?: SearchFilters;
  categories: Category[];
  onFilterChange: (filters: SearchFilters) => void;
  onClear: () => void;
  className?: string;
}

export default function ProviderSearchFilters({
  initialFilters = {},
  categories,
  onFilterChange,
  onClear,
  className = '',
}: ProviderSearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update filters when they change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleCategoryChange = (categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      categoryId: categoryId === '' ? undefined : categoryId,
    }));
  };

  const handleRadiusChange = (radius: number) => {
    setFilters((prev) => ({
      ...prev,
      radiusKm: radius,
    }));
  };

  const handleMinRatingChange = (rating: number) => {
    setFilters((prev) => ({
      ...prev,
      minRating: rating,
    }));
  };

  const handleSortChange = (sortBy: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: sortBy as any,
    }));
  };

  const handleShowClosedToggle = () => {
    setFilters((prev) => ({
      ...prev,
      showClosed: !prev.showClosed,
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
    onClear();
  };

  const hasActiveFilters =
    filters.categoryId ||
    filters.radiusKm !== SEARCH_VALIDATION.DEFAULT_RADIUS_KM ||
    filters.minRating ||
    filters.sortBy !== 'relevance' ||
    filters.showClosed === false;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h3 className="font-semibold text-gray-900 dark:text-white">Filtros</h3>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 
                             text-blue-800 dark:text-blue-200 rounded-full">
                Ativos
              </span>
            )}
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ChevronDownIcon className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters Body */}
      <div className={`p-4 space-y-4 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Categoria
          </label>
          <select
            value={filters.categoryId || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Radius Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Raio de busca
          </label>
          <select
            value={filters.radiusKm || SEARCH_VALIDATION.DEFAULT_RADIUS_KM}
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {RADIUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Min Rating Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Avaliação mínima
          </label>
          <div className="flex gap-2">
            {[0, 3, 4, 4.5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleMinRatingChange(rating)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    (filters.minRating || 0) === rating
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                {rating === 0 ? 'Todas' : `${rating}+`}
              </button>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ordenar por
          </label>
          <select
            value={filters.sortBy || 'relevance'}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Show Closed Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Mostrar fechados
          </label>
          <button
            onClick={handleShowClosedToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${filters.showClosed !== false ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${filters.showClosed !== false ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 
                     bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                     hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <CloseIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Limpar filtros</span>
          </button>
        )}
      </div>
    </div>
  );
}
