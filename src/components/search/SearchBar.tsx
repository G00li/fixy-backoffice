'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Buscar profissionais...' }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 500);

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  return (
    <div className="relative">
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
      {localValue && (
        <button
          onClick={() => {
            setLocalValue('');
            onChange('');
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </div>
  );
}
