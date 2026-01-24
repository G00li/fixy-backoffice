'use client';

import { useState } from 'react';
import { useProviderSpecialties } from '@/hooks/useProviderSpecialties';
import { useCategories } from '@/hooks/useCategories';
import { PrimaryCategoryCard } from './PrimaryCategoryCard';
import { SecondaryCategoryCard } from './SecondaryCategoryCard';
import { SpecialtyForm } from './SpecialtyForm';
import type { ProviderCategory } from '@/types/provider-specialties';

interface SpecialtiesManagerProps {
  providerId: string;
}

export function SpecialtiesManager({ providerId }: SpecialtiesManagerProps) {
  const { data: specialties, isLoading } = useProviderSpecialties(providerId);
  const { data: categories } = useCategories(1); // Main categories only
  const [showForm, setShowForm] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<ProviderCategory | undefined>(undefined);

  const primary = specialties?.find((s) => s.category_type === 'primary');
  const secondary = specialties?.filter((s) => s.category_type === 'secondary') || [];
  const canAddSecondary = secondary.length < 2;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className="text-sm text-gray-500 dark:text-gray-400">A carregar especialidades...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Primary Category */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 lg:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
              <svg
                className="h-6 w-6 text-brand-600 dark:text-brand-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Categoria Principal
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Defina sua área de atuação principal
              </p>
            </div>
          </div>

          {primary ? (
            <PrimaryCategoryCard
              specialty={primary}
              onEdit={() => {
                setEditingSpecialty(primary);
                setShowForm(true);
              }}
            />
          ) : (
            <button
              onClick={() => {
                setEditingSpecialty(undefined);
                setShowForm(true);
              }}
              className="w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-colors hover:border-brand-500 hover:bg-brand-50/50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-brand-500 dark:hover:bg-brand-500/5"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                <svg
                  className="h-6 w-6 text-gray-400 dark:text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Adicione sua categoria principal para começar
              </p>
            </button>
          )}
        </div>

        {/* Secondary Categories */}
        {primary && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 lg:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-500/10">
                    <svg
                      className="h-6 w-6 text-purple-600 dark:text-purple-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                      Categorias Auxiliares
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {secondary.length} de 2 categorias adicionadas
                    </p>
                  </div>
                </div>
              </div>
              {canAddSecondary && (
                <button
                  onClick={() => {
                    setEditingSpecialty(undefined);
                    setShowForm(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Adicionar Categoria
                </button>
              )}
            </div>

            {secondary.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {secondary.map((spec) => (
                  <SecondaryCategoryCard
                    key={spec.id}
                    specialty={spec}
                    onEdit={() => {
                      setEditingSpecialty(spec);
                      setShowForm(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nenhuma categoria auxiliar adicionada
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <SpecialtyForm
          providerId={providerId}
          editingSpecialty={editingSpecialty}
          categories={categories || []}
          existingSpecialties={specialties || []}
          onClose={() => {
            setShowForm(false);
            setEditingSpecialty(undefined);
          }}
        />
      )}
    </>
  );
}
