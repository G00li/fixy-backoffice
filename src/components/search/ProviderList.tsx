'use client';

import type { ProviderSearchResult } from '@/types/provider-specialties';
import { ProviderCard } from './ProviderCard';

interface ProviderListProps {
  providers: ProviderSearchResult[];
  isLoading?: boolean;
  error?: Error | null;
}

export function ProviderList({ providers, isLoading, error }: ProviderListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-lg bg-gray-200"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="mb-2 text-2xl">⚠️</p>
        <p className="font-semibold text-red-900">Erro ao buscar profissionais</p>
        <p className="text-sm text-red-700">{error.message}</p>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
        <p className="mb-2 text-4xl">🔍</p>
        <p className="mb-1 font-semibold text-gray-900">
          Nenhum profissional encontrado
        </p>
        <p className="text-sm text-gray-600">
          Tente ajustar os filtros ou buscar por outros termos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {providers.map((provider) => (
        <ProviderCard key={provider.provider_id} provider={provider} />
      ))}
    </div>
  );
}
