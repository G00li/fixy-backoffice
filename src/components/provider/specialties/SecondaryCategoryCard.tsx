'use client';

import type { ProviderCategory } from '@/types/provider-specialties';
import { useDeleteSpecialty } from '@/hooks/useProviderSpecialties';

interface SecondaryCategoryCardProps {
  specialty: ProviderCategory;
  onEdit: () => void;
}

const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
  expert: 'Especialista',
};

export function SecondaryCategoryCard({ specialty, onEdit }: SecondaryCategoryCardProps) {
  const deleteMutation = useDeleteSpecialty(specialty.provider_id);

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja remover esta categoria?')) return;
    
    try {
      await deleteMutation.mutateAsync(specialty.id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao remover categoria');
    }
  };

  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {/* Action Buttons */}
      <div className="absolute right-3 top-3 flex gap-1">
        <button
          onClick={onEdit}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          aria-label="Editar"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          aria-label="Remover"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Badges */}
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
          Auxiliar
        </span>
        {specialty.experience_level && (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {EXPERIENCE_LEVEL_LABELS[specialty.experience_level] || specialty.experience_level}
          </span>
        )}
      </div>

      <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
        {specialty.category_name}
      </h4>

      {specialty.years_experience !== null && specialty.years_experience !== undefined && (
        <p className="mb-3 text-xs text-gray-600 dark:text-gray-400">
          {specialty.years_experience} {specialty.years_experience === 1 ? 'ano' : 'anos'} de experiência
        </p>
      )}

      {specialty.custom_description && (
        <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300 line-clamp-2">
          {specialty.custom_description}
        </p>
      )}

      {specialty.specialty_tags && specialty.specialty_tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {specialty.specialty_tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
          {specialty.specialty_tags.length > 3 && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              +{specialty.specialty_tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
