'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ProviderCategory,
  CreateSpecialtyRequest,
  UpdateSpecialtyRequest,
} from '@/types/provider-specialties';

const QUERY_KEY = 'provider-specialties';

// Fetch specialties
export function useProviderSpecialties(providerId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, providerId],
    queryFn: async () => {
      const res = await fetch('/api/provider/specialties', {
        headers: { 'x-provider-id': providerId || '' },
      });
      if (!res.ok) throw new Error('Failed to fetch specialties');
      const data = await res.json();
      return data.data as ProviderCategory[];
    },
    enabled: !!providerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create specialty
export function useCreateSpecialty(providerId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSpecialtyRequest) => {
      const res = await fetch('/api/provider/specialties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-provider-id': providerId || '',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create specialty');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, providerId] });
    },
  });
}

// Update specialty
export function useUpdateSpecialty(providerId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSpecialtyRequest;
    }) => {
      const res = await fetch(`/api/provider/specialties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-provider-id': providerId || '',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update specialty');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, providerId] });
    },
  });
}

// Delete specialty
export function useDeleteSpecialty(providerId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/provider/specialties/${id}`, {
        method: 'DELETE',
        headers: { 'x-provider-id': providerId || '' },
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete specialty');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, providerId] });
    },
  });
}
