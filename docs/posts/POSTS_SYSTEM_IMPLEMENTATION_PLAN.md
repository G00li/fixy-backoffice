# 📝 Plano de Implementação - Sistema de Posts (Fase 2.1)

## 🎯 Objetivo

Implementar um sistema completo de posts para providers, permitindo:
1. ✅ Criar posts com texto, imagens e vídeos
2. ✅ Receber likes (reações) de clientes e outros providers
3. ✅ Receber comentários
4. ✅ **Fixar posts no perfil** (destaque)
5. 🔮 **Promover posts** (futuro - sistema de anúncios)
6. 🔮 **Planos de conta** (free, premium, premium+)

---

## 📊 Análise da Base de Dados Atual

### ✅ Tabelas Existentes

#### 1. `provider_posts` (Estrutura Básica Existente)
```sql
- id (uuid, PK)
- provider_id (uuid, FK → profiles)
- type (text: 'image', 'video', 'carousel')
- media_urls (text[])
- thumbnail_url (text)
- caption (text)
- service_id (uuid, FK → services)
- tags (text[])
- likes_count (integer, default: 0)
- comments_count (integer, default: 0)
- shares_count (integer, default: 0)
- views_count (integer, default: 0)
- is_active (boolean, default: true)
- moderation_status (text: 'pending', 'approved', 'rejected')
- moderation_reason (text)
- moderated_by (uuid, FK → auth.users)
- moderated_at (timestamptz)
- alt_text (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 2. `post_likes` (Existente)
```sql
- user_id (uuid, PK, FK → profiles)
- post_id (uuid, PK, FK → provider_posts)
- created_at (timestamptz)
```

#### 3. `post_comments` (Existente)
```sql
- id (uuid, PK)
- post_id (uuid, FK → provider_posts)
- user_id (uuid, FK → profiles)
- comment (text)
- created_at (timestamptz)
```

### ⚠️ O Que Falta Adicionar

#### 1. **Campo para Fixar Posts** (is_pinned)
- Permite provider destacar posts importantes no perfil
- Limite de posts fixados por plano

#### 2. **Campos para Promoção de Posts** (futuro)
- is_promoted (boolean)
- promotion_start_date (timestamptz)
- promotion_end_date (timestamptz)
- promotion_budget (numeric)
- promotion_impressions (integer)
- promotion_clicks (integer)

#### 3. **Campos para Planos** (futuro)
- Já existe `current_plan_id` em `profiles`
- Tabela `plans` já existe

#### 4. **Reações em Comentários** (opcional)
- Permitir likes em comentários

#### 5. **Respostas a Comentários** (threading)
- parent_comment_id para criar threads

---

## 🏗️ Arquitetura da Implementação

### Fase 1: Melhorias no Backend (SQL) ✅
1. Migration para adicionar campos faltantes
2. Funções SQL para operações comuns
3. Triggers para atualizar contadores
4. RLS policies
5. Índices para performance

### Fase 2: Types TypeScript ✅
1. Interfaces completas
2. Enums e constantes
3. Tipos de resposta

### Fase 3: Server Actions ✅
1. CRUD de posts
2. Likes e unlikes
3. Comentários
4. Fixar/desfixar posts
5. Buscar posts (feed)

### Fase 4: Componentes React ✅
1. PostCard (exibição)
2. PostForm (criação/edição)
3. PostMediaUploader (upload)
4. PostGallery (galeria)
5. PostEngagementStats (estatísticas)
6. PostCommentsList (comentários)
7. PostFeed (feed de posts)

### Fase 5: Páginas Next.js ✅
1. /provider/posts (gestão de posts)
2. /provider/posts/new (criar post)
3. /provider/posts/[id] (editar post)
4. /posts/[id] (visualizar post público)
5. /feed (feed público de posts)

### Fase 6: Integração com Planos 🔮
1. Limites por plano
2. Features exclusivas
3. Sistema de promoção

---

## 📝 Detalhamento da Implementação

### FASE 1: Migration SQL

**Arquivo:** `fixy-supabase/supabase/migrations/YYYYMMDD_posts_system_enhancements.sql`

#### 1.1 Adicionar Campos Faltantes

```sql
-- =====================================================
-- Migration: Posts System Enhancements
-- Description: Adiciona funcionalidades de fixar posts e preparação para promoção
-- =====================================================

