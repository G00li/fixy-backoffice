'use client';

interface Review {
  id: string;
  client_name: string;
  overall_rating: number;
  comment?: string;
  created_at: string;
}

interface PublicReviewsSectionProps {
  avgRating: number;
  totalReviews: number;
  reviews?: Review[];
}

export function PublicReviewsSection({
  avgRating,
  totalReviews,
  reviews = [],
}: PublicReviewsSectionProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">
        Avaliações ({totalReviews})
      </h2>

      {/* Rating Summary */}
      <div className="mb-6 rounded-lg bg-gray-50 p-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-4xl font-bold">{avgRating.toFixed(1)}</p>
            <p className="text-sm text-gray-600">⭐⭐⭐⭐⭐</p>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              Baseado em {totalReviews} avaliações
            </p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-gray-200 pb-4 last:border-0"
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium">{review.client_name}</p>
                <div className="flex items-center gap-1 text-sm">
                  <span>⭐</span>
                  <span>{review.overall_rating.toFixed(1)}</span>
                </div>
              </div>
              {review.comment && (
                <p className="mb-2 text-sm text-gray-700">{review.comment}</p>
              )}
              <p className="text-xs text-gray-500">
                {formatDate(review.created_at)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-gray-500">
          Ainda não há avaliações
        </p>
      )}
    </div>
  );
}
