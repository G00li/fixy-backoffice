# 🔧 Especificação Técnica - Sistema de Promoções e Campanhas

## 📋 Visão Geral

Este documento detalha a arquitetura técnica e estrutura de dados para implementar o sistema de Promoções e Campanhas.

---

## 🗄️ Arquitetura de Banco de Dados

### 1. Tabela: `promotions`

```sql
CREATE TABLE public.promotions (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Tipo e Alvo
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'service', 'profile')),
  target_id UUID, -- ID do post, serviço ou NULL para perfil
  
  -- Configuração
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  
  -- Alcance
  radius_km INTEGER DEFAULT 5 CHECK (radius_km > 0 AND radius_km <= 200),
  target_locations JSONB, -- Array de coordenadas específicas
  
  -- Segmentação
  target_audience JSONB DEFAULT '{}', -- {age_min, age_max, gender, interests}
  
  -- Orçamento e Performance
  budget DECIMAL(10,2) DEFAULT 0 CHECK (budget >= 0),
  spent DECIMAL(10,2) DEFAULT 0 CHECK (spent >= 0),
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  ctr DECIMAL(5,2) DEFAULT 0, -- Click-through rate
  roi DECIMAL(10,2) DEFAULT 0, -- Return on investment
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT valid_budget CHECK (spent <= budget)
);
```


### 2. Tabela: `campaigns`

```sql
CREATE TABLE public.campaigns (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Configuração
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('seasonal', 'promotional', 'launch', 'reactivation', 'custom')),
  
  -- Período
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  
  -- Serviços Incluídos
  service_ids UUID[] DEFAULT '{}', -- Array de IDs de serviços
  include_all_services BOOLEAN DEFAULT FALSE,
  
  -- Desconto/Oferta
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed', 'custom')),
  discount_value DECIMAL(10,2),
  discount_description TEXT,
  
  -- Alcance
  radius_km INTEGER DEFAULT 10 CHECK (radius_km > 0 AND radius_km <= 500),
  target_regions TEXT[], -- Array de regiões/cidades
  
  -- Segmentação Avançada
  target_audience JSONB DEFAULT '{}',
  schedule_config JSONB DEFAULT '{}', -- Horários específicos por dia da semana
  
  -- Orçamento e Performance
  budget DECIMAL(10,2) NOT NULL CHECK (budget > 0),
  spent DECIMAL(10,2) DEFAULT 0 CHECK (spent >= 0),
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue_generated DECIMAL(10,2) DEFAULT 0,
  ctr DECIMAL(5,2) DEFAULT 0,
  roi DECIMAL(10,2) DEFAULT 0,
  
  -- Prioridade
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 10),
  
  -- Features Premium
  has_banner BOOLEAN DEFAULT FALSE,
  has_push_notifications BOOLEAN DEFAULT FALSE,
  has_email_notifications BOOLEAN DEFAULT FALSE,
  
  -- IA (Premium+ only)
  ai_optimized BOOLEAN DEFAULT FALSE,
  ai_suggestions JSONB DEFAULT '{}',
  ai_predicted_roi DECIMAL(10,2),
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT valid_budget CHECK (spent <= budget)
);
```

### 3. Tabela: `promotion_limits`

