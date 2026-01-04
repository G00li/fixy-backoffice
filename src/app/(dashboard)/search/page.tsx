'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '@/components/search/SearchBar';
import ProviderSearchFilters from '@/components/search/ProviderSearchFilters';
import ProviderSearchResults from '@/components/search/ProviderSearchResults';
import { searchProviders, getCategories } from '@/app/actions/search';
import { SearchFilters, ProviderSearchResult, Category } from '@/types/search';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<ProviderSearchResult[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      const result = await getCategories();
      if (result.success && result.categories) {
        setCategories(result.categories);
      }
    };
    loadCategories();
  }, []);

  // Perform search
  const performSearch = useCallback(
    async (newPage: number = 1, appendResults: boolean = false) => {
      setLoading(true);

      try {
        const result = await searchProviders({
          searchText: searchQuery,
          ...filters,
          page: newPage,
          limit: 20,
        });

        if (result.success && result.results) {
          if (appendResults) {
            setResults((prev) => [...prev, ...result.results!]);
          } else {
            setResults(result.results);
          }

          setTotalResults(result.total || 0);
          setHasMore(result.totalPages ? newPage < result.totalPages : false);
          setPage(newPage);
        } else {
          console.error('Search error:', result.error);
          if (!appendResults) {
            setResults([]);
            setTotalResults(0);
            setHasMore(false);
          }
        }
      } catch (error) {
        console.error('Unexpected search error:', error);
        if (!appendResults) {
          setResults([]);
          setTotalResults(0);
          setHasMore(false);
        }
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, filters]
  );

  // Search when query or filters change
  useEffect(() => {
    performSearch(1, false);
  }, [performSearch]);

  // Handle search input
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  // Handle load more
  const handleLoadMore = () => {
    performSearch(page + 1, true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Buscar Prestadores
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Encontre os melhores profissionais perto de você
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            initialValue={searchQuery}
            onSearch={handleSearch}
            placeholder="Buscar por nome, serviço ou localização..."
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6">
              <ProviderSearchFilters
                initialFilters={filters}
                categories={categories}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
              />
            </div>
          </aside>

          {/* Results */}
          <main className="lg:col-span-3">
            <ProviderSearchResults
              results={results}
              loading={loading}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              totalResults={totalResults}
              searchQuery={searchQuery}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
