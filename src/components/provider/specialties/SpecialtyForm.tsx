'use client';

import { useState, useEffect } from 'react';
import { useCreateSpecialty, useUpdateSpecialty } from '@/hooks/useProviderSpecialties';
import { useCategoryTags } from '@/hooks/useCategories';
import type { Category, ProviderCategory, ExperienceLevel } from '@/types/provider-specialties';
import { ModalSimple } from '@/components/ui/modal';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';

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
    <ModalSimple
      isOpen={true}
      onClose={onClose}
      title={editingId ? 'Editar Especialidade' : 'Nova Especialidade'}
      subtitle={editingId 
        ? 'Atualize as informações da especialidade' 
        : 'Configure suas áreas de atuação e expertise'}
      maxWidth="2xl"
      closeOnBackdrop={false}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {!editingId && (
          <div>
            <Label>Categoria *</Label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 shadow-theme-xs transition-colors hover:border-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:hover:border-gray-600 dark:focus:border-brand-400"
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

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label>Anos de Experiência</Label>
            <Input
              type="number"
              min="0"
              max="50"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(parseInt(e.target.value) || 0)}
            />
          </div>

          <div>
            <Label>Nível</Label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 shadow-theme-xs transition-colors hover:border-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:hover:border-gray-600 dark:focus:border-brand-400"
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
          <Label>Descrição</Label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
            rows={3}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 shadow-theme-xs transition-colors placeholder:text-gray-400 hover:border-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500 dark:hover:border-gray-600 dark:focus:border-brand-400"
            placeholder="Descreva sua experiência nesta área..."
          />
        </div>

        <div>
          <Label>Tags de Especialidade ({tags.length}/10)</Label>
          <div className="mb-2 flex gap-2">
            <Input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(tagInput);
                }
              }}
              placeholder="Digite uma tag..."
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => addTag(tagInput)}
              disabled={tags.length >= 10}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              Adicionar
            </button>
          </div>

          {suggestedTags && suggestedTags.length > 0 && (
            <div className="mb-2">
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Sugestões:</p>
              <div className="flex flex-wrap gap-1">
                {suggestedTags.slice(0, 10).map((tag) => (
                  <button
                    key={tag.tag_slug}
                    type="button"
                    onClick={() => addTag(tag.tag_name)}
                    disabled={tags.includes(tag.tag_name)}
                    className="rounded-full bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    {tag.tag_name}
                  </button>
                ))}
              </div>
            </div>
          )}

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

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
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
              editingId ? 'Guardar Alterações' : 'Criar Especialidade'
            )}
          </button>
        </div>
      </form>
    </ModalSimple>
  );
}
