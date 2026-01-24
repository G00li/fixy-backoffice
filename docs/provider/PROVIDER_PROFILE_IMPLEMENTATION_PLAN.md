# 🎯 Plano de Implementação - Perfil Completo do Provider

## 📋 Visão Geral

Implementação focada em criar a **base estrutural** do perfil do provider, permitindo que ele adicione todas as informações necessárias para divulgar seu trabalho e transmitir confiança ao cliente.

**Filosofia:** Criar fundação sólida agora, preparada para subscrições no futuro.

---

## 🎯 Objetivos Principais

### Para o Provider
1. ✅ Criar perfil profissional completo
2. ✅ Adicionar especialidades e expertise
3. ✅ Construir portfolio visual
4. ✅ Demonstrar credibilidade (certificações, experiência)
5. ✅ Ser encontrado por clientes relevantes

### Para o Cliente
1. ✅ Ver perfil detalhado do provider
2. ✅ Entender especialidades específicas
3. ✅ Avaliar qualidade através do portfolio
4. ✅ Verificar credenciais e experiência
5. ✅ Tomar decisão informada de contratação

---

## 📊 Escopo da Implementação

### ✅ O Que Vamos Implementar AGORA

#### 1. Sistema de Especialidades (Core)
- Categoria primária (obrigatória)
- Categorias secundárias (até 2, opcional)
- Tags de especialidade (até 10 por categoria)
- Anos de experiência
- Nível de expertise
- Descrição personalizada

#### 2. Sistema de Portfolio
- Upload de imagens
- Títulos e descrições
- Vinculação com categorias
- Ordenação e destaque
- Galeria visual

#### 3. Sistema de Certificações
- Adicionar certificações
- Nome, emissor, data
- Upload de documento/imagem
- Vinculação com especialidades

#### 4. Busca e Descoberta
- Busca por categoria
- Filtro por tags de especialidade
- Filtro por localização
- Ordenação por relevância
- Perfil público detalhado

### 🔮 O Que Vamos PREPARAR para o Futuro

#### 1. Campos de Plano (Estrutura)
- Campo `plan_tier` nas tabelas (default: 'free')
- Campo `visibility_boost` (default: 0)
- Estrutura pronta, mas não usada ainda

#### 2. Limites Flexíveis
- Configuração de limites por constantes
- Fácil ajuste quando implementar planos
- Sem lógica de bloqueio por enquanto

#### 3. Analytics Básico
- Contadores de visualizações
- Origem das buscas
- Preparado para analytics avançado futuro

---

## 🏗️ Arquitetura de Implementação

### Fase 1: Database (Semana 1) ✅ CONCLUÍDA
```
Prioridade: ALTA
Complexidade: MÉDIA
Tempo estimado: 3-4 dias
Status: ✅ COMPLETO (2026-01-24)
```

#### 1.1 Migration Principal ✅
```sql
-- Arquivo: 20260124000000_provider_specialties_system.sql

✅ Ajustar tabela categories (hierarquia)
✅ Criar tabela provider_categories
✅ Criar tabela category_specialty_tags
✅ Criar tabela provider_portfolio_items
✅ Criar tabela provider_certifications
✅ Criar índices de performance
✅ Criar triggers automáticos
✅ Implementar RLS policies
```

#### 1.2 Funções SQL ✅
```sql
-- Arquivo: 20260124000001_provider_specialties_functions.sql

✅ search_providers_by_specialties() - Busca avançada com relevância
✅ get_provider_profile_with_specialties() - Perfil completo
✅ get_category_suggestions() - Sugestões de tags
✅ update_provider_category_stats() - Atualizar estatísticas
✅ get_providers_by_category() - Listagem rápida por categoria
```

#### 1.3 Seed Data ✅
```sql
✅ Categorias principais (6)
✅ Subcategorias (11)
✅ Tags de especialidade (27)
```

**Migrations Aplicadas:**
- `20260124000000_provider_specialties_system.sql` ✅
- `20260124000001_provider_specialties_functions.sql` ✅

**Tabelas Criadas:**
- `provider_categories` (0 registros)
- `category_specialty_tags` (27 registros)
- `provider_portfolio_items` (0 registros)
- `provider_certifications` (0 registros)

**Funções Criadas:**
- `search_providers_by_specialties()` - Score de relevância: 95% qualidade + 5% boost futuro
- `get_provider_profile_with_specialties()` - Retorna JSON completo
- `get_category_suggestions()` - Tags sugeridas por categoria
- `update_provider_category_stats()` - Atualização de estatísticas
- `get_providers_by_category()` - Busca simplificada

