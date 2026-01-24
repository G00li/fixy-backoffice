'use client';

import { useQuery } from '@tanstack/react-query';

export interface MonthlyBookings {
  month: string;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  total: number;
}

export interface MonthlyReviews {
  month: string;
  average_rating: number;
  total_reviews: number;
}

export interface ProviderChartData {
  bookings: MonthlyBookings[];
  reviews: MonthlyReviews[];
}

async function fetchProviderChartData(providerId: string): Promise<ProviderChartData> {
  const response = await fetch(`/api/provider/${providerId}/chart-data`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch provider chart data');
  }
  
  const data = await response.json();
  return data.chartData;
}

export function useProviderChartData(providerId: string) {
  return useQuery({
    queryKey: ['provider-chart-data', providerId],
    queryFn: () => fetchProviderChartData(providerId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!providerId,
  });
}
