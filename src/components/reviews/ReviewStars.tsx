'use client';

import { useState } from 'react';

interface ReviewStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showLabel?: boolean;
  className?: string;
}

export default function ReviewStars({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showLabel = false,
  className = '',
}: ReviewStarsProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  const getRatingLabel = (rating: number): string => {
    if (rating >= 4.5) return 'Excelente';
    if (rating >= 3.5) return 'Bom';
    if (rating >= 2.5) return 'Regular';
    if (rating >= 1.5) return 'Ruim';
    return 'Muito ruim';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayRating;
          const isPartiallyFilled = starValue - 0.5 <= displayRating && starValue > displayRating;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              disabled={!interactive}
              className={`
                ${sizeClasses[size]}
                ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
                ${!interactive && 'pointer-events-none'}
              `}
              aria-label={`${starValue} ${starValue === 1 ? 'estrela' : 'estrelas'}`}
            >
              {isPartiallyFilled ? (
                // Half star
                <svg
                  className="w-full h-full text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <defs>
                    <linearGradient id={`half-${index}`}>
                      <stop offset="50%" stopColor="currentColor" />
                      <stop offset="50%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  <path
                    fill={`url(#half-${index})`}
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
              ) : (
                // Full or empty star
                <svg
                  className={`w-full h-full ${
                    isFilled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {displayRating.toFixed(1)} - {getRatingLabel(displayRating)}
        </span>
      )}

      {interactive && hoverRating !== null && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {getRatingLabel(hoverRating)}
        </span>
      )}
    </div>
  );
}