### Fase 2: Backend API (Semana 2) ✅ CONCLUÍDA
```
Prioridade: ALTA
Complexidade: MÉDIA
Tempo estimado: 4-5 dias
Status: ✅ COMPLETO (2026-01-24)
```

#### 2.1 Endpoints - Especialidades
```typescript
POST   /api/provider/specialties          // Criar especialidade
GET    /api/provider/specialties          // Listar minhas especialidades
PUT    /api/provider/specialties/:id      // Atualizar especialidade
DELETE /api/provider/specialties/:id      // Remover especialidade (só secundárias)
GET    /api/categories                    // Listar categorias
GET    /api/categories/:id/tags           // Tags sugeridas
```

#### 2.2 Endpoints - Portfolio
```typescript
POST   /api/provider/portfolio            // Adicionar item
GET    /api/provider/portfolio            // Listar meu portfolio
PUT    /api/provider/portfolio/:id        // Atualizar item
DELETE /api/provider/portfolio/:id        // Remover item
POST   /api/provider/portfolio/:id/reorder // Reordenar
```

#### 2.3 Endpoints - Certificações
```typescript
POST   /api/provider/certifications       // Adicionar certificação
GET    /api/provider/certifications       // Listar certificações
PUT    /api/provider/certifications/:id   // Atualizar
DELETE /api/provider/certifications/:id   // Remover
```

#### 2.4 Endpoints - Busca
```typescript
POST   /api/search/providers              // Busca avançada
GET    /api/providers/:id/profile         // Perfil público
GET    /api/providers/:id/portfolio       // Portfolio público
```

### Fase 3: Frontend Provider (Semana 3-4) ✅ CONCLUÍDA
```
Prioridade: ALTA
Complexidade: ALTA
Tempo estimado: 7-8 dias
Status: ✅ COMPLETO (2026-01-24)
```

#### 3.1 Componentes de Gestão ✅
```
src/components/provider/
├── specialties/
│   ├── SpecialtiesManager.tsx           ✅ Gestão de especialidades
│   ├── PrimaryCategoryCard.tsx          ✅ Card categoria primária
│   ├── SecondaryCategoryCard.tsx        ✅ Card categoria secundária
│   └── SpecialtyForm.tsx                ✅ Form completo
├── portfolio/
│   ├── PortfolioManager.tsx             ✅ Gestão de portfolio
│   ├── PortfolioGrid.tsx                ✅ Grid responsivo
│   ├── PortfolioItem.tsx                ✅ Item individual
│   └── PortfolioForm.tsx                ✅ Form de criação/edição
├── certifications/
│   ├── CertificationsManager.tsx        ✅ Gestão de certificações
│   ├── CertificationCard.tsx            ✅ Card de certificação
│   └── CertificationForm.tsx            ✅ Form completo
└── profile/
    ├── ProfileDashboard.tsx             ✅ Dashboard principal
    ├── ProfileStats.tsx                 ✅ Estatísticas
    └── ProfilePreview.tsx               ✅ Preview do perfil
```

#### 3.2 Páginas ✅
```
src/app/(dashboard)/provider/profile/
├── page.tsx                         ✅ Dashboard do perfil
├── specialties/
│   └── page.tsx                     ✅ Gestão de especialidades
├── portfolio/
│   └── page.tsx                     ✅ Gestão de portfolio
└── certifications/
    └── page.tsx                     ✅ Gestão de certificações
```

#### 3.3 Hooks ✅
```typescript
useProviderSpecialties()    ✅ Gestão de especialidades
useProviderPortfolio()      ✅ Gestão de portfolio
useProviderCertifications() ✅ Gestão de certificações
useCategories()             ✅ Listar categorias e tags
```

### Fase 4: Frontend Cliente (Semana 5)
```
Prioridade: ALTA
Complexidade: MÉDIA
Tempo estimado: 4-5 dias
```

#### 4.1 Componentes de Busca
```
src/components/search/
├── ProviderSearch.tsx               // Busca principal
├── SearchFilters.tsx                // Filtros avançados
├── CategoryFilter.tsx               // Filtro de categoria
├── SpecialtyTagsFilter.tsx          // Filtro de tags
├── LocationFilter.tsx               // Filtro de localização
├── ProviderCard.tsx                 // Card de resultado
└── ProviderList.tsx                 // Lista de resultados
```

