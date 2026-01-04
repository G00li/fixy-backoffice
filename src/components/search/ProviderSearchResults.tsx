'use client';

import { useState } from 'react';
import { ProviderSearchResult } from '@/types/search';
import ProviderCard from './ProviderCard';

interface ProviderSearchResultsProps {
  results: ProviderSearchResult[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  totalResults?: number;
  searchQuery?: string;
}

export default function ProviderSearchResults({
  results,
  loading = false,
  hasMore = false,
  onLoadMore,
  totalResults,
  searchQuery,
}: ProviderSearchResultsProps) {
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (onLoadMore && !loadingMore) {
      setLoadingMore(true);
      await onLoadMore();
      setLoadingMore(false);
    }
  };

  // Loading state
  if (loading && results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Buscando prestadores...</p>
      </div>
    );
  }

  // Empty state
  if (!loading && results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Nenhum prestador encontrado
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          {searchQuery
            ? `Não encontramos resultados para "${searchQuery}". Tente ajustar os filtros ou buscar por outro termo.`
            : 'Tente ajustar os filtros ou realizar uma nova busca.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      {totalResults !== undefined && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {totalResults === 1 ? (
              <span>1 prestador encontrado</span>
            ) : (
              <span>{totalResults} prestadores encontrados</span>
            )}
            {searchQuery && (
              <span className="ml-1">
                para <span className="font-medium text-gray-900 dark:text-white">"{searchQuery}"</span>
              </span>
            )}
          </p>
        </div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-6">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
                     text-white font-medium rounded-lg transition-colors
                     flex items-center gap-2 disabled:cursor-not-allowed"
          >
            {loadingMore ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Carregando...</span>
              </>
            ) : (
              <span>Carregar mais</span>
            )}
          </button>
        </div>
      )}

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      )}
    </div>
  );
}
