'use client';

import type { ProviderCategory } from '@/types/provider-specialties';

interface PrimaryCategoryCardProps {
  specialty: ProviderCategory;
  onEdit: () => void;
}

export function PrimaryCategoryCard({ specialty, onEdit }: PrimaryCategoryCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              Principal
            </span>
            {specialty.experience_level && (
              <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                {specialty.experience_level}
              </span>
            )}
          </div>
          
          <h4 className="mb-2 text-lg font-semibold">{specialty.category_name}</h4>
          
          {specialty.years_experience && (
            <p className="mb-3 text-sm text-gray-600">
              {specialty.years_experience} anos de experiência
            </p>
          )}

          {specialty.custom_description && (
            <p className="mb-3 text-sm text-gray-700">{specialty.custom_description}</p>
          )}

          {specialty.specialty_tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {specialty.specialty_tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex gap-4 text-sm text-gray-500">
            <span>⭐ {specialty.avg_rating.toFixed(1)}</span>
            <span>📦 {specialty.total_services} serviços</span>
            <span>✅ {specialty.total_bookings} bookings</span>
          </div>
        </div>

        <button
          onClick={onEdit}
          className="ml-4 rounded-lg p-2 hover:bg-gray-100"
          aria-label="Editar"
        >
          ✏️
        </button>
      </div>
    </div>
  );
}