#### 4.2 Componentes de Perfil
```
src/components/provider/public/
├── ProviderProfile.tsx              // Perfil público completo
├── SpecialtiesSection.tsx           // Seção de especialidades
├── PortfolioGallery.tsx             // Galeria de portfolio
├── CertificationsSection.tsx        // Seção de certificações
├── StatsSection.tsx                 // Estatísticas
└── ContactSection.tsx               // Seção de contato
```

#### 4.3 Páginas
```
src/app/
├── search/page.tsx                  // Página de busca
├── providers/[id]/page.tsx          // Perfil público
└── explore/page.tsx                 // Explorar providers
```

### Fase 5: Testes e Ajustes (Semana 6)
```
Prioridade: MÉDIA
Complexidade: BAIXA
Tempo estimado: 3-4 dias
```

#### 5.1 Testes
```
✅ Testes de integração (API)
✅ Testes E2E (fluxos completos)
✅ Testes de performance (busca)
✅ Testes de usabilidade
```

#### 5.2 Ajustes
```
✅ Otimização de queries
✅ Ajustes de UX baseado em feedback
✅ Correção de bugs
✅ Documentação final
```

---

## 📝 Detalhamento Técnico

### 1. Schema do Banco de Dados

#### Tabela: provider_categories
```sql
CREATE TABLE provider_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  
  -- Tipo e ordem
  category_type TEXT NOT NULL CHECK (category_type IN ('primary', 'secondary')),
  display_order INTEGER NOT NULL CHECK (display_order BETWEEN 1 AND 3),
  
  -- Experiência
  years_experience INTEGER CHECK (years_experience >= 0 AND years_experience <= 50),
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  
  -- Descrição
  custom_description TEXT,
  
  -- Tags
  specialty_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Estatísticas (atualizadas por triggers)
  total_services INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  
  -- Visibilidade
  is_active BOOLEAN DEFAULT true,
  
  -- PREPARADO PARA FUTURO (não usado agora)
  plan_tier TEXT DEFAULT 'free',
  visibility_boost NUMERIC DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(provider_id, category_id),
  CONSTRAINT valid_display_order UNIQUE(provider_id, display_order)
);
```

#### Tabela: provider_portfolio_items
```sql
CREATE TABLE provider_portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_category_id UUID REFERENCES provider_categories(id) ON DELETE SET NULL,
  
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
  
  -- Ordem
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabela: provider_certifications (NOVA)
```sql
CREATE TABLE provider_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_category_id UUID REFERENCES provider_categories(id) ON DELETE SET NULL,
  
  -- Informações da certificação
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  credential_id TEXT,
  credential_url TEXT,
  
  -- Documento
  document_url TEXT,
  
  -- Verificação (futuro)
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  
  -- Visibilidade
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_certifications_provider ON provider_certifications(provider_id, is_active);
CREATE INDEX idx_certifications_category ON provider_certifications(provider_category_id);
```

### 2. Constantes de Configuração

```typescript
// src/lib/constants/provider-limits.ts

export const PROVIDER_LIMITS = {
  // Limites atuais (todos iguais por enquanto)
  SPECIALTY_TAGS_PER_CATEGORY: 10,
  PORTFOLIO_ITEMS: 50, // Generoso para todos
  CERTIFICATIONS: 20,  // Generoso para todos
  DESCRIPTION_MAX_LENGTH: 1000,
  
  // PREPARADO PARA FUTURO
  // Quando implementar planos, ajustar aqui:
  /*
  FREE: {
    PORTFOLIO_ITEMS: 10,
    CERTIFICATIONS: 3,
    DESCRIPTION_MAX_LENGTH: 500,
  },
  PREMIUM: {
    PORTFOLIO_ITEMS: 30,
    CERTIFICATIONS: 999,
    DESCRIPTION_MAX_LENGTH: 1500,
  },
  PREMIUM_PLUS: {
    PORTFOLIO_ITEMS: 999,
    CERTIFICATIONS: 999,
    DESCRIPTION_MAX_LENGTH: 9999,
  }
  */
};