```sql
CREATE TABLE public.promotion_limits (
  plan_id UUID PRIMARY KEY REFERENCES public.plans(id) ON DELETE CASCADE,
  
  -- Limites de Promoções
  max_promotions_per_month INTEGER NOT NULL,
  max_promotion_duration_days INTEGER NOT NULL,
  max_promotion_radius_km INTEGER NOT NULL,
  
  -- Limites de Campanhas
  max_campaigns_per_month INTEGER NOT NULL,
  max_campaign_duration_days INTEGER NOT NULL,
  max_campaign_radius_km INTEGER NOT NULL,
  max_services_per_campaign INTEGER,
  
  -- Features Disponíveis
  can_segment_audience BOOLEAN DEFAULT FALSE,
  can_schedule_hours BOOLEAN DEFAULT FALSE,
  can_ab_test BOOLEAN DEFAULT FALSE,
  max_ab_variations INTEGER DEFAULT 1,
  can_remarketing BOOLEAN DEFAULT FALSE,
  can_use_banner BOOLEAN DEFAULT FALSE,
  can_push_notifications BOOLEAN DEFAULT FALSE,
  can_ai_suggestions BOOLEAN DEFAULT FALSE,
  can_ai_optimization BOOLEAN DEFAULT FALSE,
  
  -- Analytics
  analytics_level TEXT DEFAULT 'basic' CHECK (analytics_level IN ('basic', 'advanced', 'complete')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Tabela: `promotion_usage`

```sql
CREATE TABLE public.promotion_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Período
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2024),
  
  -- Contadores
  promotions_used INTEGER DEFAULT 0,
  campaigns_used INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: Um registro por provider por mês
  UNIQUE(provider_id, month, year)
);
```

### 5. Tabela: `ai_campaign_suggestions`

```sql
CREATE TABLE public.ai_campaign_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Sugestão
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('opportunity', 'seasonal', 'reactivation', 'competitive')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reasoning TEXT NOT NULL, -- Por que a IA sugere isso
  
  -- Configuração Sugerida
  suggested_config JSONB NOT NULL, -- Configuração completa da campanha
  
  -- Previsões
  predicted_roi DECIMAL(10,2),
  predicted_revenue DECIMAL(10,2),
  predicted_conversions INTEGER,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Urgência
  urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'urgent')),
  expires_at TIMESTAMPTZ, -- Sugestão expira (ex: oportunidade sazonal)
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  accepted_at TIMESTAMPTZ,
  campaign_id UUID REFERENCES public.campaigns(id), -- Se aceita, link para campanha criada
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. Tabela: `ai_weekly_reports`

```sql
CREATE TABLE public.ai_weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Período
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  
  -- Análise de Mercado
  market_trends JSONB NOT NULL, -- Serviços mais buscados, tendências
  competitive_analysis JSONB, -- Análise de concorrentes
  
  -- Performance do Provider
  provider_performance JSONB NOT NULL, -- Métricas da semana
  
  -- Oportunidades
  opportunities JSONB NOT NULL, -- Lista de oportunidades detectadas
  
  -- Recomendações
  recommendations JSONB NOT NULL, -- Ações recomendadas
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: Um relatório por provider por semana
  UNIQUE(provider_id, week_start_date)
);
```

---

## 🔧 Funções SQL Principais

### 1. Verificar Limite de Promoções

