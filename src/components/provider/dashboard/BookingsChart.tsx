'use client';

import { MonthlyBookings } from '@/hooks/useProviderChartData';
import { BarChart } from '@/components/charts/BarChart';

interface BookingsChartProps {
  data: MonthlyBookings[];
}

export function BookingsChart({ data }: BookingsChartProps) {
  const series = [
    {
      name: 'Confirmados',
      data: data.map((d) => d.confirmed),
    },
    {
      name: 'Pendentes',
      data: data.map((d) => d.pending),
    },
    {
      name: 'Concluídos',
      data: data.map((d) => d.completed),
    },
    {
      name: 'Cancelados',
      data: data.map((d) => d.cancelled),
    },
  ];

  const categories = data.map((d) => d.month);

  return (
    <BarChart
      title="Agendamentos Mensais"
      subtitle="Últimos 12 meses por status"
      icon={
        <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      }
      series={series}
      categories={categories}
      colors={['#465fff', '#9CB9FF', '#10B981', '#EF4444']}
      height={300}
      stacked={true}
      tooltipFormatter={(val: number) => `${val} agendamentos`}
    />
  );
}
