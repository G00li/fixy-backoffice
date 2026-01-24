# 🎯 Sistema de Especialidades e Categorias para Providers - Fixy

## 📋 Visão Geral

Sistema robusto e inovador que permite aos providers especificarem suas áreas de atuação com até 3 categorias (1 principal + 2 auxiliares), criando um perfil detalhado e melhorando significativamente a qualidade das buscas e recomendações.

---

## 🎯 Objetivos

### Para Providers
- ✅ Definir especialidade principal (categoria primária)
- ✅ Adicionar até 2 especialidades auxiliares
- ✅ Criar subcategorias/tags personalizadas dentro de cada categoria
- ✅ Destacar expertise específica no perfil
- ✅ Melhorar visibilidade em buscas relevantes

### Para Clientes
- ✅ Encontrar providers mais especializados
- ✅ Ver detalhes específicos da expertise
- ✅ Receber recomendações mais precisas
- ✅ Filtrar por especialidades específicas

### Para o Sistema
- ✅ Algoritmo de busca mais inteligente
- ✅ Recomendações baseadas em múltiplas categorias
- ✅ Analytics detalhados por especialidade
- ✅ Sistema de ranking por categoria

---

## 🏗️ Arquitetura do Sistema

### 1. Estrutura de Dados

```
Provider
  ├── Primary Category (Obrigatória)
  │   ├── Subcategories/Tags
  │   ├── Years of Experience
  │   ├── Certifications
  │   └── Portfolio Items
  │
  ├── Secondary Category 1 (Opcional)
  │   ├── Subcategories/Tags
  │   └── Experience Level
  │
  └── Secondary Category 2 (Opcional)
      ├── Subcategories/Tags
      └── Experience Level
```

### 2. Hierarquia de Categorias

```
Category (Nível 1)
  └── Subcategory (Nível 2)
      └── Specialty Tags (Nível 3)
```

**Exemplo:**
```
Beleza e Estética
  └── Cabelo
      ├── Corte Masculino
      ├── Coloração
      ├── Tratamentos Capilares
      └── Penteados para Eventos
  └── Maquiagem
      ├── Maquiagem Social
      ├── Maquiagem para Noivas
      └── Automaquiagem
```

---

## 📊 Schema do Banco de Dados

### 1. Tabela: categories (Já existe - Ajustes)

```sql
-- Adicionar campos para hierarquia
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1 CHECK (level IN (1, 2));
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS keywords TEXT[];
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

COMMENT ON COLUMN categories.parent_id IS 'Parent category for subcategories';
COMMENT ON COLUMN categories.level IS 'Category level: 1 = main, 2 = subcategory';
COMMENT ON COLUMN categories.keywords IS 'Keywords for search optimization';

CREATE INDEX idx_categories_parent ON categories(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_categories_active ON categories(is_active, level, display_order);
```

### 2. Tabela: provider_categories (Nova)

