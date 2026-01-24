'use client';

import { useCategories } from '@/hooks/useCategories';

interface CategoryFilterProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function CategoryFilter({ selectedIds, onChange }: CategoryFilterProps) {
  const { data: categories, isLoading } = useCategories();

  const toggleCategory = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((cid) => cid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-gray-500">Carregando...</div>;
  }

  const primaryCategories = categories?.filter((c) => c.level === 1) || [];

  return (
    <div>
      <h3 className="mb-3 font-semibold">Categorias</h3>
      <div className="space-y-2">
        {primaryCategories.map((category) => (
          <label key={category.id} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.includes(category.id)}
              onChange={() => toggleCategory(category.id)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm">{category.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
