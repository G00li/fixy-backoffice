'use client';

import type { ProviderCategory } from '@/types/provider-specialties';

interface PrimaryCategoryCardProps {
  specialty: ProviderCategory;
  onEdit: () => void;
}

const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
  expert: 'Especialista',
};

export function PrimaryCategoryCard({ specialty, onEdit }: PrimaryCategoryCardProps) {
  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {/* Edit Button */}
      <button
        onClick={onEdit}
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        aria-label="Editar"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>

      {/* Badges */}
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
          Principal
        </span>
        {specialty.experience_level && (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {EXPERIENCE_LEVEL_LABELS[specialty.experience_level] || specialty.experience_level}
          </span>
        )}
      </div>

      {/* Years of Experience */}
      {specialty.years_experience !== null && specialty.years_experience !== undefined && (
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          {specialty.years_experience} {specialty.years_experience === 1 ? 'ano' : 'anos'} de experiência
        </p>
      )}

      {/* Description */}
      {specialty.custom_description && (
        <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {specialty.custom_description}
        </p>
      )}

      {/* Stats */}
      <div className="mb-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
          <span className="text-base">⭐</span>
          <span>{specialty.avg_rating.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
          <span className="text-base">💼</span>
          <span>{specialty.total_services} serviços</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
          <span className="text-base">✅</span>
          <span>{specialty.total_bookings} bookings</span>
        </div>
      </div>

      {/* Tags */}
      {specialty.specialty_tags && specialty.specialty_tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {specialty.specialty_tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