```sql
CREATE TABLE provider_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  
  -- Tipo de categoria
  category_type TEXT NOT NULL CHECK (category_type IN ('primary', 'secondary')),
  display_order INTEGER NOT NULL CHECK (display_order BETWEEN 1 AND 3),
  
  -- Experiência e expertise
  years_experience INTEGER CHECK (years_experience >= 0),
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  
  -- Certificações e qualificações
  certifications JSONB DEFAULT '[]'::jsonb,
  
  -- Descrição personalizada
  custom_description TEXT,
  
  -- Subcategorias e tags
  subcategories UUID[] DEFAULT ARRAY[]::UUID[],
  specialty_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Estatísticas
  total_services INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  
  -- Visibilidade
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(provider_id, category_id),
  CONSTRAINT valid_display_order UNIQUE(provider_id, display_order)
);

-- Constraint: Apenas 1 categoria primária por provider
CREATE UNIQUE INDEX idx_provider_primary_category 
  ON provider_categories(provider_id) 
  WHERE category_type = 'primary';

-- Constraint: Máximo 2 categorias secundárias
CREATE OR REPLACE FUNCTION check_max_secondary_categories()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.category_type = 'secondary' THEN
    IF (
      SELECT COUNT(*) 
      FROM provider_categories 
      WHERE provider_id = NEW.provider_id 
      AND category_type = 'secondary'
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) >= 2 THEN
      RAISE EXCEPTION 'Provider can have maximum 2 secondary categories';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_secondary_categories
  BEFORE INSERT OR UPDATE ON provider_categories
  FOR EACH ROW
  EXECUTE FUNCTION check_max_secondary_categories();

-- Índices
CREATE INDEX idx_provider_categories_provider ON provider_categories(provider_id, category_type, display_order);
CREATE INDEX idx_provider_categories_category ON provider_categories(category_id, is_active);
CREATE INDEX idx_provider_categories_featured ON provider_categories(is_featured, category_id) WHERE is_featured = true;
CREATE INDEX idx_provider_categories_tags ON provider_categories USING GIN(specialty_tags);

COMMENT ON TABLE provider_categories IS 'Provider specialties with primary and secondary categories';
```

### 3. Tabela: category_specialty_tags (Nova)

```sql
CREATE TABLE category_specialty_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  tag_slug TEXT NOT NULL,
  description TEXT,
  
  -- Popularidade
  usage_count INTEGER DEFAULT 0,
  
  -- Moderação
  is_approved BOOLEAN DEFAULT false,
  is_suggested BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(category_id, tag_slug)
);

CREATE INDEX idx_specialty_tags_category ON category_specialty_tags(category_id, is_approved);
CREATE INDEX idx_specialty_tags_popular ON category_specialty_tags(usage_count DESC) WHERE is_approved = true;

COMMENT ON TABLE category_specialty_tags IS 'Predefined specialty tags for each category';
```

### 4. Tabela: provider_portfolio_items (Nova)

```sql
CREATE TABLE provider_portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_category_id UUID REFERENCES provider_categories(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  
  -- Mídia
  media_type TEXT CHECK (media_type IN ('image', 'video')) DEFAULT 'image',
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Categorização
  category_id UUID REFERENCES categories(id),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Engajamento
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  
  -- Ordem e visibilidade
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portfolio_provider ON provider_portfolio_items(provider_id, is_active, display_order);
CREATE INDEX idx_portfolio_category ON provider_portfolio_items(provider_category_id);
CREATE INDEX idx_portfolio_featured ON provider_portfolio_items(is_featured, views_count DESC) WHERE is_featured = true;

COMMENT ON TABLE provider_portfolio_items IS 'Portfolio items linked to specific provider categories';
```

---

## 🔍 Sistema de Busca Avançado

### 1. Função: search_providers_by_specialties

