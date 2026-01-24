'use client';

import { useState } from 'react';
import { useProviderPortfolio } from '@/hooks/useProviderPortfolio';
import { PortfolioGrid } from './PortfolioGrid';
import { PortfolioForm } from './PortfolioForm';
import type { ProviderPortfolioItem } from '@/types/provider-specialties';

interface PortfolioManagerProps {
  providerId: string;
}

export function PortfolioManager({ providerId }: PortfolioManagerProps) {
  const { data: items, isLoading } = useProviderPortfolio(providerId);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ProviderPortfolioItem | undefined>(undefined);

  const canAddMore = (items?.length || 0) < 50;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className="text-sm text-gray-500 dark:text-gray-400">A carregar portfolio...</p>
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Meu Portfolio
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {items?.length || 0} de 50 itens
                </p>
              </div>
            </div>
          </div>
          {canAddMore && (
            <button
              onClick={() => {
                setEditingItem(undefined);
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
              Adicionar Item
            </button>
          )}
        </div>

        {items && items.length > 0 ? (
          <PortfolioGrid
            items={items}
            onEdit={(item) => {
              setEditingItem(item);
              setShowForm(true);
            }}
          />
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h4 className="mb-2 text-base font-semibold text-gray-800 dark:text-white/90">
              Nenhum item no portfolio
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Adicione fotos e vídeos dos seus trabalhos para atrair mais clientes
            </p>
            <button
              onClick={() => {
                setEditingItem(undefined);
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
              Adicionar Primeiro Item
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <PortfolioForm
          providerId={providerId}
          editingItem={editingItem}
          onClose={() => {
            setShowForm(false);
            setEditingItem(undefined);
          }}
        />
      )}
    </>
  );
}
