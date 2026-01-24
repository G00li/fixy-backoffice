'use client';

import { useQuery } from '@tanstack/react-query';
import type { Category, CategorySpecialtyTag } from '@/types/provider-specialties';

export function useCategories(level?: 1 | 2, parentId?: string) {
  return useQuery({
    queryKey: ['categories', level, parentId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (level) params.append('level', level.toString());
      if (parentId) params.append('parent_id', parentId);

      const res = await fetch(`/api/categories?${params}`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      return data.data as Category[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
  });
}

export function useCategoryTags(categoryId?: string, limit = 20) {
  return useQuery({
    queryKey: ['category-tags', categoryId, limit],
    queryFn: async () => {
      const res = await fetch(
        `/api/categories/${categoryId}/tags?limit=${limit}`
      );
      if (!res.ok) throw new Error('Failed to fetch category tags');
      const data = await res.json();
      return data.data as CategorySpecialtyTag[];
    },
    enabled: !!categoryId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
