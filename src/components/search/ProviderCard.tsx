'use client';

import Link from 'next/link';
import type { ProviderSearchResult } from '@/types/provider-specialties';

interface ProviderCardProps {
  provider: ProviderSearchResult;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <Link
      href={`/providers/${provider.provider_id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
          {provider.avatar_url ? (
            <img
              src={provider.avatar_url}
              alt={provider.full_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl">
              👤
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="truncate font-semibold">{provider.full_name}</h3>
            {provider.is_verified && (
              <span className="text-blue-600" title="Verificado">
                ✓
              </span>
            )}
          </div>

          {provider.business_name && (
            <p className="mb-2 truncate text-sm text-gray-600">
              {provider.business_name}
            </p>
          )}

          <p className="mb-2 text-sm font-medium text-primary">
            {provider.primary_category_name}
          </p>

          {/* Stats */}
          <div className="mb-2 flex flex-wrap gap-3 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              ⭐ {provider.avg_rating.toFixed(1)} ({provider.total_reviews})
            </span>
            {provider.distance_km && (
              <span className="flex items-center gap-1">
                📍 {provider.distance_km.toFixed(1)} km
              </span>
            )}
            {provider.primary_experience_years && (
              <span className="flex items-center gap-1">
                🏆 {provider.primary_experience_years} anos
              </span>
            )}
          </div>

          {/* Tags */}
          {provider.primary_specialty_tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {provider.primary_specialty_tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-xs"
                >
                  {tag}
                </span>
              ))}
              {provider.primary_specialty_tags.length > 3 && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                  +{provider.primary_specialty_tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex-shrink-0">
          {provider.is_open ? (
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
              Aberto
            </span>
          ) : (
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
              Fechado
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