```sql
CREATE OR REPLACE FUNCTION search_providers_by_specialties(
  p_search_text TEXT DEFAULT NULL,
  p_category_ids UUID[] DEFAULT NULL,
  p_specialty_tags TEXT[] DEFAULT NULL,
  p_user_lat DOUBLE PRECISION DEFAULT NULL,
  p_user_lng DOUBLE PRECISION DEFAULT NULL,
  p_radius_km INTEGER DEFAULT 20,
  p_min_rating NUMERIC DEFAULT 0,
  p_experience_level TEXT DEFAULT NULL,
  p_show_closed BOOLEAN DEFAULT true,
  p_sort_by TEXT DEFAULT 'relevance', -- relevance, rating, distance, experience
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  provider_id UUID,
  full_name TEXT,
  business_name TEXT,
  avatar_url TEXT,
  location_text TEXT,
  bio TEXT,
  is_verified BOOLEAN,
  
  -- Categoria principal
  primary_category_id UUID,
  primary_category_name TEXT,
  primary_experience_years INTEGER,
  primary_specialty_tags TEXT[],
  
  -- Categorias secundárias
  secondary_categories JSONB,
  
  -- Estatísticas
  avg_rating NUMERIC,
  total_reviews BIGINT,
  total_bookings BIGINT,
  distance_km NUMERIC,
  
  -- Status
  is_open BOOLEAN,
  status_type TEXT,
  
  -- Relevância
  relevance_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH provider_data AS (
    SELECT 
      p.id,
      p.full_name,
      p.business_name,
      p.avatar_url,
      p.location_text,
      p.bio,
      p.is_verified,
      
      -- Categoria primária
      pc_primary.category_id as primary_category_id,
      c_primary.name as primary_category_name,
      pc_primary.years_experience as primary_experience_years,
      pc_primary.specialty_tags as primary_specialty_tags,
      
      -- Categorias secundárias (agregadas)
      COALESCE(
        jsonb_agg(
          DISTINCT jsonb_build_object(
            'category_id', pc_secondary.category_id,
            'category_name', c_secondary.name,
            'specialty_tags', pc_secondary.specialty_tags
          )
        ) FILTER (WHERE pc_secondary.id IS NOT NULL),
        '[]'::jsonb
      ) as secondary_categories,
      
      -- Estatísticas
      COALESCE(AVG(r.overall_rating), 0)::NUMERIC as avg_rating,
      COUNT(DISTINCT r.id) as total_reviews,
      COUNT(DISTINCT b.id) as total_bookings,
      
      -- Distância
      CASE 
        WHEN p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL AND p.location IS NOT NULL
        THEN (ST_Distance(p.location, ST_Point(p_user_lng, p_user_lat)::geography) / 1000)::NUMERIC
        ELSE NULL
      END as distance_km,
      
      -- Status
      COALESCE(ps.is_open, false) as is_open,
      COALESCE(ps.status_type, 'closed') as status_type,
      
      -- Score de relevância
      (
        -- Match de texto
        CASE 
          WHEN p_search_text IS NOT NULL THEN
            ts_rank(p.search_vector, plainto_tsquery('portuguese', p_search_text)) * 10
          ELSE 0
        END +
        
        -- Match de categoria primária
        CASE 
          WHEN p_category_ids IS NOT NULL AND pc_primary.category_id = ANY(p_category_ids) THEN 5
          ELSE 0
        END +
        
        -- Match de tags
        CASE 
          WHEN p_specialty_tags IS NOT NULL AND pc_primary.specialty_tags && p_specialty_tags THEN 3
          ELSE 0
        END +
        
        -- Boost por rating
        COALESCE(AVG(r.overall_rating), 0) * 0.5 +
        
        -- Boost por verificação
        CASE WHEN p.is_verified THEN 2 ELSE 0 END +
        
        -- Boost por experiência
        COALESCE(pc_primary.years_experience, 0) * 0.1
      )::NUMERIC as relevance_score
      
    FROM profiles p
    
    -- Categoria primária (obrigatória)
    INNER JOIN provider_categories pc_primary ON pc_primary.provider_id = p.id 
      AND pc_primary.category_type = 'primary'
      AND pc_primary.is_active = true
    INNER JOIN categories c_primary ON c_primary.id = pc_primary.category_id
    
    -- Categorias secundárias (opcional)
    LEFT JOIN provider_categories pc_secondary ON pc_secondary.provider_id = p.id 
      AND pc_secondary.category_type = 'secondary'
      AND pc_secondary.is_active = true
    LEFT JOIN categories c_secondary ON c_secondary.id = pc_secondary.category_id
    
    -- Reviews e bookings
    LEFT JOIN reviews r ON r.provider_id = p.id
    LEFT JOIN bookings b ON b.provider_id = p.id AND b.status = 'completed'
    
    -- Status
    LEFT JOIN provider_status ps ON ps.provider_id = p.id
    
    WHERE 
      -- É provider
      EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = p.id AND ur.role = 'provider'
      )
      
      -- Filtro de texto
      AND (
        p_search_text IS NULL OR 
        p.search_vector @@ plainto_tsquery('portuguese', p_search_text)
      )
      
      -- Filtro de categorias
      AND (
        p_category_ids IS NULL OR
        pc_primary.category_id = ANY(p_category_ids) OR
        EXISTS (
          SELECT 1 FROM provider_categories pc
          WHERE pc.provider_id = p.id
          AND pc.category_id = ANY(p_category_ids)
          AND pc.is_active = true
        )
      )
      
      -- Filtro de tags
      AND (
        p_specialty_tags IS NULL OR
        pc_primary.specialty_tags && p_specialty_tags OR
        EXISTS (
          SELECT 1 FROM provider_categories pc
          WHERE pc.provider_id = p.id
          AND pc.specialty_tags && p_specialty_tags
          AND pc.is_active = true
        )
      )
      
      -- Filtro de localização
      AND (
        p_user_lat IS NULL OR p_user_lng IS NULL OR p.location IS NULL OR
        ST_DWithin(p.location, ST_Point(p_user_lng, p_user_lat)::geography, p_radius_km * 1000)
      )
      
      -- Filtro de experiência
      AND (
        p_experience_level IS NULL OR
        pc_primary.experience_level = p_experience_level
      )
      
      -- Filtro de status
      AND (p_show_closed OR ps.is_open = true)
      
    GROUP BY 
      p.id, 
      pc_primary.id, 
      c_primary.id,
      ps.is_open, 
      ps.status_type
      
    HAVING 
      COALESCE(AVG(r.overall_rating), 0) >= p_min_rating
  )
  
  SELECT * FROM provider_data
  ORDER BY 
    CASE p_sort_by
      WHEN 'relevance' THEN relevance_score
      WHEN 'rating' THEN avg_rating
      WHEN 'distance' THEN -distance_km -- Negativo para ordem crescente
      WHEN 'experience' THEN primary_experience_years::numeric
      ELSE relevance_score
    END DESC NULLS LAST
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION search_providers_by_specialties IS 'Advanced provider search with specialty matching and relevance scoring';
```

