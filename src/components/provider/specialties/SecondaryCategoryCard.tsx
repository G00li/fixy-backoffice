'use client';

import type { ProviderCategory } from '@/types/provider-specialties';
import { useDeleteSpecialty } from '@/hooks/useProviderSpecialties';

interface SecondaryCategoryCardProps {
  specialty: ProviderCategory;
  onEdit: () => void;
}

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
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
          Auxiliar
        </span>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="rounded p-1 hover:bg-gray-100"
            aria-label="Editar"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="rounded p-1 hover:bg-red-50 disabled:opacity-50"
            aria-label="Remover"
          >
            🗑️
          </button>
        </div>
      </div>

      <h4 className="mb-2 font-semibold">{specialty.category_name}</h4>

      {specialty.years_experience && (
        <p className="mb-2 text-xs text-gray-600">
          {specialty.years_experience} anos
        </p>
      )}

      {specialty.specialty_tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {specialty.specialty_tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
            >
              {tag}
            </span>
          ))}
          {specialty.specialty_tags.length > 3 && (
            <span className="text-xs text-gray-500">
              +{specialty.specialty_tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
