'use client';

import { useState } from 'react';

interface SpecialtyTagsFilterProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
}

export function SpecialtyTagsFilter({ selectedTags, onChange, suggestions = [] }: SpecialtyTagsFilterProps) {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      onChange([...selectedTags, tag]);
      setInputValue('');
    }
  };

  const removeTag = (tag: string) => {
    onChange(selectedTags.filter((t) => t !== tag));
  };

  return (
    <div>
      <h3 className="mb-3 font-semibold">Especialidades</h3>
      
      <div className="mb-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag(inputValue);
            }
          }}
          placeholder="Digite uma especialidade..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {suggestions.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-xs text-gray-500">Sugestões:</p>
          <div className="flex flex-wrap gap-1">
            {suggestions.slice(0, 8).map((tag) => (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                disabled={selectedTags.includes(tag)}
                className="rounded-full bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200 disabled:opacity-50"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:text-red-600"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