### 2. Função: get_provider_profile_with_specialties

```sql
CREATE OR REPLACE FUNCTION get_provider_profile_with_specialties(
  p_provider_id UUID
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'profile', jsonb_build_object(
      'id', p.id,
      'full_name', p.full_name,
      'business_name', p.business_name,
      'display_name', p.display_name,
      'avatar_url', p.avatar_url,
      'cover_image_url', p.cover_image_url,
      'bio', p.bio,
      'location_text', p.location_text,
      'is_verified', p.is_verified,
      'verified_at', p.verified_at
    ),
    
    'primary_category', (
      SELECT jsonb_build_object(
        'category_id', pc.category_id,
        'category_name', c.name,
        'category_slug', c.slug,
        'years_experience', pc.years_experience,
        'experience_level', pc.experience_level,
        'certifications', pc.certifications,
        'custom_description', pc.custom_description,
        'specialty_tags', pc.specialty_tags,
        'avg_rating', pc.avg_rating,
        'total_services', pc.total_services,
        'total_bookings', pc.total_bookings
      )
      FROM provider_categories pc
      JOIN categories c ON c.id = pc.category_id
      WHERE pc.provider_id = p.id
      AND pc.category_type = 'primary'
      AND pc.is_active = true
    ),
    
    'secondary_categories', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'category_id', pc.category_id,
          'category_name', c.name,
          'category_slug', c.slug,
          'years_experience', pc.years_experience,
          'experience_level', pc.experience_level,
          'specialty_tags', pc.specialty_tags,
          'display_order', pc.display_order
        ) ORDER BY pc.display_order
      ), '[]'::jsonb)
      FROM provider_categories pc
      JOIN categories c ON c.id = pc.category_id
      WHERE pc.provider_id = p.id
      AND pc.category_type = 'secondary'
      AND pc.is_active = true
    ),
    
    'portfolio', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', ppi.id,
          'title', ppi.title,
          'description', ppi.description,
          'media_type', ppi.media_type,
          'media_url', ppi.media_url,
          'thumbnail_url', ppi.thumbnail_url,
          'category_name', c.name,
          'tags', ppi.tags,
          'is_featured', ppi.is_featured
        ) ORDER BY ppi.is_featured DESC, ppi.display_order
      ), '[]'::jsonb)
      FROM provider_portfolio_items ppi
      LEFT JOIN categories c ON c.id = ppi.category_id
      WHERE ppi.provider_id = p.id
      AND ppi.is_active = true
    ),
    
    'statistics', jsonb_build_object(
      'avg_rating', COALESCE(AVG(r.overall_rating), 0),
      'total_reviews', COUNT(DISTINCT r.id),
      'total_bookings', COUNT(DISTINCT b.id),
      'completed_bookings', COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'completed'),
      'followers_count', COUNT(DISTINCT f.follower_id)
    )
  ) INTO result
  FROM profiles p
  LEFT JOIN reviews r ON r.provider_id = p.id
  LEFT JOIN bookings b ON b.provider_id = p.id
  LEFT JOIN follows f ON f.following_id = p.id
  WHERE p.id = p_provider_id
  GROUP BY p.id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_provider_profile_with_specialties IS 'Get complete provider profile with all specialties and statistics';
```