-- 1. Adicionar campos para fixar posts
ALTER TABLE public.provider_posts
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS pinned_order INTEGER DEFAULT 0;

-- 2. Adicionar campos para promoção (futuro)
ALTER TABLE public.provider_posts
ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS promotion_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS promotion_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS promotion_budget DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS promotion_impressions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS promotion_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS promotion_ctr DECIMAL(5,2) DEFAULT 0; -- Click-through rate

-- 3. Adicionar campo para tipo de conteúdo (texto puro)
ALTER TABLE public.provider_posts
ALTER COLUMN type TYPE TEXT,
ADD CONSTRAINT check_post_type 
  CHECK (type IN ('text', 'image', 'video', 'carousel'));

-- 4. Permitir posts sem mídia (apenas texto)
ALTER TABLE public.provider_posts
ALTER COLUMN media_urls DROP NOT NULL;

-- 5. Adicionar threading em comentários
ALTER TABLE public.post_comments
ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS replies_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- 6. Adicionar likes em comentários
CREATE TABLE IF NOT EXISTS public.comment_likes (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, comment_id)
);

-- 7. Adicionar contador de likes em comentários
ALTER TABLE public.post_comments
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

COMMENT ON TABLE public.comment_likes IS 'Likes em comentários de posts';
COMMENT ON COLUMN public.provider_posts.is_pinned IS 'Post fixado no perfil do provider';
COMMENT ON COLUMN public.provider_posts.is_promoted IS 'Post promovido (anúncio pago)';
```

#### 1.2 Criar Índices para Performance

```sql
-- Índices para posts
CREATE INDEX IF NOT EXISTS idx_posts_provider_created 
  ON public.provider_posts(provider_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_provider_pinned 
  ON public.provider_posts(provider_id, is_pinned, pinned_order) 
  WHERE is_pinned = TRUE;

CREATE INDEX IF NOT EXISTS idx_posts_promoted 
  ON public.provider_posts(is_promoted, promotion_start_date, promotion_end_date) 
  WHERE is_promoted = TRUE;

CREATE INDEX IF NOT EXISTS idx_posts_moderation 
  ON public.provider_posts(moderation_status, created_at) 
  WHERE moderation_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_posts_active 
  ON public.provider_posts(is_active, created_at DESC) 
  WHERE is_active = TRUE;

-- Índices para likes
CREATE INDEX IF NOT EXISTS idx_post_likes_post 
  ON public.post_likes(post_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_post_likes_user 
  ON public.post_likes(user_id, created_at DESC);

-- Índices para comentários
CREATE INDEX IF NOT EXISTS idx_post_comments_post 
  ON public.post_comments(post_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_post_comments_user 
  ON public.post_comments(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_post_comments_parent 
  ON public.post_comments(parent_comment_id, created_at) 
  WHERE parent_comment_id IS NOT NULL;

-- Índices para likes em comentários
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment 
  ON public.comment_likes(comment_id, created_at DESC);
```

#### 1.3 Criar Funções SQL

```sql
-- =====================================================
-- FUNÇÃO: Incrementar contador de likes
-- =====================================================
CREATE OR REPLACE FUNCTION public.increment_post_likes(post_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.provider_posts
  SET likes_count = likes_count + 1
  WHERE id = post_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO: Decrementar contador de likes
-- =====================================================
CREATE OR REPLACE FUNCTION public.decrement_post_likes(post_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.provider_posts
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = post_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO: Incrementar contador de comentários
-- =====================================================
CREATE OR REPLACE FUNCTION public.increment_post_comments(post_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.provider_posts
  SET comments_count = comments_count + 1
  WHERE id = post_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO: Decrementar contador de comentários
-- =====================================================
CREATE OR REPLACE FUNCTION public.decrement_post_comments(post_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.provider_posts
  SET comments_count = GREATEST(comments_count - 1, 0)
  WHERE id = post_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO: Fixar post (com limite por plano)
-- =====================================================
CREATE OR REPLACE FUNCTION public.pin_post(
  post_uuid UUID,
  provider_uuid UUID
)
RETURNS JSONB AS $$
DECLARE
  current_pinned_count INTEGER;
  max_pinned_posts INTEGER := 1; -- Default: 1 post fixado (free plan)
  provider_plan_id UUID;
  result JSONB;
BEGIN
  -- Buscar plano do provider
  SELECT current_plan_id INTO provider_plan_id
  FROM public.profiles
  WHERE id = provider_uuid;

  -- Definir limite baseado no plano (futuro: buscar de plans table)
  -- Por enquanto: free = 1, premium = 3, premium+ = 5
  IF provider_plan_id IS NOT NULL THEN
    -- TODO: Buscar limite real da tabela plans
    max_pinned_posts := 3; -- Assumir premium por enquanto
  END IF;

  -- Contar posts fixados atuais
  SELECT COUNT(*) INTO current_pinned_count
  FROM public.provider_posts
  WHERE provider_id = provider_uuid
    AND is_pinned = TRUE
    AND id != post_uuid;

  -- Verificar limite
  IF current_pinned_count >= max_pinned_posts THEN
    result := jsonb_build_object(
      'success', FALSE,
      'error', 'Limite de posts fixados atingido',
      'max_allowed', max_pinned_posts,
      'current_count', current_pinned_count
    );
    RETURN result;
  END IF;

  -- Fixar post
  UPDATE public.provider_posts
  SET 
    is_pinned = TRUE,
    pinned_at = NOW(),
    pinned_order = current_pinned_count + 1
  WHERE id = post_uuid
    AND provider_id = provider_uuid;

  result := jsonb_build_object(
    'success', TRUE,
    'pinned_count', current_pinned_count + 1,
    'max_allowed', max_pinned_posts
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO: Desfixar post
-- =====================================================
CREATE OR REPLACE FUNCTION public.unpin_post(
  post_uuid UUID,
  provider_uuid UUID
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  UPDATE public.provider_posts
  SET 
    is_pinned = FALSE,
    pinned_at = NULL,
    pinned_order = 0
  WHERE id = post_uuid
    AND provider_id = provider_uuid;

  -- Reordenar posts fixados restantes
  WITH numbered_posts AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY pinned_at) as new_order
    FROM public.provider_posts
    WHERE provider_id = provider_uuid
      AND is_pinned = TRUE
  )
  UPDATE public.provider_posts p
  SET pinned_order = np.new_order
  FROM numbered_posts np
  WHERE p.id = np.id;

  result := jsonb_build_object('success', TRUE);
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO: Buscar feed de posts (com paginação)
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_posts_feed(
  user_uuid UUID DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0,
  filter_provider_id UUID DEFAULT NULL,
  filter_following_only BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
  id UUID,
  provider_id UUID,
  provider_name TEXT,
  provider_avatar TEXT,
  provider_is_verified BOOLEAN,
  type TEXT,
  media_urls TEXT[],
  thumbnail_url TEXT,
  caption TEXT,
  service_id UUID,
  tags TEXT[],
  likes_count INTEGER,
  comments_count INTEGER,
  views_count INTEGER,
  is_pinned BOOLEAN,
  is_promoted BOOLEAN,
  created_at TIMESTAMPTZ,
  user_has_liked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.provider_id,
    pr.full_name as provider_name,
    pr.avatar_url as provider_avatar,
    pr.is_verified as provider_is_verified,
    p.type,
    p.media_urls,
    p.thumbnail_url,
    p.caption,
    p.service_id,
    p.tags,
    p.likes_count,
    p.comments_count,
    p.views_count,
    p.is_pinned,
    p.is_promoted,
    p.created_at,
    EXISTS(
      SELECT 1 FROM public.post_likes pl
      WHERE pl.post_id = p.id AND pl.user_id = user_uuid
    ) as user_has_liked
  FROM public.provider_posts p
  INNER JOIN public.profiles pr ON pr.id = p.provider_id
  WHERE 
    p.is_active = TRUE
    AND p.moderation_status = 'approved'
    AND (filter_provider_id IS NULL OR p.provider_id = filter_provider_id)
    AND (
      filter_following_only = FALSE 
      OR EXISTS(
        SELECT 1 FROM public.follows f
        WHERE f.follower_id = user_uuid
          AND f.following_id = p.provider_id
      )
    )
  ORDER BY 
    p.is_promoted DESC,
    p.is_pinned DESC,
    p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO: Incrementar visualizações
-- =====================================================
CREATE OR REPLACE FUNCTION public.increment_post_views(post_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.provider_posts
  SET views_count = views_count + 1
  WHERE id = post_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 1.4 Criar Triggers

```sql
-- =====================================================
-- TRIGGER: Atualizar contador de likes ao adicionar
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_post_like_added()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.increment_post_likes(NEW.post_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_post_like_added
AFTER INSERT ON public.post_likes
FOR EACH ROW
EXECUTE FUNCTION public.handle_post_like_added();

-- =====================================================
-- TRIGGER: Atualizar contador de likes ao remover
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_post_like_removed()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.decrement_post_likes(OLD.post_id);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_post_like_removed
AFTER DELETE ON public.post_likes
FOR EACH ROW
EXECUTE FUNCTION public.handle_post_like_removed();

-- =====================================================
-- TRIGGER: Atualizar contador de comentários ao adicionar
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_post_comment_added()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.increment_post_comments(NEW.post_id);
  
  -- Se for resposta, incrementar contador do comentário pai
  IF NEW.parent_comment_id IS NOT NULL THEN
    UPDATE public.post_comments
    SET replies_count = replies_count + 1
    WHERE id = NEW.parent_comment_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_post_comment_added
AFTER INSERT ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION public.handle_post_comment_added();

-- =====================================================
-- TRIGGER: Atualizar contador de comentários ao remover
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_post_comment_removed()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.decrement_post_comments(OLD.post_id);
  
  -- Se for resposta, decrementar contador do comentário pai
  IF OLD.parent_comment_id IS NOT NULL THEN
    UPDATE public.post_comments
    SET replies_count = GREATEST(replies_count - 1, 0)
    WHERE id = OLD.parent_comment_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_post_comment_removed
AFTER DELETE ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION public.handle_post_comment_removed();

-- =====================================================
-- TRIGGER: Atualizar updated_at em posts
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_post_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_post_updated
BEFORE UPDATE ON public.provider_posts
FOR EACH ROW
EXECUTE FUNCTION public.handle_post_updated();
```

#### 1.5 RLS Policies

```sql
-- =====================================================
-- RLS POLICIES: provider_posts
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.provider_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Todos podem ver posts aprovados e ativos
CREATE POLICY "Posts aprovados são públicos"
ON public.provider_posts
FOR SELECT
USING (
  is_active = TRUE 
  AND moderation_status = 'approved'
);

-- Policy: Provider pode ver seus próprios posts
CREATE POLICY "Provider vê seus próprios posts"
ON public.provider_posts
FOR SELECT
USING (
  provider_id = auth.uid()
);

-- Policy: Provider pode criar posts
CREATE POLICY "Provider pode criar posts"
ON public.provider_posts
FOR INSERT
WITH CHECK (
  provider_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'provider'
  )
);

-- Policy: Provider pode atualizar seus posts
CREATE POLICY "Provider pode atualizar seus posts"
ON public.provider_posts
FOR UPDATE
USING (provider_id = auth.uid())
WITH CHECK (provider_id = auth.uid());

-- Policy: Provider pode deletar seus posts
CREATE POLICY "Provider pode deletar seus posts"
ON public.provider_posts
FOR DELETE
USING (provider_id = auth.uid());

-- Policy: Admin/Support podem ver todos os posts
CREATE POLICY "Admin/Support veem todos os posts"
ON public.provider_posts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin', 'support')
  )
);

-- Policy: Admin pode moderar posts
CREATE POLICY "Admin pode moderar posts"
ON public.provider_posts
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin')
  )
);

-- =====================================================
-- RLS POLICIES: post_likes
-- =====================================================

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Policy: Todos podem ver likes
CREATE POLICY "Likes são públicos"
ON public.post_likes
FOR SELECT
USING (TRUE);

-- Policy: Usuário autenticado pode dar like
CREATE POLICY "Usuário pode dar like"
ON public.post_likes
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Policy: Usuário pode remover seu like
CREATE POLICY "Usuário pode remover seu like"
ON public.post_likes
FOR DELETE
USING (user_id = auth.uid());

-- =====================================================
-- RLS POLICIES: post_comments
-- =====================================================

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Policy: Todos podem ver comentários
CREATE POLICY "Comentários são públicos"
ON public.post_comments
FOR SELECT
USING (TRUE);

-- Policy: Usuário autenticado pode comentar
CREATE POLICY "Usuário pode comentar"
ON public.post_comments
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Policy: Usuário pode editar seu comentário
CREATE POLICY "Usuário pode editar seu comentário"
ON public.post_comments
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy: Usuário pode deletar seu comentário
CREATE POLICY "Usuário pode deletar seu comentário"
ON public.post_comments
FOR DELETE
USING (user_id = auth.uid());

-- =====================================================
-- RLS POLICIES: comment_likes
-- =====================================================

ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Policy: Todos podem ver likes em comentários
CREATE POLICY "Likes em comentários são públicos"
ON public.comment_likes
FOR SELECT
USING (TRUE);

-- Policy: Usuário pode dar like em comentário
CREATE POLICY "Usuário pode dar like em comentário"
ON public.comment_likes
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Policy: Usuário pode remover like de comentário
CREATE POLICY "Usuário pode remover like de comentário"
ON public.comment_likes
FOR DELETE
USING (user_id = auth.uid());
```

---

## 📊 Estimativa de Tempo

| Fase | Descrição | Tempo Estimado |
|------|-----------|----------------|
| **Fase 1** | Migration SQL | 2-3 horas |
| **Fase 2** | Types TypeScript | 1 hora |
| **Fase 3** | Server Actions | 2-3 horas |
| **Fase 4** | Componentes React | 4-5 horas |
| **Fase 5** | Páginas Next.js | 2-3 horas |
| **Fase 6** | Testes e Ajustes | 2 horas |
| **TOTAL** | **MVP Completo** | **13-17 horas** |

---

## 🎯 Funcionalidades por Plano (Futuro)

### Free Plan
- ✅ Criar posts (limite: 10 posts/mês)
- ✅ Upload de imagens (máx 5 por post)
- ✅ 1 post fixado
- ❌ Sem vídeos
- ❌ Sem promoção

### Premium Plan
- ✅ Posts ilimitados
- ✅ Upload de imagens (máx 10 por post)
- ✅ Upload de vídeos (máx 2 min)
- ✅ 3 posts fixados
- ✅ Analytics básico
- ❌ Sem promoção

### Premium+ Plan
- ✅ Tudo do Premium
- ✅ 5 posts fixados
- ✅ Analytics avançado
- ✅ **Promoção de posts** (anúncios)
- ✅ Prioridade no feed
- ✅ Badge de verificação

---

## 🚀 Próximos Passos

1. ✅ Revisar e aprovar este plano
2. ⏳ Criar migration SQL
3. ⏳ Aplicar migration no Supabase
4. ⏳ Implementar Types TypeScript
5. ⏳ Implementar Server Actions
6. ⏳ Criar componentes React
7. ⏳ Criar páginas Next.js
8. ⏳ Testar fluxo completo
9. ⏳ Documentar sistema

---

**Status:** 📋 **PLANO APROVADO - AGUARDANDO IMPLEMENTAÇÃO**

**Última atualização:** 2026-01-16
