'use client';

import Link from 'next/link';
import { useCategories } from '@/hooks/useCategories';

export default function ExplorePage() {
  const { data: categories, isLoading } = useCategories();

  const primaryCategories = categories?.filter((c) => c.level === 1) || [];

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-8">
        <h2 className="mb-2 text-title-md font-semibold text-gray-800 dark:text-white/90">
          Explorar Profissionais
        </h2>
        <p className="text-theme-sm text-gray-500 dark:text-gray-400">
          Descubra profissionais qualificados em diversas categorias
        </p>
      </div>

      {/* Search CTA */}
      <Link
        href="/search"
        className="mb-8 block rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center transition-colors hover:border-brand-500 hover:bg-brand-50/50 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-500 dark:hover:bg-brand-500/5"
      >
        <p className="mb-2 text-4xl">🔍</p>
        <p className="mb-1 font-semibold text-gray-800 dark:text-white/90">Buscar Profissionais</p>
        <p className="text-theme-sm text-gray-500 dark:text-gray-400">
          Use filtros avançados para encontrar o profissional ideal
        </p>
      </Link>

      {/* Categories */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Categorias Populares
        </h3>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {primaryCategories.map((category) => (
              <Link
                key={category.id}
                href={`/search?category=${category.id}`}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs transition-all hover:border-brand-500 hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-500"
              >
                <div className="mb-3 text-4xl">
                  {category.icon_url || '📋'}
                </div>
                <h4 className="mb-2 text-lg font-semibold text-gray-800 group-hover:text-brand-500 dark:text-white/90">
                  {category.name}
                </h4>
                {category.description && (
                  <p className="text-theme-sm text-gray-500 dark:text-gray-400">
                    {category.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Featured Providers Section (Placeholder) */}
      <div className="mt-12">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Profissionais em Destaque
        </h3>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="mb-2 text-4xl">⭐</p>
          <p className="mb-1 font-semibold text-gray-800 dark:text-white/90">Em breve</p>
          <p className="text-theme-sm text-gray-500 dark:text-gray-400">
            Profissionais verificados e bem avaliados aparecerão aqui
          </p>
        </div>
      </div>
    </div>
  );
}