// Função helper (preparada para futuro)
export function getProviderLimits(planTier: string = 'free') {
  // Por enquanto, retorna os mesmos limites para todos
  return PROVIDER_LIMITS;
  
  // FUTURO: retornar baseado no plano
  // return PROVIDER_LIMITS[planTier.toUpperCase()] || PROVIDER_LIMITS.FREE;
}
```

### 3. Função de Busca (Simplificada)

```sql
CREATE OR REPLACE FUNCTION search_providers_by_specialties(
  p_search_text TEXT DEFAULT NULL,
  p_category_ids UUID[] DEFAULT NULL,
  p_specialty_tags TEXT[] DEFAULT NULL,
  p_user_lat DOUBLE PRECISION DEFAULT NULL,
  p_user_lng DOUBLE PRECISION DEFAULT NULL,
  p_radius_km INTEGER DEFAULT 20,
  p_min_rating NUMERIC DEFAULT 0,
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
  primary_category_id UUID,
  primary_category_name TEXT,
  primary_specialty_tags TEXT[],
  secondary_categories JSONB,
  avg_rating NUMERIC,
  total_reviews BIGINT,
  distance_km NUMERIC,
  relevance_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.business_name,
    p.avatar_url,
    p.location_text,
    p.bio,
    p.is_verified,
    
    pc_primary.category_id,
    c_primary.name,
    pc_primary.specialty_tags,
    
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
    
    COALESCE(AVG(r.overall_rating), 0)::NUMERIC as avg_rating,
    COUNT(DISTINCT r.id) as total_reviews,
    
    CASE 
      WHEN p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL AND p.location IS NOT NULL
      THEN (ST_Distance(p.location, ST_Point(p_user_lng, p_user_lat)::geography) / 1000)::NUMERIC
      ELSE NULL
    END as distance_km,
    
    -- Score de relevância (SEM boost de plano por enquanto)
    (
      -- Match de categoria (40 pontos)
      CASE 
        WHEN p_category_ids IS NOT NULL AND pc_primary.category_id = ANY(p_category_ids) THEN 40
        ELSE 0
      END +
      
      -- Match de tags (10 pontos)
      CASE 
        WHEN p_specialty_tags IS NOT NULL AND pc_primary.specialty_tags && p_specialty_tags 
        THEN LEAST(cardinality(pc_primary.specialty_tags & p_specialty_tags) * 2, 10)
        ELSE 0
      END +
      
      -- Qualidade (30 pontos)
      (COALESCE(AVG(r.overall_rating), 0) / 5.0 * 15) +
      LEAST(COUNT(DISTINCT r.id) / 10.0, 10) +
      (CASE WHEN p.is_verified THEN 5 ELSE 0 END) +
      
      -- Experiência (15 pontos)
      LEAST(COALESCE(pc_primary.years_experience, 0), 10) +
      (CASE pc_primary.experience_level
        WHEN 'expert' THEN 5
        WHEN 'advanced' THEN 3
        WHEN 'intermediate' THEN 1
        ELSE 0
      END) +
      
      -- Engajamento (10 pontos)
      LEAST(COUNT(DISTINCT b.id) / 20.0, 5) +
      LEAST(COUNT(DISTINCT ppi.id) / 5.0, 5)
      
      -- FUTURO: Adicionar boost de plano aqui
      -- + (pc_primary.visibility_boost * 5)
      
    )::NUMERIC as relevance_score
    
  FROM profiles p
  INNER JOIN provider_categories pc_primary ON pc_primary.provider_id = p.id 
    AND pc_primary.category_type = 'primary'
    AND pc_primary.is_active = true
  INNER JOIN categories c_primary ON c_primary.id = pc_primary.category_id
  LEFT JOIN provider_categories pc_secondary ON pc_secondary.provider_id = p.id 
    AND pc_secondary.category_type = 'secondary'
    AND pc_secondary.is_active = true
  LEFT JOIN categories c_secondary ON c_secondary.id = pc_secondary.category_id
  LEFT JOIN reviews r ON r.provider_id = p.id
  LEFT JOIN bookings b ON b.provider_id = p.id AND b.status = 'completed'
  LEFT JOIN provider_portfolio_items ppi ON ppi.provider_id = p.id AND ppi.is_active = true
  
  WHERE 
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = p.id AND ur.role = 'provider'
    )
    AND (p_search_text IS NULL OR p.search_vector @@ plainto_tsquery('portuguese', p_search_text))
    AND (p_category_ids IS NULL OR pc_primary.category_id = ANY(p_category_ids))
    AND (p_specialty_tags IS NULL OR pc_primary.specialty_tags && p_specialty_tags)
    AND (p_user_lat IS NULL OR p_user_lng IS NULL OR p.location IS NULL OR
      ST_DWithin(p.location, ST_Point(p_user_lng, p_user_lat)::geography, p_radius_km * 1000))
    
  GROUP BY p.id, pc_primary.id, c_primary.id
  HAVING COALESCE(AVG(r.overall_rating), 0) >= p_min_rating
  ORDER BY relevance_score DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

---

## 📅 Cronograma Detalhado

