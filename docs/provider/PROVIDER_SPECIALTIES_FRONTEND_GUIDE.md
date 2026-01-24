# 🎨 Guia de Implementação Frontend - Sistema de Especialidades

## 📋 Visão Geral

Este documento detalha a implementação frontend do sistema de especialidades para providers, incluindo componentes, fluxos de usuário e integrações com a API.

---

## 🏗️ Estrutura de Componentes

### 1. Provider Dashboard - Gestão de Especialidades

```
src/components/provider/specialties/
├── SpecialtiesManager.tsx          # Componente principal
├── PrimaryCategorySelector.tsx     # Seleção de categoria primária
├── SecondaryCategorySelector.tsx   # Seleção de categorias secundárias
├── SpecialtyTagsInput.tsx          # Input de tags de especialidade
├── ExperienceInput.tsx             # Input de anos de experiência
├── CertificationsManager.tsx       # Gestão de certificações
├── PortfolioManager.tsx            # Gestão de portfolio
└── SpecialtiesPreview.tsx          # Preview do perfil
```

---

## 📱 Fluxos de Usuário

### Fluxo 1: Configuração Inicial de Especialidades

```
1. Provider acessa "Minhas Especialidades"
2. Sistema verifica se já tem categoria primária
3. Se não:
   - Mostra wizard de configuração
   - Passo 1: Selecionar categoria primária
   - Passo 2: Adicionar subcategorias e tags
   - Passo 3: Informar experiência
   - Passo 4: (Opcional) Adicionar certificações
   - Passo 5: (Opcional) Adicionar categorias secundárias
4. Se sim:
   - Mostra dashboard de gestão
   - Permite editar categorias existentes
   - Permite adicionar/remover categorias secundárias
```

### Fluxo 2: Busca de Providers (Cliente)

```
1. Cliente acessa página de busca
2. Seleciona categoria principal (obrigatório)
3. (Opcional) Seleciona subcategorias
4. (Opcional) Adiciona filtros:
   - Tags de especialidade
   - Experiência mínima
   - Localização
   - Avaliação mínima
5. Sistema retorna resultados ordenados por relevância
6. Cliente pode reordenar por:
   - Relevância
   - Avaliação
   - Distância
   - Experiência
```

---

## 🔌 Integração com API

### Endpoints Necessários

#### 1. Gestão de Categorias do Provider

```typescript
// GET /api/provider/specialties
// Retorna todas as especialidades do provider autenticado
interface GetProviderSpecialtiesResponse {
  primary: ProviderCategory;
  secondary: ProviderCategory[];
}

// POST /api/provider/specialties
// Cria uma nova especialidade
interface CreateSpecialtyRequest {
  category_id: string;
  category_type: 'primary' | 'secondary';
  years_experience?: number;
  experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  specialty_tags?: string[];
  custom_description?: string;
  certifications?: Certification[];
}

// PUT /api/provider/specialties/:id
// Atualiza uma especialidade existente
interface UpdateSpecialtyRequest {
  years_experience?: number;
  experience_level?: string;
  specialty_tags?: string[];
  custom_description?: string;
  certifications?: Certification[];
  is_active?: boolean;
}

// DELETE /api/provider/specialties/:id
// Remove uma especialidade (apenas secundárias)
```

#### 2. Busca de Providers

```typescript
// POST /api/search/providers
interface SearchProvidersRequest {
  search_text?: string;
  category_ids?: string[];
  specialty_tags?: string[];
  location?: {
    lat: number;
    lng: number;
    radius_km: number;
  };
  min_rating?: number;
  experience_level?: string;
  show_closed?: boolean;
  sort_by?: 'relevance' | 'rating' | 'distance' | 'experience';
  limit?: number;
  offset?: number;
}

interface SearchProvidersResponse {
  providers: ProviderSearchResult[];
  total: number;
  has_more: boolean;
}
```

#### 3. Perfil Público do Provider

```typescript
// GET /api/providers/:id/profile
interface ProviderProfileResponse {
  profile: {
    id: string;
    full_name: string;
    business_name: string;
    avatar_url: string;
    bio: string;
    is_verified: boolean;
  };
  primary_category: {
    category_id: string;
    category_name: string;
    years_experience: number;
    experience_level: string;
    specialty_tags: string[];
    avg_rating: number;
    total_bookings: number;
  };
  secondary_categories: Array<{
    category_id: string;
    category_name: string;
    specialty_tags: string[];
  }>;
  portfolio: PortfolioItem[];
  statistics: {
    avg_rating: number;
    total_reviews: number;
    total_bookings: number;
    followers_count: number;
  };
}
```

