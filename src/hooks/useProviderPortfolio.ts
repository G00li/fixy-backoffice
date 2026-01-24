'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ProviderPortfolioItem,
  CreatePortfolioRequest,
  UpdatePortfolioRequest,
  ReorderPortfolioRequest,
} from '@/types/provider-specialties';

const QUERY_KEY = 'provider-portfolio';

export function useProviderPortfolio(providerId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, providerId],
    queryFn: async () => {
      const res = await fetch('/api/provider/portfolio', {
        headers: { 'x-provider-id': providerId || '' },
      });
      if (!res.ok) throw new Error('Failed to fetch portfolio');
      const data = await res.json();
      return data.data as ProviderPortfolioItem[];
    },
    enabled: !!providerId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

export function useCreatePortfolioItem(providerId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePortfolioRequest) => {
      const res = await fetch('/api/provider/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-provider-id': providerId || '',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create portfolio item');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, providerId] });
    },
  });
}

export function useUpdatePortfolioItem(providerId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePortfolioRequest;
    }) => {
      const res = await fetch(`/api/provider/portfolio/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-provider-id': providerId || '',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update portfolio item');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, providerId] });
    },
  });
}

export function useDeletePortfolioItem(providerId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/provider/portfolio/${id}`, {
        method: 'DELETE',
        headers: { 'x-provider-id': providerId || '' },
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete portfolio item');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, providerId] });
    },
  });
}

export function useReorderPortfolio(providerId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReorderPortfolioRequest) => {
      const res = await fetch('/api/provider/portfolio/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-provider-id': providerId || '',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to reorder portfolio');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, providerId] });
    },
  });
}