---

## 🎨 Interface do Usuário (Sugestões)

### 1. Tela de Configuração de Especialidades (Provider)

```
┌─────────────────────────────────────────────┐
│  Minhas Especialidades                      │
├─────────────────────────────────────────────┤
│                                             │
│  🎯 Categoria Principal *                   │
│  ┌─────────────────────────────────────┐   │
│  │ Beleza e Estética              ▼    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  📋 Subcategorias                           │
│  ☑ Cabelo  ☑ Maquiagem  ☐ Unhas           │
│                                             │
│  🏷️ Tags de Especialidade                  │
│  [Corte Masculino] [Coloração] [+]         │
│                                             │
│  📅 Anos de Experiência: [5]               │
│  📊 Nível: ● Avançado                      │
│                                             │
│  📝 Descrição Personalizada                │
│  ┌─────────────────────────────────────┐   │
│  │ Especialista em cortes modernos...  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ➕ Adicionar Categoria Auxiliar (0/2)     │
│                                             │
└─────────────────────────────────────────────┘
```

### 2. Perfil do Provider (Cliente)

```
┌─────────────────────────────────────────────┐
│  João Silva - Barbeiro Profissional        │
│  ⭐ 4.8 (127 avaliações) ✓ Verificado      │
├─────────────────────────────────────────────┤
│                                             │
│  🎯 ESPECIALIDADE PRINCIPAL                 │
│  Beleza e Estética > Cabelo                │
│  • 5 anos de experiência                   │
│  • Nível: Avançado                         │
│  • Corte Masculino, Coloração, Barba       │
│                                             │
│  📌 OUTRAS ESPECIALIDADES                   │
│  • Estética Facial (2 anos)                │
│  • Design de Sobrancelhas (1 ano)          │
│                                             │
│  📸 PORTFÓLIO                               │
│  [Imagem] [Imagem] [Imagem] [Ver mais]     │
│                                             │
└─────────────────────────────────────────────┘
```

### 3. Busca Avançada (Cliente)