#### 4. Categorias e Tags

```typescript
// GET /api/categories
// Retorna todas as categorias ativas
interface GetCategoriesResponse {
  categories: Category[];
}

// GET /api/categories/:id/tags
// Retorna tags sugeridas para uma categoria
interface GetCategoryTagsResponse {
  tags: SpecialtyTag[];
}

// POST /api/categories/:id/tags/suggest
// Sugere uma nova tag (requer aprovação)
interface SuggestTagRequest {
  tag_name: string;
  description?: string;
}
```

---

## 🎨 Componentes Detalhados

### 1. SpecialtiesManager.tsx

```typescript
import React, { useState, useEffect } from 'react';
import { useProviderSpecialties } from '@/hooks/useProviderSpecialties';

export const SpecialtiesManager: React.FC = () => {
  const { specialties, loading, updateSpecialty, deleteSpecialty } = useProviderSpecialties();
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="specialties-manager">
      <header>
        <h2>Minhas Especialidades</h2>
        <button onClick={() => setEditMode(!editMode)}>
          {editMode ? 'Salvar' : 'Editar'}
        </button>
      </header>

      {/* Categoria Primária */}
      <section className="primary-category">
        <h3>🎯 Especialidade Principal</h3>
        <PrimaryCategoryCard 
          category={specialties.primary}
          editMode={editMode}
          onUpdate={updateSpecialty}
        />
      </section>

      {/* Categorias Secundárias */}
      <section className="secondary-categories">
        <h3>📌 Especialidades Adicionais ({specialties.secondary.length}/2)</h3>
        {specialties.secondary.map(category => (
          <SecondaryCategoryCard
            key={category.id}
            category={category}
            editMode={editMode}
            onUpdate={updateSpecialty}
            onDelete={deleteSpecialty}
          />
        ))}
        
        {specialties.secondary.length < 2 && (
          <button onClick={() => setShowAddModal(true)}>
            ➕ Adicionar Especialidade
          </button>
        )}
      </section>

      {/* Portfolio */}
      <section className="portfolio">
        <h3>📸 Portfolio</h3>
        <PortfolioManager providerId={user.id} />
      </section>
    </div>
  );
};
```

### 2. PrimaryCategorySelector.tsx

```typescript
import React, { useState, useEffect } from 'react';
import { useCategories } from '@/hooks/useCategories';

interface Props {
  value?: string;
  onChange: (categoryId: string) => void;
}

export const PrimaryCategorySelector: React.FC<Props> = ({ value, onChange }) => {
  const { categories, loading } = useCategories({ level: 1 });
  const [selectedCategory, setSelectedCategory] = useState(value);
  const [subcategories, setSubcategories] = useState([]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    loadSubcategories(categoryId);
  };

  return (
    <div className="category-selector">
      <label>Categoria Principal *</label>
      
      {/* Grid de categorias principais */}
      <div className="categories-grid">
        {categories.map(category => (
          <CategoryCard
            key={category.id}
            category={category}
            selected={selectedCategory === category.id}
            onClick={() => handleCategorySelect(category.id)}
          />
        ))}
      </div>

      {/* Subcategorias (se houver) */}
      {subcategories.length > 0 && (
        <div className="subcategories">
          <label>Subcategorias</label>
          <div className="subcategories-list">
            {subcategories.map(sub => (
              <Checkbox
                key={sub.id}
                label={sub.name}
                checked={selectedSubcategories.includes(sub.id)}
                onChange={(checked) => handleSubcategoryToggle(sub.id, checked)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

### 3. SpecialtyTagsInput.tsx

```typescript
import React, { useState, useEffect } from 'react';
import { useCategoryTags } from '@/hooks/useCategoryTags';

