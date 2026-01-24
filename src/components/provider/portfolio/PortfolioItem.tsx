'use client';

import type { ProviderPortfolioItem } from '@/types/provider-specialties';
import { useDeletePortfolioItem, useUpdatePortfolioItem } from '@/hooks/useProviderPortfolio';

interface PortfolioItemProps {
  item: ProviderPortfolioItem;
  onEdit: () => void;
}

export function PortfolioItem({ item, onEdit }: PortfolioItemProps) {
  const deleteMutation = useDeletePortfolioItem(item.provider_id);
  const updateMutation = useUpdatePortfolioItem(item.provider_id);

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja remover este item?')) return;
    try {
      await deleteMutation.mutateAsync(item.id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao remover item');
    }
  };

  const toggleFeatured = async () => {
    try {
      await updateMutation.mutateAsync({
        id: item.id,
        data: { is_featured: !item.is_featured },
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao atualizar item');
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      {/* Image/Video */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        {item.media_type === 'image' ? (
          <img
            src={item.thumbnail_url || item.media_url}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <video
            src={item.media_url}
            poster={item.thumbnail_url}
            className="h-full w-full object-cover"
          />
        )}
        
        {/* Featured badge */}
        {item.is_featured && (
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Destaque
            </span>
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={onEdit}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-theme-xs transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Editar
          </button>
          <button
            onClick={toggleFeatured}
            disabled={updateMutation.isPending}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-theme-xs transition-colors hover:bg-yellow-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-yellow-900/20"
            title={item.is_featured ? 'Remover destaque' : 'Destacar'}
          >
            <svg className="h-4 w-4" fill={item.is_featured ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-medium text-red-600 shadow-theme-xs transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            {deleteMutation.isPending ? 'A remover...' : 'Remover'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h4 className="mb-1.5 truncate font-semibold text-gray-800 dark:text-white/90">{item.title}</h4>
        {item.description && (
          <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
        )}
        
        <div className="mb-3 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            {item.views_count}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {item.likes_count}
          </span>
        </div>

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
