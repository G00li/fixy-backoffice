'use client';

import { ReviewStats as ReviewStatsType, calculateRatingDistribution } from '@/types/reviews';
import ReviewStars from './ReviewStars';

interface ReviewStatsProps {
  stats: ReviewStatsType;
  className?: string;
}

export default function ReviewStats({ stats, className = '' }: ReviewStatsProps) {
  const distribution = calculateRatingDistribution(stats);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {/* Overall Rating */}
      <div className="text-center mb-6">
        <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
          {stats.average_rating.toFixed(1)}
        </div>
        <ReviewStars rating={stats.average_rating} size="lg" />
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Baseado em {stats.total_reviews} {stats.total_reviews === 1 ? 'avaliação' : 'avaliações'}
        </p>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-2 mb-6">
        {distribution.map((item) => (
          <div key={item.rating} className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8">
              {item.rating}★
            </span>
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-all duration-300"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
              {item.count}
            </span>
          </div>
        ))}
      </div>

      {/* Detailed Ratings */}
      <div className="grid grid-cols-2 gap-4 mb-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Qualidade</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {stats.quality_avg.toFixed(1)}
            </span>
            <ReviewStars rating={stats.quality_avg} size="sm" />
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pontualidade</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {stats.punctuality_avg.toFixed(1)}
            </span>
            <ReviewStars rating={stats.punctuality_avg} size="sm" />
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Comunicação</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {stats.communication_avg.toFixed(1)}
            </span>
            <ReviewStars rating={stats.communication_avg} size="sm" />
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Custo-Benefício</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {stats.value_avg.toFixed(1)}
            </span>
            <ReviewStars rating={stats.value_avg} size="sm" />
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">
            {stats.with_photos_count}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Com fotos</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">
            {stats.with_response_count}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Com resposta</p>
        </div>
      </div>
    </div>
  );
}