```
┌─────────────────────────────────────────────┐
│  🔍 Buscar Profissionais                    │
├─────────────────────────────────────────────┤
│                                             │
│  Categoria Principal                        │
│  ┌─────────────────────────────────────┐   │
│  │ Beleza e Estética              ▼    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Especialidades                             │
│  ☑ Corte Masculino                         │
│  ☑ Coloração                               │
│  ☐ Tratamentos                             │
│                                             │
│  Experiência Mínima                         │
│  ○ Qualquer  ● 3+ anos  ○ 5+ anos         │
│                                             │
│  📍 Localização: [Lisboa]  Raio: [10km]    │
│  ⭐ Avaliação mínima: [4.0]                │
│                                             │
│  [Buscar]                                   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🚀 Plano de Implementação

### Fase 1: Database Schema (Semana 1)
- [ ] Criar migration para ajustes na tabela `categories`
- [ ] Criar tabela `provider_categories`
- [ ] Criar tabela `category_specialty_tags`
- [ ] Criar tabela `provider_portfolio_items`
- [ ] Implementar constraints e triggers
- [ ] Criar índices de performance

### Fase 2: Functions e Procedures (Semana 1-2)
- [ ] Implementar `search_providers_by_specialties()`
- [ ] Implementar `get_provider_profile_with_specialties()`
- [ ] Criar função de recomendação baseada em categorias
- [ ] Implementar analytics por categoria

### Fase 3: Backend API (Semana 2-3)
- [ ] Endpoints para gerenciar categorias do provider
- [ ] Endpoints de busca avançada
- [ ] Endpoints de portfolio
- [ ] Sistema de sugestão de tags

### Fase 4: Frontend - Provider (Semana 3-4)
- [ ] Tela de configuração de especialidades
- [ ] Upload e gestão de portfolio
- [ ] Visualização de estatísticas por categoria

### Fase 5: Frontend - Cliente (Semana 4-5)
- [ ] Busca avançada com filtros de especialidade
- [ ] Visualização de perfil detalhado
- [ ] Sistema de recomendações

### Fase 6: Analytics e Otimização (Semana 5-6)
- [ ] Dashboard de analytics por categoria
- [ ] Otimização de queries
- [ ] A/B testing do algoritmo de busca
- [ ] Ajustes baseados em feedback

---

## 📈 Métricas de Sucesso

### Para Providers
- Taxa de preenchimento de especialidades: > 80%
- Média de categorias por provider: 2.5
- Aumento em visualizações de perfil: +40%
- Aumento em bookings: +25%

### Para Clientes
- Tempo médio de busca: < 2 minutos
- Taxa de conversão (busca → booking): +30%
- Satisfação com resultados: > 4.5/5
- Taxa de rebooking: +20%

### Para o Sistema
- Precisão das recomendações: > 75%
- Performance de busca: < 200ms
- Cobertura de categorias: > 90%

---

## 🔐 Segurança e Validações

### Regras de Negócio
1. ✅ Provider DEVE ter 1 categoria primária
2. ✅ Provider PODE ter até 2 categorias secundárias
3. ✅ Cada categoria pode ter até 10 tags de especialidade
4. ✅ Anos de experiência devem ser validados (0-50)
5. ✅ Portfolio limitado a 20 itens por provider
6. ✅ Tags devem ser aprovadas por moderação

### RLS Policies
```sql
-- Providers podem gerenciar suas próprias categorias
CREATE POLICY "Providers manage own categories"
  ON provider_categories FOR ALL
  USING (provider_id = auth.uid());

-- Todos podem visualizar categorias ativas
CREATE POLICY "Everyone can view active categories"
  ON provider_categories FOR SELECT
  USING (is_active = true);

-- Admins podem gerenciar todas as categorias
CREATE POLICY "Admins manage all categories"
  ON provider_categories FOR ALL
  USING (is_admin_or_above());
```

---

## 🎯 Próximos Passos

1. **Revisar e aprovar este plano**
2. **Criar categorias iniciais** (seed data)
3. **Implementar migration do banco de dados**
4. **Desenvolver APIs**
5. **Criar interfaces**
6. **Testar com providers beta**
7. **Lançar gradualmente**

---

**Criado em:** 2026-01-24  
**Versão:** 1.0  
**Status:** 📋 Aguardando Aprovação
