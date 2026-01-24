'use client';

import { useState, useEffect } from 'react';
import { useCreateSpecialty, useUpdateSpecialty } from '@/hooks/useProviderSpecialties';
import { useCategoryTags } from '@/hooks/useCategories';
import type { Category, ProviderCategory, ExperienceLevel } from '@/types/provider-specialties';

interface SpecialtyFormProps {
  providerId: string;
  editingId: string | null;
  categories: Category[];
  existingSpecialties: ProviderCategory[];
  onClose: () => void;
}

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: 'beginner', label: 'Iniciante' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' },
  { value: 'expert', label: 'Especialista' },
];

export function SpecialtyForm({
  providerId,
  editingId,
  categories,
  existingSpecialties,
  onClose,
}: SpecialtyFormProps) {
  const editing = existingSpecialties.find((s) => s.id === editingId);
  const hasPrimary = existingSpecialties.some((s) => s.category_type === 'primary');
  const isEditingPrimary = editing?.category_type === 'primary';

  const [categoryId, setCategoryId] = useState(editing?.category_id || '');
  const [yearsExperience, setYearsExperience] = useState(editing?.years_experience || 0);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    editing?.experience_level || 'intermediate'
  );
  const [description, setDescription] = useState(editing?.custom_description || '');
  const [tags, setTags] = useState<string[]>(editing?.specialty_tags || []);
  const [tagInput, setTagInput] = useState('');

  const { data: suggestedTags } = useCategoryTags(categoryId);
  const createMutation = useCreateSpecialty(providerId);
  const updateMutation = useUpdateSpecialty(providerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          data: {
            years_experience: yearsExperience,
            experience_level: experienceLevel,
            custom_description: description,
            specialty_tags: tags,
          },
        });
      } else {
        const categoryType = hasPrimary ? 'secondary' : 'primary';
        const displayOrder = categoryType === 'primary' ? 1 : existingSpecialties.filter(s => s.category_type === 'secondary').length + 2;

        await createMutation.mutateAsync({
          category_id: categoryId,
          category_type: categoryType,
          display_order: displayOrder,
          years_experience: yearsExperience,
          experience_level: experienceLevel,
          custom_description: description,
          specialty_tags: tags,
        });
      }
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao salvar');
    }
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold">
          {editingId ? 'Editar Especialidade' : 'Nova Especialidade'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingId && (
            <div>
              <label className="mb-1 block text-sm font-medium">Categoria *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 p-2"
              >
                <option value="">Selecione...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Anos de Experiência</label>
              <input
                type="number"
                min="0"
                max="50"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-gray-300 p-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Nível</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                className="w-full rounded-lg border border-gray-300 p-2"
              >
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={3}
              className="w-full rounded-lg border border-gray-300 p-2"
              placeholder="Descreva sua experiência nesta área..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Tags de Especialidade ({tags.length}/10)
            </label>
            <div className="mb-2 flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
                className="flex-1 rounded-lg border border-gray-300 p-2"
                placeholder="Digite uma tag..."
              />
              <button
                type="button"
                onClick={() => addTag(tagInput)}
                disabled={tags.length >= 10}
                className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300 disabled:opacity-50"
              >
                Adicionar
              </button>
            </div>

            {suggestedTags && suggestedTags.length > 0 && (
              <div className="mb-2">
                <p className="mb-1 text-xs text-gray-500">Sugestões:</p>
                <div className="flex flex-wrap gap-1">
                  {suggestedTags.slice(0, 10).map((tag) => (
                    <button
                      key={tag.tag_slug}
                      type="button"
                      onClick={() => addTag(tag.tag_name)}
                      disabled={tags.includes(tag.tag_name)}
                      className="rounded-full bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200 disabled:opacity-50"
                    >
                      {tag.tag_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                    className="hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {editingId ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
