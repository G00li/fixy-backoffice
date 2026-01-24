'use client';

import type { ProviderPortfolioItem } from '@/types/provider-specialties';
import { PortfolioItem } from './PortfolioItem';

interface PortfolioGridProps {
  items: ProviderPortfolioItem[];
  onEdit: (item: ProviderPortfolioItem) => void;
}

export function PortfolioGrid({ items, onEdit }: PortfolioGridProps) {
  const featured = items.filter((i) => i.is_featured);
  const regular = items.filter((i) => !i.is_featured);

  return (
    <div className="space-y-6">
      {featured.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Em Destaque</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item) => (
              <PortfolioItem key={item.id} item={item} onEdit={() => onEdit(item)} />
            ))}
          </div>
        </div>
      )}

      {regular.length > 0 && (
        <div>
          {featured.length > 0 && (
            <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Outros Items</h3>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {regular.map((item) => (
              <PortfolioItem key={item.id} item={item} onEdit={() => onEdit(item)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