```sql
CREATE OR REPLACE FUNCTION public.check_promotion_limit(
  provider_uuid UUID,
  is_campaign BOOLEAN DEFAULT FALSE
)
RETURNS JSONB AS $$
DECLARE
  current_plan_id UUID;
  current_month INTEGER;
  current_year INTEGER;
  promotions_used INTEGER;
  campaigns_used INTEGER;
  max_promotions INTEGER;
  max_campaigns INTEGER;
  result JSONB;
BEGIN
  -- Buscar plano atual
  SELECT current_plan_id INTO current_plan_id
  FROM public.profiles
  WHERE id = provider_uuid;
  
  -- Se não tem plano, usar free (buscar ID do plano free)
  IF current_plan_id IS NULL THEN
    SELECT id INTO current_plan_id
    FROM public.plans
    WHERE name = 'Free'
    LIMIT 1;
  END IF;
  
  -- Buscar limites do plano
  SELECT 
    max_promotions_per_month,
    max_campaigns_per_month
  INTO max_promotions, max_campaigns
  FROM public.promotion_limits
  WHERE plan_id = current_plan_id;
  
  -- Buscar uso atual
  current_month := EXTRACT(MONTH FROM NOW());
  current_year := EXTRACT(YEAR FROM NOW());
  
  SELECT 
    COALESCE(promotions_used, 0),
    COALESCE(campaigns_used, 0)
  INTO promotions_used, campaigns_used
  FROM public.promotion_usage
  WHERE provider_id = provider_uuid
    AND month = current_month
    AND year = current_year;
  
  -- Verificar limite
  IF is_campaign THEN
    IF campaigns_used >= max_campaigns THEN
      result := jsonb_build_object(
        'allowed', FALSE,
        'reason', 'Limite de campanhas atingido',
        'used', campaigns_used,
        'max', max_campaigns,
        'remaining', 0
      );
    ELSE
      result := jsonb_build_object(
        'allowed', TRUE,
        'used', campaigns_used,
        'max', max_campaigns,
        'remaining', max_campaigns - campaigns_used
      );
    END IF;
  ELSE
    IF promotions_used >= max_promotions THEN
      result := jsonb_build_object(
        'allowed', FALSE,
        'reason', 'Limite de promoções atingido',
        'used', promotions_used,
        'max', max_promotions,
        'remaining', 0
      );
    ELSE
      result := jsonb_build_object(
        'allowed', TRUE,
        'used', promotions_used,
        'max', max_promotions,
        'remaining', max_promotions - promotions_used
      );
    END IF;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Criar Promoção com Validação

```sql
CREATE OR REPLACE FUNCTION public.create_promotion(
  provider_uuid UUID,
  target_type_param TEXT,
  target_id_param UUID,
  title_param TEXT,
  start_date_param TIMESTAMPTZ,
  end_date_param TIMESTAMPTZ,
  config JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
  limit_check JSONB;
  new_promotion_id UUID;
  result JSONB;
BEGIN
  -- Verificar limite
  limit_check := public.check_promotion_limit(provider_uuid, FALSE);
  
  IF NOT (limit_check->>'allowed')::BOOLEAN THEN
    RETURN limit_check;
  END IF;
  
  -- Criar promoção
  INSERT INTO public.promotions (
    provider_id,
    target_type,
    target_id,
    title,
    start_date,
    end_date,
    radius_km,
    budget,
    status
  ) VALUES (
    provider_uuid,
    target_type_param,
    target_id_param,
    title_param,
    start_date_param,
    end_date_param,
    COALESCE((config->>'radius_km')::INTEGER, 5),
    COALESCE((config->>'budget')::DECIMAL, 0),
    'scheduled'
  )
  RETURNING id INTO new_promotion_id;
  
  -- Incrementar contador de uso
  INSERT INTO public.promotion_usage (
    provider_id,
    month,
    year,
    promotions_used
  ) VALUES (
    provider_uuid,
    EXTRACT(MONTH FROM NOW()),
    EXTRACT(YEAR FROM NOW()),
    1
  )
  ON CONFLICT (provider_id, month, year)
  DO UPDATE SET
    promotions_used = promotion_usage.promotions_used + 1,
    updated_at = NOW();
  
  result := jsonb_build_object(
    'success', TRUE,
    'promotion_id', new_promotion_id,
    'remaining', (limit_check->>'remaining')::INTEGER - 1
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Gerar Sugestão de IA

```sql
CREATE OR REPLACE FUNCTION public.generate_ai_suggestion(
  provider_uuid UUID,
  suggestion_type_param TEXT,
  config JSONB
)
RETURNS UUID AS $$
DECLARE
  new_suggestion_id UUID;
BEGIN
  -- Verificar se provider tem Premium+
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    INNER JOIN public.plans pl ON pl.id = p.current_plan_id
    WHERE p.id = provider_uuid
      AND pl.name = 'Premium+'
  ) THEN
    RAISE EXCEPTION 'Sugestões de IA disponíveis apenas para Premium+';
  END IF;
  
  -- Criar sugestão
  INSERT INTO public.ai_campaign_suggestions (
    provider_id,
    suggestion_type,
    title,
    description,
    reasoning,
    suggested_config,
    predicted_roi,
    predicted_revenue,
    confidence_score,
    urgency
  ) VALUES (
    provider_uuid,
    suggestion_type_param,
    config->>'title',
    config->>'description',
    config->>'reasoning',
    config->'suggested_config',
    (config->>'predicted_roi')::DECIMAL,
    (config->>'predicted_revenue')::DECIMAL,
    (config->>'confidence_score')::DECIMAL,
    COALESCE(config->>'urgency', 'medium')
  )
  RETURNING id INTO new_suggestion_id;
  
  RETURN new_suggestion_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🎨 Estrutura de Dados (TypeScript)

### Types Principais

```typescript
// Promoção
export interface Promotion {
  id: string;
  provider_id: string;
  target_type: 'post' | 'service' | 'profile';
  target_id: string | null;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  radius_km: number;
  target_audience: TargetAudience;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  roi: number;
  status: PromotionStatus;
  created_at: string;
  updated_at: string;
}

// Campanha
export interface Campaign {
  id: string;
  provider_id: string;
  name: string;
  description: string | null;
  campaign_type: CampaignType;
  start_date: string;
  end_date: string;
  service_ids: string[];
  include_all_services: boolean;
  discount_type: 'percentage' | 'fixed' | 'custom' | null;
  discount_value: number | null;
  discount_description: string | null;
  radius_km: number;
  target_regions: string[];
  target_audience: TargetAudience;
  schedule_config: ScheduleConfig;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue_generated: number;
  ctr: number;
  roi: number;
  priority: number;
  has_banner: boolean;
  has_push_notifications: boolean;
  has_email_notifications: boolean;
  ai_optimized: boolean;
  ai_suggestions: AISuggestions;
  ai_predicted_roi: number | null;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
}

// Sugestão de IA
export interface AICampaignSuggestion {
  id: string;
  provider_id: string;
  suggestion_type: 'opportunity' | 'seasonal' | 'reactivation' | 'competitive';
  title: string;
  description: string;
  reasoning: string;
  suggested_config: CampaignConfig;
  predicted_roi: number;
  predicted_revenue: number;
  predicted_conversions: number;
  confidence_score: number;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  expires_at: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  created_at: string;
}

// Relatório Semanal de IA
export interface AIWeeklyReport {
  id: string;
  provider_id: string;
  week_start_date: string;
  week_end_date: string;
  market_trends: MarketTrends;
  competitive_analysis: CompetitiveAnalysis;
  provider_performance: ProviderPerformance;
  opportunities: Opportunity[];
  recommendations: Recommendation[];
  is_read: boolean;
  created_at: string;
}
```

---

## 🔄 Fluxos de Sistema

### Fluxo 1: Criar Promoção

```
1. Provider clica "Criar Promoção"
2. Sistema verifica limite do plano
3. Se limite OK:
   a. Mostra formulário
   b. Provider preenche dados
   c. Sistema valida configuração
   d. Cria promoção com status "scheduled"
   e. Incrementa contador de uso
   f. Agenda ativação automática
4. Se limite atingido:
   a. Mostra modal de upgrade
   b. Exibe benefícios do próximo plano
```

### Fluxo 2: Ativar Promoção (Cron Job)

```
1. Cron roda a cada 5 minutos
2. Busca promoções com:
   - status = 'scheduled'
   - start_date <= NOW()
3. Para cada promoção:
   a. Atualiza status para 'active'
   b. Adiciona ao índice de busca
   c. Notifica provider
   d. Inicia tracking de métricas
```

### Fluxo 3: Gerar Sugestão de IA (Premium+)

```
1. Cron roda diariamente às 6h
2. Para cada provider Premium+:
   a. Analisa histórico de serviços
   b. Analisa tendências de mercado
   c. Analisa concorrência
   d. Detecta oportunidades
   e. Calcula ROI previsto
   f. Cria sugestão
   g. Notifica provider
```

### Fluxo 4: Relatório Semanal (Premium+)

```
1. Cron roda toda segunda às 8h
2. Para cada provider Premium+:
   a. Coleta dados da semana anterior
   b. Analisa performance
   c. Compara com mercado
   d. Gera insights
   e. Cria recomendações
   f. Salva relatório
   g. Envia email + notificação
```

---

## 📊 Índices e Performance

```sql
-- Índices para promotions
CREATE INDEX idx_promotions_provider_status 
  ON public.promotions(provider_id, status);

CREATE INDEX idx_promotions_active_dates 
  ON public.promotions(start_date, end_date) 
  WHERE status = 'active';

CREATE INDEX idx_promotions_target 
  ON public.promotions(target_type, target_id);

-- Índices para campaigns
CREATE INDEX idx_campaigns_provider_status 
  ON public.campaigns(provider_id, status);

CREATE INDEX idx_campaigns_active_priority 
  ON public.campaigns(priority DESC, start_date) 
  WHERE status = 'active';

-- Índices para AI suggestions
CREATE INDEX idx_ai_suggestions_provider_status 
  ON public.ai_campaign_suggestions(provider_id, status);

CREATE INDEX idx_ai_suggestions_urgency 
  ON public.ai_campaign_suggestions(urgency, created_at DESC) 
  WHERE status = 'pending';
```

---

**Próximo Documento:** Plano de Implementação Passo a Passo

**Status:** 📋 Especificação Técnica Completa  
**Última atualização:** 2026-01-16