interface Props {
  categoryId: string;
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

export const SpecialtyTagsInput: React.FC<Props> = ({ 
  categoryId, 
  value, 
  onChange,
  maxTags = 10 
}) => {
  const { suggestedTags, loading } = useCategoryTags(categoryId);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestedTags.filter(tag =>
    tag.tag_name.toLowerCase().includes(inputValue.toLowerCase()) &&
    !value.includes(tag.tag_name)
  );

  const handleAddTag = (tagName: string) => {
    if (value.length < maxTags && !value.includes(tagName)) {
      onChange([...value, tagName]);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagName: string) => {
    onChange(value.filter(t => t !== tagName));
  };

  return (
    <div className="specialty-tags-input">
      <label>Tags de Especialidade ({value.length}/{maxTags})</label>
      
      {/* Tags selecionadas */}
      <div className="selected-tags">
        {value.map(tag => (
          <span key={tag} className="tag">
            {tag}
            <button onClick={() => handleRemoveTag(tag)}>×</button>
          </span>
        ))}
      </div>

      {/* Input com autocomplete */}
      <div className="tag-input-wrapper">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Digite para buscar ou adicionar..."
          disabled={value.length >= maxTags}
        />

        {/* Sugestões */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {filteredSuggestions.map(tag => (
              <button
                key={tag.id}
                onClick={() => handleAddTag(tag.tag_name)}
                className="suggestion-item"
              >
                <span>{tag.tag_name}</span>
                {tag.description && (
                  <small>{tag.description}</small>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tags populares */}
      <div className="popular-tags">
        <small>Tags populares:</small>
        {suggestedTags.slice(0, 5).map(tag => (
          <button
            key={tag.id}
            onClick={() => handleAddTag(tag.tag_name)}
            className="popular-tag"
            disabled={value.includes(tag.tag_name) || value.length >= maxTags}
          >
            {tag.tag_name}
          </button>
        ))}
      </div>
    </div>
  );
};
```

### 4. ProviderSearchFilters.tsx (Cliente)

```typescript
import React, { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';

interface Props {
  onSearch: (filters: SearchFilters) => void;
}

export const ProviderSearchFilters: React.FC<Props> = ({ onSearch }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    category_ids: [],
    specialty_tags: [],
    min_rating: 0,
    experience_level: null,
    sort_by: 'relevance'
  });

  return (
    <div className="search-filters">
      {/* Categoria Principal */}
      <div className="filter-group">
        <label>Categoria</label>
        <CategorySelector
          value={filters.category_ids[0]}
          onChange={(id) => setFilters({ ...filters, category_ids: [id] })}
        />
      </div>

      {/* Tags de Especialidade */}
      <div className="filter-group">
        <label>Especialidades</label>
        <SpecialtyTagsSelector
          categoryId={filters.category_ids[0]}
          value={filters.specialty_tags}
          onChange={(tags) => setFilters({ ...filters, specialty_tags: tags })}
        />
      </div>

      {/* Experiência */}
      <div className="filter-group">
        <label>Experiência Mínima</label>
        <select
          value={filters.experience_level || ''}
          onChange={(e) => setFilters({ ...filters, experience_level: e.target.value || null })}
        >
          <option value="">Qualquer</option>
          <option value="beginner">Iniciante</option>
          <option value="intermediate">Intermediário</option>
          <option value="advanced">Avançado</option>
          <option value="expert">Especialista</option>
        </select>
      </div>

      {/* Avaliação */}
      <div className="filter-group">
        <label>Avaliação Mínima</label>
        <StarRatingSelector
          value={filters.min_rating}
          onChange={(rating) => setFilters({ ...filters, min_rating: rating })}
        />
      </div>

      {/* Localização */}
      <div className="filter-group">
        <label>Localização</label>
        <LocationInput
          value={filters.location}
          onChange={(location) => setFilters({ ...filters, location })}
        />
      </div>

      {/* Ordenação */}
      <div className="filter-group">
        <label>Ordenar por</label>
        <select
          value={filters.sort_by}
          onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}
        >
          <option value="relevance">Relevância</option>
          <option value="rating">Avaliação</option>
          <option value="distance">Distância</option>
          <option value="experience">Experiência</option>
        </select>
      </div>

      <button onClick={() => onSearch(filters)}>
        🔍 Buscar
      </button>
    </div>
  );
};
```

### 5. ProviderProfileView.tsx (Cliente)

```typescript
import React, { useEffect } from 'react';
import { useProviderProfile } from '@/hooks/useProviderProfile';

interface Props {
  providerId: string;
}

export const ProviderProfileView: React.FC<Props> = ({ providerId }) => {
  const { profile, loading, error } = useProviderProfile(providerId);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="provider-profile">
      {/* Header */}
      <header className="profile-header">
        <img src={profile.profile.avatar_url} alt={profile.profile.full_name} />
        <div>
          <h1>{profile.profile.business_name || profile.profile.full_name}</h1>
          <div className="rating">
            ⭐ {profile.statistics.avg_rating.toFixed(1)} 
            ({profile.statistics.total_reviews} avaliações)
          </div>
          {profile.profile.is_verified && (
            <span className="verified-badge">✓ Verificado</span>
          )}
        </div>
      </header>

      {/* Especialidade Principal */}
      <section className="primary-specialty">
        <h2>🎯 Especialidade Principal</h2>
        <div className="specialty-card">
          <h3>{profile.primary_category.category_name}</h3>
          <div className="experience">
            📅 {profile.primary_category.years_experience} anos de experiência
          </div>
          <div className="level">
            📊 Nível: {profile.primary_category.experience_level}
          </div>
          <div className="tags">
            {profile.primary_category.specialty_tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
          {profile.primary_category.custom_description && (
            <p className="description">
              {profile.primary_category.custom_description}
            </p>
          )}
        </div>
      </section>

      {/* Especialidades Secundárias */}
      {profile.secondary_categories.length > 0 && (
        <section className="secondary-specialties">
          <h2>📌 Outras Especialidades</h2>
          <div className="specialties-list">
            {profile.secondary_categories.map(category => (
              <div key={category.category_id} className="specialty-item">
                <h4>{category.category_name}</h4>
                <div className="tags">
                  {category.specialty_tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Portfolio */}
      {profile.portfolio.length > 0 && (
        <section className="portfolio">
          <h2>📸 Portfolio</h2>
          <div className="portfolio-grid">
            {profile.portfolio.map(item => (
              <PortfolioItem key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Estatísticas */}
      <section className="statistics">
        <div className="stat">
          <strong>{profile.statistics.total_bookings}</strong>
          <span>Serviços Realizados</span>
        </div>
        <div className="stat">
          <strong>{profile.statistics.total_reviews}</strong>
          <span>Avaliações</span>
        </div>
        <div className="stat">
          <strong>{profile.statistics.followers_count}</strong>
          <span>Seguidores</span>
        </div>
      </section>
    </div>
  );
};
```

---

## 🎯 Hooks Personalizados

### useProviderSpecialties.ts

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useProviderSpecialties = () => {
  const [specialties, setSpecialties] = useState({ primary: null, secondary: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const { data, error } = await supabase
        .from('provider_categories')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('provider_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      const primary = data.find(s => s.category_type === 'primary');
      const secondary = data.filter(s => s.category_type === 'secondary');

      setSpecialties({ primary, secondary });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateSpecialty = async (id: string, updates: Partial<ProviderCategory>) => {
    try {
      const { error } = await supabase
        .from('provider_categories')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchSpecialties();
    } catch (err) {
      setError(err);
    }
  };

  const deleteSpecialty = async (id: string) => {
    try {
      const { error } = await supabase
        .from('provider_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchSpecialties();
    } catch (err) {
      setError(err);
    }
  };

  return { specialties, loading, error, updateSpecialty, deleteSpecialty, refresh: fetchSpecialties };
};
```

---

## 🎨 Estilos Sugeridos (Tailwind CSS)

```css
/* Categoria Card */
.category-card {
  @apply p-6 rounded-lg border-2 border-gray-200 hover:border-primary-500 cursor-pointer transition-all;
}

.category-card.selected {
  @apply border-primary-500 bg-primary-50;
}

/* Tags */
.tag {
  @apply inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm;
}

.tag button {
  @apply hover:text-red-500;
}

/* Specialty Card */
.specialty-card {
  @apply p-6 rounded-lg bg-white shadow-md;
}

.specialty-card .experience {
  @apply flex items-center gap-2 text-gray-600 mt-2;
}

.specialty-card .tags {
  @apply flex flex-wrap gap-2 mt-4;
}
```

---

## ✅ Checklist de Implementação

### Backend
- [ ] Criar migration do banco de dados
- [ ] Implementar funções SQL
- [ ] Criar endpoints da API
- [ ] Implementar validações
- [ ] Adicionar testes unitários

### Frontend - Provider
- [ ] Criar componentes de gestão
- [ ] Implementar wizard de configuração inicial
- [ ] Criar gestão de portfolio
- [ ] Adicionar validações de formulário
- [ ] Implementar preview do perfil

### Frontend - Cliente
- [ ] Criar página de busca avançada
- [ ] Implementar filtros de especialidade
- [ ] Criar visualização de perfil
- [ ] Adicionar sistema de recomendações

### Testes
- [ ] Testes E2E do fluxo completo
- [ ] Testes de performance da busca
- [ ] Testes de usabilidade
- [ ] Testes de acessibilidade

---

**Criado em:** 2026-01-24  
**Versão:** 1.0
