'use client';

import { useState } from 'react';
import { CreateReviewParams, REVIEW_VALIDATION } from '@/types/reviews';
import { createReview } from '@/app/actions/reviews';
import ReviewStars from './ReviewStars';

interface ReviewFormProps {
  bookingId: string;
  serviceName: string;
  providerName: string;
  onSuccess?: (reviewId: string) => void;
  onCancel?: () => void;
  className?: string;
}

export default function ReviewForm({
  bookingId,
  serviceName,
  providerName,
  onSuccess,
  onCancel,
  className = '',
}: ReviewFormProps) {
  const [qualityRating, setQualityRating] = useState(5);
  const [punctualityRating, setPunctualityRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [valueRating, setValueRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const overallRating = (qualityRating + punctualityRating + communicationRating + valueRating) / 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (comment.length > REVIEW_VALIDATION.MAX_COMMENT_LENGTH) {
      setError(`Comentário muito longo (máximo ${REVIEW_VALIDATION.MAX_COMMENT_LENGTH} caracteres)`);
      return;
    }

    setIsSubmitting(true);

    const params: CreateReviewParams = {
      booking_id: bookingId,
      quality_rating: qualityRating,
      punctuality_rating: punctualityRating,
      communication_rating: communicationRating,
      value_rating: valueRating,
      comment: comment || undefined,
      images: images.length > 0 ? images : undefined,
    };

    const result = await createReview(params);

    setIsSubmitting(false);

    if (result.success && result.review_id) {
      onSuccess?.(result.review_id);
    } else {
      setError(result.error || 'Erro ao criar avaliação');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Avaliar Serviço
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {serviceName} • {providerName}
      </p>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Overall Rating Preview */}
      <div className="mb-6 p-4 bg-brand-50 dark:bg-brand-900/20 rounded-lg">
        <p className="text-sm font-medium text-brand-900 dark:text-brand-100 mb-2">
          Avaliação Geral
        </p>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-brand-600 dark:text-brand-400">
            {overallRating.toFixed(1)}
          </span>
          <ReviewStars rating={overallRating} size="lg" />
        </div>
      </div>

      {/* Detailed Ratings */}
      <div className="space-y-6 mb-6">
        {/* Quality */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ⭐ Qualidade do Serviço
          </label>
          <ReviewStars
            rating={qualityRating}
            interactive
            onChange={setQualityRating}
            size="lg"
            showLabel
          />
        </div>

        {/* Punctuality */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ⏰ Pontualidade
          </label>
          <ReviewStars
            rating={punctualityRating}
            interactive
            onChange={setPunctualityRating}
            size="lg"
            showLabel
          />
        </div>

        {/* Communication */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            💬 Comunicação
          </label>
          <ReviewStars
            rating={communicationRating}
            interactive
            onChange={setCommunicationRating}
            size="lg"
            showLabel
          />
        </div>

        {/* Value */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            💰 Custo-Benefício
          </label>
          <ReviewStars
            rating={valueRating}
            interactive
            onChange={setValueRating}
            size="lg"
            showLabel
          />
        </div>
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Comentário (opcional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Conte como foi sua experiência..."
          rows={4}
          maxLength={REVIEW_VALIDATION.MAX_COMMENT_LENGTH}
          className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {comment.length}/{REVIEW_VALIDATION.MAX_COMMENT_LENGTH} caracteres
        </p>
      </div>

      {/* Images Upload Placeholder */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Fotos (opcional)
        </label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
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
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Adicione até {REVIEW_VALIDATION.MAX_IMAGES} fotos
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            (Funcionalidade de upload será implementada)
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Publicando...
            </>
          ) : (
            'Publicar Avaliação'
          )}
        </button>
      </div>
    </form>
  );
}
