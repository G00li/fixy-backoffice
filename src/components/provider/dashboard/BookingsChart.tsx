'use client';

import { useState } from 'react';
import {
  MonthlyBookings,
  WeeklyBookings,
  DailyBookings,
  useWeeklyBookings,
  useDailyBookings,
} from '@/hooks/useProviderChartData';
import { BarChart } from '@/components/charts/BarChart';

interface BookingsChartProps {
  data: MonthlyBookings[];
  providerId: string;
}

type DrillLevel = 'month' | 'week' | 'day';

interface DrillState {
  level: DrillLevel;
  year?: number;
  month?: number;
  monthName?: string;
  week?: number;
  weekName?: string;
}

export function BookingsChart({ data, providerId }: BookingsChartProps) {
  const [drillState, setDrillState] = useState<DrillState>({ level: 'month' });

  // Fetch weekly data when drilling into a month
  const { data: weeklyData, isLoading: loadingWeekly } = useWeeklyBookings(
    providerId,
    drillState.level === 'week' ? drillState.year || 0 : 0,
    drillState.level === 'week' ? drillState.month || 0 : -1
  );

  // Fetch daily data when drilling into a week
  const { data: dailyData, isLoading: loadingDaily } = useDailyBookings(
    providerId,
    drillState.level === 'day' ? drillState.year || 0 : 0,
    drillState.level === 'day' ? drillState.month || 0 : -1,
    drillState.level === 'day' ? drillState.week || 0 : 0
  );

  const handleChartClick = (dataPointIndex: number) => {
    if (drillState.level === 'month' && data[dataPointIndex]) {
      const monthData = data[dataPointIndex];
      setDrillState({
        level: 'week',
        year: monthData.year,
        month: monthData.monthIndex,
        monthName: monthData.month,
      });
    } else if (drillState.level === 'week' && weeklyData && weeklyData[dataPointIndex]) {
      const weekData = weeklyData[dataPointIndex];
      setDrillState({
        ...drillState,
        level: 'day',
        week: weekData.weekNumber,
        weekName: weekData.week,
      });
    }
  };

  const handleBack = () => {
    if (drillState.level === 'day') {
      setDrillState({
        level: 'week',
        year: drillState.year,
        month: drillState.month,
        monthName: drillState.monthName,
      });
    } else if (drillState.level === 'week') {
      setDrillState({ level: 'month' });
    }
  };

  // Prepare data based on current drill level
  let chartData: {
    series: { name: string; data: number[] }[];
    categories: string[];
    title: string;
    subtitle: string;
  } | null = null;

  if (drillState.level === 'month' && data && data.length > 0) {
    chartData = {
      series: [
        { name: 'Confirmados', data: data.map((d) => d.confirmed) },
        { name: 'Pendentes', data: data.map((d) => d.pending) },
        { name: 'Concluídos', data: data.map((d) => d.completed) },
        { name: 'Cancelados', data: data.map((d) => d.cancelled) },
      ],
      categories: data.map((d) => d.month),
      title: 'Agendamentos Mensais',
      subtitle: 'Últimos 12 meses por status',
    };
  } else if (drillState.level === 'week' && weeklyData && weeklyData.length > 0) {
    chartData = {
      series: [
        { name: 'Confirmados', data: weeklyData.map((d) => d.confirmed) },
        { name: 'Pendentes', data: weeklyData.map((d) => d.pending) },
        { name: 'Concluídos', data: weeklyData.map((d) => d.completed) },
        { name: 'Cancelados', data: weeklyData.map((d) => d.cancelled) },
      ],
      categories: weeklyData.map((d) => d.dateRange),
      title: `Agendamentos em ${drillState.monthName} ${drillState.year}`,
      subtitle: 'Por semana',
    };
  } else if (drillState.level === 'day' && dailyData && dailyData.length > 0) {
    console.log('📊 Daily data received:', dailyData);
    chartData = {
      series: [
        { name: 'Confirmados', data: dailyData.map((d) => d.confirmed) },
        { name: 'Pendentes', data: dailyData.map((d) => d.pending) },
        { name: 'Concluídos', data: dailyData.map((d) => d.completed) },
        { name: 'Cancelados', data: dailyData.map((d) => d.cancelled) },
      ],
      categories: dailyData.map((d) => d.day),
      title: `${drillState.weekName} - ${drillState.monthName} ${drillState.year}`,
      subtitle: 'Por dia',
    };
    console.log('📈 Chart data prepared:', {
      series: chartData.series,
      categories: chartData.categories,
    });
  }

  const isLoading = 
    (drillState.level === 'week' && loadingWeekly) || 
    (drillState.level === 'day' && loadingDaily) ||
    (drillState.level === 'week' && !weeklyData) ||
    (drillState.level === 'day' && !dailyData);

  // Check if we have valid data
  const hasValidData = chartData !== null && 
                       chartData.series.length > 0 && 
                       chartData.categories.length > 0 &&
                       chartData.series.every(s => s.data.length === chartData!.categories.length);

  console.log('🎯 Render state:', {
    level: drillState.level,
    isLoading,
    hasValidData,
    dailyDataLength: dailyData?.length,
    chartData: chartData ? {
      seriesCount: chartData.series.length,
      categoriesCount: chartData.categories.length,
      categories: chartData.categories,
    } : null,
  });

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          <p className="text-sm text-gray-500 dark:text-gray-400">A carregar dados...</p>
        </div>
      </div>
    );
  }

  if (!hasValidData) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">Sem dados disponíveis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Back button */}
      {drillState.level !== 'month' && (
        <button
          onClick={handleBack}
          className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>
      )}

      <BarChart
        key={`${drillState.level}-${drillState.year}-${drillState.month}-${drillState.week}`}
        title={chartData.title}
        subtitle={chartData.subtitle}
        icon={
          <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
        series={chartData.series}
        categories={chartData.categories}
        colors={['#465fff', '#9CB9FF', '#10B981', '#EF4444']}
        height={300}
        stacked={true}
        tooltipFormatter={(val: number) => `${val} agendamentos`}
        onDataPointClick={drillState.level !== 'day' ? handleChartClick : undefined}
      />
    </div>
  );
}
