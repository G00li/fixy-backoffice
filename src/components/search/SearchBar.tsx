'use client';

import { useState } from 'react';
import { CloseIcon } from '@/icons';

interface SearchBarProps {
  initialValue?: string;
  onSearch: (searchText: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  initialValue = '',
  onSearch,
  placeholder = 'Buscar prestadores...',
  className = '',
}: SearchBarProps) {
  const [searchText, setSearchText] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchText.trim());
  };

  const handleClear = () => {
    setSearchText('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   placeholder:text-gray-400 dark:placeholder:text-gray-500
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   transition-colors"
        />

        {searchText && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 
                     text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                     transition-colors"
            aria-label="Limpar busca"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </form>
  );
}
