'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ProviderSearchResult } from '@/types/search';
import { STATUS_COLORS, STATUS_LABELS } from '@/types/search';
import VerifiedBadge from '@/components/ui/verified-badge/VerifiedBadge';

interface ProviderCardProps {
  provider: ProviderSearchResult;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  const displayName = provider.business_name || provider.full_name || 'Sem nome';
  const hasRatings = provider.total_reviews > 0;

  return (
    <Link
      href={`/providers/${provider.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 
               hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400
               transition-all duration-200 overflow-hidden group"
    >
      {/* Header with Avatar and Status */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {provider.avatar_url ? (
              <Image
                src={provider.avatar_url}
                alt={displayName}
                width={56}
                height={56}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 
                            flex items-center justify-center text-white font-semibold text-lg">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Status Indicator */}
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800
                ${provider.is_open ? 'bg-green-500' : 'bg-gray-400'}`}
              title={provider.is_open ? 'Aberto' : 'Fechado'}
            />
          </div>

          {/* Name and Verification */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate 
                           group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {displayName}
              </h3>
              {provider.is_verified && (
                <VerifiedBadge isVerified={true} size="sm" />
              )}
            </div>

            {/* Location */}
            {provider.location_text && (
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{provider.location_text}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Bio */}
        {provider.bio && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {provider.bio}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          {/* Rating */}
          {hasRatings ? (
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="font-medium text-gray-900 dark:text-white">
                {provider.avg_rating.toFixed(1)}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                ({provider.total_reviews})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="text-sm">Sem avaliações</span>
            </div>
          )}

          {/* Distance */}
          {provider.distance_km !== null && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{provider.distance_km.toFixed(1)} km</span>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${STATUS_COLORS[provider.status_type]}`}
          >
            {STATUS_LABELS[provider.status_type]}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-600 dark:text-blue-400 font-medium 
                         group-hover:underline transition-all">
            Ver perfil
          </span>
          <svg className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
