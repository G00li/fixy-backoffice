'use client';

interface RatingFilterProps {
  minRating: number;
  onChange: (rating: number) => void;
}

const RATING_OPTIONS = [
  { value: 0, label: 'Todas as avaliações' },
  { value: 3, label: '3+ estrelas' },
  { value: 4, label: '4+ estrelas' },
  { value: 4.5, label: '4.5+ estrelas' },
];

export function RatingFilter({ minRating, onChange }: RatingFilterProps) {
  return (
    <div>
      <h3 className="mb-3 font-semibold">Avaliação Mínima</h3>
      <div className="space-y-2">
        {RATING_OPTIONS.map((option) => (
          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="rating"
              checked={minRating === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
