'use client';

import { useState } from 'react';

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  media_url: string;
  thumbnail_url?: string;
  tags: string[];
  is_featured: boolean;
}

interface PublicPortfolioGalleryProps {
  items: PortfolioItem[];
}

export function PublicPortfolioGallery({ items }: PublicPortfolioGalleryProps) {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">
        Portfolio ({items.length})
      </h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group relative aspect-square overflow-hidden rounded-lg bg-gray-200"
          >
            <img
              src={item.thumbnail_url || item.media_url}
              alt={item.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-110"
            />
            {item.is_featured && (
              <span className="absolute right-2 top-2 text-xl">⭐</span>
            )}
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
          </button>
        ))}
      </div>

      {/* Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-auto rounded-lg bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute right-4 top-4 text-2xl hover:text-gray-600"
            >
              ✕
            </button>

            <img
              src={selectedItem.media_url}
              alt={selectedItem.title}
              className="mb-4 w-full rounded-lg"
            />

            <h3 className="mb-2 text-xl font-semibold">{selectedItem.title}</h3>

            {selectedItem.description && (
              <p className="mb-3 text-gray-700">{selectedItem.description}</p>
            )}

            {selectedItem.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedItem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
