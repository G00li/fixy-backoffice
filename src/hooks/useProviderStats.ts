'use client';

import { useQuery } from '@tanstack/react-query';

export interface ProviderStatistics {
  avg_rating: number;
  total_reviews: number;
  total_bookings: number;
  completed_bookings: number;
  followers_count: number;
  total_posts: number;
  total_views: number;
}

async function fetchProviderStats(providerId: string): Promise<ProviderStatistics> {
  const response = await fetch(`/api/provider/${providerId}/stats`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch provider statistics');
  }
  
  const data = await response.json();
  return data.stats;
}

export function useProviderStats(providerId: string) {
  return useQuery({
    queryKey: ['provider-stats', providerId],
    queryFn: () => fetchProviderStats(providerId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!providerId,
  });
}