### Semana 1: Database Foundation
```
Dia 1-2: Migration e Schema
- Criar migration completa
- Testar localmente
- Executar em desenvolvimento

Dia 3-4: Funções SQL
- Implementar funções de busca
- Implementar funções de perfil
- Testar performance

Dia 5: Seed Data
- Criar categorias
- Criar subcategorias
- Criar tags sugeridas
```

### Semana 2: Backend API
```
Dia 1-2: Endpoints de Especialidades
- CRUD completo
- Validações
- Testes

Dia 3: Endpoints de Portfolio
- Upload de imagens
- CRUD
- Reordenação

Dia 4: Endpoints de Certificações
- CRUD completo
- Upload de documentos

Dia 5: Endpoints de Busca
- Busca avançada
- Perfil público
- Testes de performance
```

### Semana 3: Frontend Provider (Parte 1)
```
Dia 1-2: Componentes de Especialidades
- Seletores de categoria
- Input de tags
- Form de experiência

Dia 3-4: Gestão de Portfolio
- Upload de imagens
- Edição de itens
- Reordenação drag-and-drop

Dia 5: Gestão de Certificações
- Form de certificação
- Upload de documentos
- Lista e edição
```

### Semana 4: Frontend Provider (Parte 2)
```
Dia 1-2: Dashboard do Perfil
- Visão geral
- Estatísticas básicas
- Ações rápidas

Dia 3-4: Preview e Ajustes
- Preview do perfil público
- Ajustes de UX
- Validações

Dia 5: Integração e Testes
- Integração completa
- Testes E2E
- Correções
```

### Semana 5: Frontend Cliente
```
Dia 1-2: Busca Avançada
- Filtros de categoria
- Filtros de tags
- Filtros de localização

Dia 3-4: Perfil Público
- Layout completo
- Seções de especialidades
- Galeria de portfolio

Dia 5: Ajustes Finais
- Responsividade
- Performance
- Acessibilidade
```

### Semana 6: Testes e Lançamento
```
Dia 1-2: Testes Completos
- Testes de integração
- Testes E2E
- Testes de performance

Dia 3-4: Ajustes e Correções
- Bugs encontrados
- Melhorias de UX
- Otimizações

Dia 5: Documentação e Deploy
- Documentação final
- Deploy em staging
- Preparação para produção
```

---

## ✅ Checklist de Implementação

### Database
- [x] Migration criada e testada
- [x] Funções SQL implementadas
- [x] Triggers configurados
- [x] RLS policies ativas
- [x] Índices criados
- [x] Seed data inserido

### Backend
- [x] Endpoints de especialidades
- [x] Endpoints de portfolio
- [x] Endpoints de certificações
- [x] Endpoints de busca
- [x] Validações implementadas
- [x] Testes de API

### Frontend Provider
- [x] Gestão de especialidades
- [x] Gestão de portfolio
- [x] Gestão de certificações
- [x] Dashboard do perfil
- [x] Preview do perfil
- [ ] Testes E2E

### Frontend Cliente
- [ ] Página de busca
- [ ] Filtros avançados
- [ ] Perfil público
- [ ] Galeria de portfolio
- [ ] Responsividade
- [ ] Testes E2E

### Qualidade
- [ ] Testes de performance
- [ ] Testes de usabilidade
- [ ] Acessibilidade (WCAG)
- [ ] SEO básico
- [ ] Documentação

---

## 🚀 Próximos Passos Imediatos

### 1. Aprovação e Alinhamento
- [ ] Revisar este plano
- [ ] Confirmar escopo
- [ ] Definir prioridades
- [ ] Alinhar expectativas

### 2. Preparação
- [ ] Criar branch de desenvolvimento
- [ ] Configurar ambiente
- [ ] Preparar ferramentas

### 3. Início da Implementação
- [ ] Executar migration
- [ ] Inserir seed data
- [ ] Começar desenvolvimento

---

## 💡 Observações Importantes

### Sobre Subscrições
- ✅ Estrutura preparada (campos `plan_tier`, `visibility_boost`)
- ✅ Constantes configuráveis
- ✅ Fácil ativação no futuro
- ❌ Não implementar lógica de bloqueio agora
- ❌ Não implementar billing agora

### Sobre Limites
- Todos os providers têm os mesmos limites generosos
- Limites são configuráveis via constantes
- Fácil ajuste quando implementar planos

### Sobre Analytics
- Implementar contadores básicos (views, clicks)
- Preparar estrutura para analytics avançado
- Não implementar dashboard complexo agora

---

**Criado em:** 2026-01-24  
**Versão:** 1.0  
**Status:** 📋 Aguardando Aprovação para Início
