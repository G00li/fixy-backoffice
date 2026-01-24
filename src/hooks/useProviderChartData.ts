'use client';

import { useQuery } from '@tanstack/react-query';

export interface MonthlyBookings {
  month: string;
  year: number;
  monthIndex: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  total: number;
}

export interface WeeklyBookings {
  week: string;
  weekNumber: number;
  dateRange: string;
  startDate: string;
  endDate: string;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  total: number;
}

export interface DailyBookings {
  day: string;
  date: string;
  dayOfWeek: string;
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

async function fetchWeeklyBookings(
  providerId: string,
  year: number,
  month: number
): Promise<WeeklyBookings[]> {
  const response = await fetch(
    `/api/provider/${providerId}/chart-data/weekly?year=${year}&month=${month}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch weekly bookings');
  }
  
  const data = await response.json();
  return data.weeks;
}

async function fetchDailyBookings(
  providerId: string,
  year: number,
  month: number,
  week: number
): Promise<DailyBookings[]> {
  const response = await fetch(
    `/api/provider/${providerId}/chart-data/daily?year=${year}&month=${month}&week=${week}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch daily bookings');
  }
  
  const data = await response.json();
  console.log('🔍 Daily API Response:', data);
  return data.days;
}

export function useProviderChartData(providerId: string) {
  return useQuery({
    queryKey: ['provider-chart-data', providerId],
    queryFn: () => fetchProviderChartData(providerId),
    staleTime: 5 * 60 * 1000,
    enabled: !!providerId,
  });
}

export function useWeeklyBookings(providerId: string, year: number, month: number) {
  return useQuery({
    queryKey: ['weekly-bookings', providerId, year, month],
    queryFn: () => fetchWeeklyBookings(providerId, year, month),
    staleTime: 5 * 60 * 1000,
    enabled: !!providerId && year > 0 && month >= 0,
  });
}

export function useDailyBookings(
  providerId: string,
  year: number,
  month: number,
  week: number
) {
  return useQuery({
    queryKey: ['daily-bookings', providerId, year, month, week],
    queryFn: () => fetchDailyBookings(providerId, year, month, week),
    staleTime: 5 * 60 * 1000,
    enabled: !!providerId && year > 0 && month >= 0 && week > 0,
  });
}
