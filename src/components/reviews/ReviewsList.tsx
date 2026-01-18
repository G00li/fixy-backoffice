'use client';

import { useState } from 'react';
import { ReviewWithDetails } from '@/types/reviews';
import ReviewCard from './ReviewCard';

interface ReviewsListProps {
  reviews: ReviewWithDetails[];
  isProvider?: boolean;
  onRespond?: (reviewId: string, response: string) => void;
  onFlag?: (reviewId: string, reason: string) => void;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
  className?: string;
}

export default function ReviewsList({
  reviews,
  isProvider = false,
  onRespond,
  onFlag,
  onEdit,
  onDelete,
  className = '',
}: ReviewsListProps) {
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [withPhotosOnly, setWithPhotosOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'rating_high' | 'rating_low'>('recent');

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    if (ratingFilter > 0 && Math.round(review.overall_rating) !== ratingFilter) {
      return false;
    }
    if (withPhotosOnly && (!review.images || review.images.length === 0)) {
      return false;
    }
    return true;
  });

  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'rating_high':
        return b.overall_rating - a.overall_rating;
      case 'rating_low':
        return a.overall_rating - b.overall_rating;
      case 'recent':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {/* Rating Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filtrar por avaliação
          </label>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(Number(e.target.value))}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value={0}>Todas as avaliações</option>
            <option value={5}>⭐⭐⭐⭐⭐ (5 estrelas)</option>
            <option value={4}>⭐⭐⭐⭐ (4 estrelas)</option>
            <option value={3}>⭐⭐⭐ (3 estrelas)</option>
            <option value={2}>⭐⭐ (2 estrelas)</option>
            <option value={1}>⭐ (1 estrela)</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ordenar por
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="recent">Mais recentes</option>
            <option value="rating_high">Maior avaliação</option>
            <option value="rating_low">Menor avaliação</option>
          </select>
        </div>

        {/* With Photos */}
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={withPhotosOnly}
              onChange={(e) => setWithPhotosOnly(e.target.checked)}
              className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Apenas com fotos
            </span>
          </label>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {sortedReviews.length} {sortedReviews.length === 1 ? 'avaliação' : 'avaliações'}
          {ratingFilter > 0 || withPhotosOnly ? ' encontrada(s)' : ''}
        </p>
      </div>

      {/* Empty State */}
      {sortedReviews.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Nenhuma avaliação encontrada
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {ratingFilter > 0 || withPhotosOnly
              ? 'Tente ajustar os filtros'
              : 'Ainda não há avaliações'}
          </p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            isProvider={isProvider}
            onRespond={onRespond}
            onFlag={onFlag}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
