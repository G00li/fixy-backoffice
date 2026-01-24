'use client';

interface LocationFilterProps {
  radiusKm: number;
  onChange: (radius: number) => void;
}

const RADIUS_OPTIONS = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
];

export function LocationFilter({ radiusKm, onChange }: LocationFilterProps) {
  return (
    <div>
      <h3 className="mb-3 font-semibold">Distância</h3>
      <div className="space-y-2">
        {RADIUS_OPTIONS.map((option) => (
          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="radius"
              checked={radiusKm === option.value}
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
