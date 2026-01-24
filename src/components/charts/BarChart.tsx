'use client';

import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

interface BarChartProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  series: {
    name: string;
    data: number[];
  }[];
  categories: string[];
  colors?: string[];
  height?: number;
  stacked?: boolean;
  columnWidth?: string;
  tooltipFormatter?: (val: number) => string;
}

export function BarChart({
  title,
  subtitle,
  icon,
  series,
  categories,
  colors = ['#465fff'],
  height = 300,
  stacked = false,
  columnWidth = '55%',
  tooltipFormatter = (val: number) => `${val}`,
}: BarChartProps) {
  const options: ApexOptions = {
    colors,
    chart: {
      fontFamily: 'Outfit, sans-serif',
      type: 'bar',
      height,
      toolbar: {
        show: false,
      },
      stacked,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth,
        borderRadius: 5,
        borderRadiusApplication: 'end',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: stacked ? 2 : 4,
      colors: ['transparent'],
    },
    xaxis: {
      categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
        },
      },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
      fontFamily: 'Outfit',
      labels: {
        colors: '#6B7280',
      },
    },
    yaxis: {
      title: {
        text: undefined,
      },
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
        },
      },
    },
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      theme: 'dark',
      x: {
        show: true,
      },
      y: {
        formatter: tooltipFormatter,
      },
    },
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      {(title || icon) && (
        <div className="mb-6 flex items-center gap-3">
          {icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-500/10">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] pl-2 xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={height}
          />
        </div>
      </div>
    </div>
  );
}
