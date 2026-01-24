'use client';

import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

interface AreaChartProps {
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
  yaxis?: ApexYAxis | ApexYAxis[];
  tooltipFormatter?: (val: number, opts: any) => string;
}

export function AreaChart({
  title,
  subtitle,
  icon,
  series,
  categories,
  colors = ['#465FFF', '#9CB9FF'],
  height = 310,
  yaxis,
  tooltipFormatter,
}: AreaChartProps) {
  const options: ApexOptions = {
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
      fontFamily: 'Outfit',
      labels: {
        colors: '#6B7280',
      },
    },
    colors,
    chart: {
      fontFamily: 'Outfit, sans-serif',
      height,
      type: 'line',
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: 'smooth',
      width: [3, 3],
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.4,
        opacityTo: 0.1,
      },
    },
    markers: {
      size: 0,
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      theme: 'dark',
      enabled: true,
      x: {
        show: true,
      },
      y: tooltipFormatter
        ? {
            formatter: tooltipFormatter,
          }
        : undefined,
    },
    xaxis: {
      type: 'category',
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
    yaxis: yaxis || {
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
        },
      },
      title: {
        text: '',
        style: {
          fontSize: '0px',
        },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      {(title || icon) && (
        <div className="mb-6 flex items-center gap-3">
          {icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50 dark:bg-yellow-500/10">
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
        <div className="min-w-[1000px] xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={height}
          />
        </div>
      </div>
    </div>
  );
}
