'use client';

import { useState } from 'react';
import { useProviderCertifications } from '@/hooks/useProviderCertifications';
import { CertificationCard } from './CertificationCard';
import { CertificationForm } from './CertificationForm';
import type { ProviderCertification } from '@/types/provider-specialties';

interface CertificationsManagerProps {
  providerId: string;
}

export function CertificationsManager({ providerId }: CertificationsManagerProps) {
  const { data: certifications, isLoading } = useProviderCertifications(providerId);
  const [showForm, setShowForm] = useState(false);
  const [editingCertification, setEditingCertification] = useState<ProviderCertification | undefined>(undefined);

  const canAddMore = (certifications?.length || 0) < 20;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className="text-sm text-gray-500 dark:text-gray-400">A carregar certificações...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 lg:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
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
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Minhas Certificações
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {certifications?.length || 0} de 20 certificações
                </p>
              </div>
            </div>
          </div>
          {canAddMore && (
            <button
              onClick={() => {
                setEditingCertification(undefined);
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
              Adicionar Certificação
            </button>
          )}
        </div>

        {certifications && certifications.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certifications.map((cert) => (
              <CertificationCard
                key={cert.id}
                certification={cert}
                onEdit={() => {
                  setEditingCertification(cert);
                  setShowForm(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
              <svg
                className="h-8 w-8 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <h4 className="mb-2 text-base font-semibold text-gray-800 dark:text-white/90">
              Nenhuma certificação adicionada
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Adicione suas certificações para aumentar a confiança dos clientes
            </p>
            <button
              onClick={() => {
                setEditingCertification(undefined);
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
              Adicionar Primeira Certificação
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <CertificationForm
          providerId={providerId}
          editingCertification={editingCertification}
          onClose={() => {
            setShowForm(false);
            setEditingCertification(undefined);
          }}
        />
      )}
    </>
  );
}
