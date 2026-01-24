'use client';

import { MonthlyReviews } from '@/hooks/useProviderChartData';
import { AreaChart } from '@/components/charts/AreaChart';

interface ReviewsChartProps {
  data: MonthlyReviews[];
}

export function ReviewsChart({ data }: ReviewsChartProps) {
  const series = [
    {
      name: 'Avaliação Média',
      data: data.map((d) => d.average_rating),
    },
    {
      name: 'Total de Avaliações',
      data: data.map((d) => d.total_reviews),
    },
  ];

  const categories = data.map((d) => d.month);

  const yaxis = [
    {
      title: {
        text: 'Avaliação Média',
        style: {
          color: '#6B7280',
          fontSize: '12px',
        },
      },
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
        },
        formatter: (val: number) => val.toFixed(1),
      },
      min: 0,
      max: 5,
    },
    {
      opposite: true,
      title: {
        text: 'Total de Avaliações',
        style: {
          color: '#6B7280',
          fontSize: '12px',
        },
      },
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
        },
      },
    },
  ];

  return (
    <AreaChart
      title="Evolução das Avaliações"
      subtitle="Avaliação média e total nos últimos 12 meses"
      icon={
        <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      }
      series={series}
      categories={categories}
      colors={['#F59E0B', '#465FFF']}
      height={310}
      yaxis={yaxis}
      tooltipFormatter={(val: number, opts: any) => {
        if (opts.seriesIndex === 0) {
          return val.toFixed(1) + ' estrelas';
        }
        return val + ' avaliações';
      }}
    />
  );
}
