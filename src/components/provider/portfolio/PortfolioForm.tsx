'use client';

import { useState } from 'react';
import { useCreatePortfolioItem, useUpdatePortfolioItem } from '@/hooks/useProviderPortfolio';
import type { ProviderPortfolioItem, MediaType } from '@/types/provider-specialties';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';

interface PortfolioFormProps {
  providerId: string;
  editingItem?: ProviderPortfolioItem;
  onClose: () => void;
}

export function PortfolioForm({
  providerId,
  editingItem,
  onClose,
}: PortfolioFormProps) {
  const [title, setTitle] = useState(editingItem?.title || '');
  const [description, setDescription] = useState(editingItem?.description || '');
  const [mediaType, setMediaType] = useState<MediaType>(editingItem?.media_type || 'image');
  const [mediaUrl, setMediaUrl] = useState(editingItem?.media_url || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(editingItem?.thumbnail_url || '');
  const [tags, setTags] = useState<string[]>(editingItem?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isFeatured, setIsFeatured] = useState(editingItem?.is_featured || false);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreatePortfolioItem(providerId);
  const updateMutation = useUpdatePortfolioItem(providerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem.id,
          data: {
            title,
            description,
            thumbnail_url: thumbnailUrl,
            tags,
            is_featured: isFeatured,
          },
        });
      } else {
        await createMutation.mutateAsync({
          title,
          description,
          media_type: mediaType,
          media_url: mediaUrl,
          thumbnail_url: thumbnailUrl,
          tags,
          is_featured: isFeatured,
        });
      }
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao salvar');
    }
  };

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput) && tags.length < 10) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900 lg:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {editingItem ? 'Editar Item' : 'Novo Item de Portfolio'}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {editingItem 
              ? 'Atualize as informações do item' 
              : 'Adicione fotos ou vídeos dos seus trabalhos'}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label>Título *</Label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
              placeholder="Ex: Corte Degradê Moderno"
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 shadow-theme-xs transition-colors placeholder:text-gray-400 hover:border-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500 dark:hover:border-gray-600 dark:focus:border-brand-400"
              placeholder="Descreva o trabalho realizado..."
            />
          </div>

          {!editingItem && (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <Label>Tipo de Mídia *</Label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value as MediaType)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 shadow-theme-xs transition-colors hover:border-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:hover:border-gray-600 dark:focus:border-brand-400"
                  >
                    <option value="image">Imagem</option>
                    <option value="video">Vídeo</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>URL da Mídia *</Label>
                <Input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  required
                  placeholder="https://exemplo.pt/imagem.jpg"
                />
              </div>
            </>
          )}

          <div>
            <Label>URL da Thumbnail</Label>
            <Input
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://exemplo.pt/thumbnail.jpg"
            />
            <p className="mt-1.5 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Opcional: miniatura para pré-visualização
            </p>
          </div>

          <div>
            <Label>Tags ({tags.length}/10)</Label>
            <div className="mb-2 flex gap-2">
              <Input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Digite uma tag..."
                className="flex-1"
              />
              <button
                type="button"
                onClick={addTag}
                disabled={tags.length >= 10}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                Adicionar
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                      className="hover:text-brand-900 dark:hover:text-brand-300"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
            <input
              type="checkbox"
              id="featured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700"
            />
            <label htmlFor="featured" className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Destacar este item no portfolio
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  A guardar...
                </>
              ) : (
                editingItem ? 'Guardar Alterações' : 'Adicionar ao Portfolio'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
