'use client';

import { ApexOptions } from 'apexcharts';
import { useMemo, useState, useEffect } from 'react';
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
  onDataPointClick?: (dataPointIndex: number) => void;
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
  onDataPointClick,
}: BarChartProps) {
  const [chartReady, setChartReady] = useState(false);

  // Validate data before rendering
  const isValidData = useMemo(() => {
    if (!series || !Array.isArray(series) || series.length === 0) {
      return false;
    }
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return false;
    }
    
    return series.every(
      (s) => s && 
             s.name &&
             s.data && 
             Array.isArray(s.data) && 
             s.data.length === categories.length &&
             s.data.every(val => typeof val === 'number' && !isNaN(val))
    );
  }, [series, categories]);

  // Sanitize series data
  const sanitizedSeries = useMemo(() => {
    if (!isValidData) return [];
    return series.map(s => ({
      name: s.name || 'Unknown',
      data: s.data.map(val => (typeof val === 'number' && !isNaN(val)) ? val : 0),
    }));
  }, [series, isValidData]);

  // Sanitize categories
  const sanitizedCategories = useMemo(() => {
    if (!isValidData) return [];
    return categories.map((cat, idx) => cat || `Item ${idx + 1}`);
  }, [categories, isValidData]);

  // Generate options
  const options: ApexOptions = useMemo(() => ({
    colors,
    chart: {
      id: `bar-chart-${Date.now()}`,
      fontFamily: 'Outfit, sans-serif',
      type: 'bar',
      height,
      toolbar: {
        show: false,
      },
      stacked,
      animations: {
        enabled: true,
        speed: 400,
      },
      events: onDataPointClick
        ? {
            dataPointSelection: (event, chartContext, config) => {
              if (config && typeof config.dataPointIndex === 'number') {
                onDataPointClick(config.dataPointIndex);
              }
            },
          }
        : undefined,
    },
    states: {
      hover: {
        filter: {
          type: 'darken',
          value: 0.15,
        },
      },
      active: {
        filter: {
          type: 'darken',
          value: 0.25,
        },
      },
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
      categories: sanitizedCategories,
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
      shared: true,
      intersect: false,
      followCursor: true,
      x: {
        show: true,
      },
      y: {
        formatter: tooltipFormatter,
      },
    },
  }), [colors, height, stacked, onDataPointClick, columnWidth, sanitizedCategories, tooltipFormatter]);

  // Wait for data to be ready
  useEffect(() => {
    setChartReady(false);
    if (isValidData && sanitizedSeries.length > 0 && sanitizedCategories.length > 0) {
      const timer = setTimeout(() => {
        setChartReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isValidData, sanitizedSeries.length, sanitizedCategories.length]);

  if (!isValidData || !chartReady) {
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
        <div className="flex h-[300px] items-center justify-center">
          {!isValidData ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Sem dados disponíveis</p>
          ) : (
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          )}
        </div>
      </div>
    );
  }

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
        <div className={`-ml-5 min-w-[650px] pl-2 xl:min-w-full ${onDataPointClick ? 'cursor-pointer' : ''}`}>
          <ReactApexChart
            options={options}
            series={sanitizedSeries}
            type="bar"
            height={height}
          />
        </div>
      </div>
    </div>
  );
}
