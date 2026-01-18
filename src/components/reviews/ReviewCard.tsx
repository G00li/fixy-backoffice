'use client';

import { ReviewWithDetails } from '@/types/reviews';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ReviewStars from './ReviewStars';
import { useState } from 'react';

interface ReviewCardProps {
  review: ReviewWithDetails;
  isProvider?: boolean;
  onRespond?: (reviewId: string, response: string) => void;
  onFlag?: (reviewId: string, reason: string) => void;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
  className?: string;
}

export default function ReviewCard({
  review,
  isProvider = false,
  onRespond,
  onFlag,
  onEdit,
  onDelete,
  className = '',
}: ReviewCardProps) {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [response, setResponse] = useState('');
  const [showFlagForm, setShowFlagForm] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createdDate = new Date(review.created_at);
  const canEdit = review.can_edit && !isProvider;
  const canRespond = isProvider && !review.provider_response && onRespond;

  const handleSubmitResponse = async () => {
    if (!onRespond || !response.trim()) return;
    setIsSubmitting(true);
    await onRespond(review.id, response);
    setIsSubmitting(false);
    setShowResponseForm(false);
    setResponse('');
  };

  const handleSubmitFlag = async () => {
    if (!onFlag || !flagReason.trim()) return;
    setIsSubmitting(true);
    await onFlag(review.id, flagReason);
    setIsSubmitting(false);
    setShowFlagForm(false);
    setFlagReason('');
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {review.reviewer_avatar && (
            <img
              src={review.reviewer_avatar}
              alt={review.reviewer_name || 'Reviewer'}
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {review.reviewer_name || 'Cliente'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {format(createdDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="flex items-center gap-2">
          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(review.id)}
              className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
            >
              Editar
            </button>
          )}
          {canEdit && onDelete && (
            <button
              onClick={() => onDelete(review.id)}
              className="text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Excluir
            </button>
          )}
          {!isProvider && onFlag && (
            <button
              onClick={() => setShowFlagForm(true)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
            >
              Reportar
            </button>
          )}
        </div>
      </div>

      {/* Overall Rating */}
      <div className="mb-4">
        <ReviewStars rating={review.overall_rating} size="lg" showLabel />
      </div>

      {/* Detailed Ratings */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Qualidade</p>
          <ReviewStars rating={review.quality_rating} size="sm" />
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pontualidade</p>
          <ReviewStars rating={review.punctuality_rating} size="sm" />
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Comunicação</p>
          <ReviewStars rating={review.communication_rating} size="sm" />
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Custo-Benefício</p>
          <ReviewStars rating={review.value_rating} size="sm" />
        </div>
      </div>

      {/* Service Info */}
      {review.service_title && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Serviço: <span className="font-medium">{review.service_title}</span>
        </p>
      )}

      {/* Comment */}
      {review.comment && (
        <p className="text-gray-900 dark:text-white mb-4 whitespace-pre-wrap">
          {review.comment}
        </p>
      )}

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review image ${index + 1}`}
              className="w-24 h-24 rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      {/* Provider Response */}
      {review.provider_response && (
        <div className="mt-4 p-4 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-800">
          <p className="text-sm font-medium text-brand-900 dark:text-brand-100 mb-2">
            Resposta do Provider
          </p>
          <p className="text-sm text-brand-800 dark:text-brand-200">
            {review.provider_response}
          </p>
          {review.provider_response_at && (
            <p className="text-xs text-brand-600 dark:text-brand-400 mt-2">
              {format(new Date(review.provider_response_at), "d 'de' MMMM", { locale: ptBR })}
            </p>
          )}
        </div>
      )}

      {/* Response Form */}
      {canRespond && !showResponseForm && (
        <button
          onClick={() => setShowResponseForm(true)}
          className="mt-4 text-sm text-brand-600 dark:text-brand-400 hover:underline"
        >
          Responder avaliação
        </button>
      )}

      {showResponseForm && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Escreva sua resposta..."
            rows={3}
            maxLength={1000}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {response.length}/1000
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResponseForm(false)}
                className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitResponse}
                disabled={isSubmitting || !response.trim()}
                className="px-3 py-1 text-sm bg-brand-600 text-white rounded hover:bg-brand-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Enviando...' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flag Form */}
      {showFlagForm && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
            Reportar avaliação
          </p>
          <textarea
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
            placeholder="Descreva o motivo..."
            rows={2}
            className="block w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setShowFlagForm(false)}
              className="flex-1 px-3 py-1 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmitFlag}
              disabled={isSubmitting || !flagReason.trim()}
              className="flex-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Reportando...' : 'Reportar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
