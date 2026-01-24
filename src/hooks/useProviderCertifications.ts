'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ProviderCertification,
  CreateCertificationRequest,
  UpdateCertificationRequest,
} from '@/types/provider-specialties';

const QUERY_KEY = 'provider-certifications';

export function useProviderCertifications(providerId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, providerId],
    queryFn: async () => {
      const res = await fetch('/api/provider/certifications', {
        headers: { 'x-provider-id': providerId || '' },
      });
      if (!res.ok) throw new Error('Failed to fetch certifications');
      const data = await res.json();
      return data.data as ProviderCertification[];
    },
    enabled: !!providerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateCertification(providerId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCertificationRequest) => {
      const res = await fetch('/api/provider/certifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-provider-id': providerId || '',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create certification');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, providerId] });
    },
  });
}

export function useUpdateCertification(providerId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCertificationRequest;
    }) => {
      const res = await fetch(`/api/provider/certifications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-provider-id': providerId || '',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update certification');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, providerId] });
    },
  });
}

export function useDeleteCertification(providerId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/provider/certifications/${id}`, {
        method: 'DELETE',
        headers: { 'x-provider-id': providerId || '' },
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete certification');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, providerId] });
    },
  });
}
