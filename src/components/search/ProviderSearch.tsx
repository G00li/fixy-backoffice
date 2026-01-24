'use client';

import { useState } from 'react';
import { useProviderSearch } from '@/hooks/useProviderSearch';
import { SearchBar } from './SearchBar';
import { SearchFilters } from './SearchFilters';
import { ProviderList } from './ProviderList';

export function ProviderSearch() {
  const [searchText, setSearchText] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [specialtyTags, setSpecialtyTags] = useState<string[]>([]);
  const [radiusKm, setRadiusKm] = useState(20);
  const [minRating, setMinRating] = useState(0);

  const { data, isLoading, error } = useProviderSearch({
    search_text: searchText || undefined,
    category_ids: categoryIds.length > 0 ? categoryIds : undefined,
    specialty_tags: specialtyTags.length > 0 ? specialtyTags : undefined,
    radius_km: radiusKm,
    min_rating: minRating,
    limit: 20,
    offset: 0,
  });

  const handleClearFilters = () => {
    setCategoryIds([]);
    setSpecialtyTags([]);
    setMinRating(0);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* Filters Sidebar */}
      <aside className="lg:sticky lg:top-6 lg:h-fit">
        <SearchFilters
          categoryIds={categoryIds}
          specialtyTags={specialtyTags}
          radiusKm={radiusKm}
          minRating={minRating}
          onCategoryChange={setCategoryIds}
          onTagsChange={setSpecialtyTags}
          onRadiusChange={setRadiusKm}
          onRatingChange={setMinRating}
          onClearAll={handleClearFilters}
        />
      </aside>

      {/* Main Content */}
      <main>
        <div className="mb-6">
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Buscar por nome, categoria ou especialidade..."
          />
        </div>

        {data && (
          <div className="mb-4 text-sm text-gray-600">
            {data.pagination.total} profissionais encontrados
          </div>
        )}

        <ProviderList
          providers={data?.data || []}
          isLoading={isLoading}
          error={error}
        />

        {data && data.pagination.has_more && (
          <div className="mt-6 text-center">
            <button className="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-50">
              Carregar mais
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
