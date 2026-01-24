'use client';

import { CategoryFilter } from './CategoryFilter';
import { SpecialtyTagsFilter } from './SpecialtyTagsFilter';
import { LocationFilter } from './LocationFilter';
import { RatingFilter } from './RatingFilter';

interface SearchFiltersProps {
  categoryIds: string[];
  specialtyTags: string[];
  radiusKm: number;
  minRating: number;
  onCategoryChange: (ids: string[]) => void;
  onTagsChange: (tags: string[]) => void;
  onRadiusChange: (radius: number) => void;
  onRatingChange: (rating: number) => void;
  onClearAll: () => void;
}

export function SearchFilters({
  categoryIds,
  specialtyTags,
  radiusKm,
  minRating,
  onCategoryChange,
  onTagsChange,
  onRadiusChange,
  onRatingChange,
  onClearAll,
}: SearchFiltersProps) {
  const hasFilters = categoryIds.length > 0 || specialtyTags.length > 0 || minRating > 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filtros</h2>
        {hasFilters && (
          <button
            onClick={onClearAll}
            className="text-sm text-primary hover:underline"
          >
            Limpar tudo
          </button>
        )}
      </div>

      <div className="space-y-6">
        <CategoryFilter
          selectedIds={categoryIds}
          onChange={onCategoryChange}
        />

        <div className="border-t border-gray-200 pt-6">
          <SpecialtyTagsFilter
            selectedTags={specialtyTags}
            onChange={onTagsChange}
          />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <LocationFilter
            radiusKm={radiusKm}
            onChange={onRadiusChange}
          />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <RatingFilter
            minRating={minRating}
            onChange={onRatingChange}
          />
        </div>
      </div>
    </div>
  );
}
