'use client';

import { ProviderSearch } from '@/components/search/ProviderSearch';

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6">
        <h2 className="text-title-md font-semibold text-gray-800 dark:text-white/90">
          Buscar Profissionais
        </h2>
        <p className="text-theme-sm text-gray-500 dark:text-gray-400">
          Encontre o profissional ideal para suas necessidades
        </p>
      </div>

      <ProviderSearch />
    </div>
  );
}
