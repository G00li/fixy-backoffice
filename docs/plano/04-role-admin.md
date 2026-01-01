# 👨‍💼 Role: ADMIN (Administrador)

## 🎯 Objetivo da Role

**"Garantir o crescimento equilibrado e justo da plataforma, fomentando setores menos promovidos e moderando conteúdo."**

---

## 🔑 Responsabilidades Principais

1. **Análise de Crescimento** - Monitorar KPIs e identificar oportunidades
2. **Fomento de Setores** - Criar campanhas para setores menos visíveis
3. **Moderação de Conteúdo** - Garantir qualidade e segurança
4. **Gestão de Usuários** - Suspender, banir, promover usuários
5. **Suporte ao Suporte** - Auxiliar equipe de suporte em casos complexos
6. **Ajuste de Algoritmos** - Otimizar busca e recomendações

---

## 📊 Dashboard Principal

```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard Admin - Visão Geral                              │
│  Período: [Últimos 30 dias ▼]                              │
│                                                             │
│  ─── KPIs Principais ───                                    │
│  ┌──────────┬──────────┬──────────┬──────────┐            │
│  │ 12,345   │ 3,456    │ €45,678  │ 4.7 ⭐   │            │
│  │ Usuários │ Providers│ GMV      │ Rating   │            │
│  │ +15% ↗   │ +23% ↗   │ +18% ↗   │ +0.2 ↗   │            │
│  └──────────┴──────────┴──────────┴──────────┘            │
│                                                             │
│  ─── Crescimento por Setor ───                             │
│  🔧 Manutenção: 234 providers (+12%) ████████░░            │
│  💇 Beleza: 189 providers (+45%) ████████████              │
│  🏠 Construção: 156 providers (+8%) ██████░░░░             │
│  💻 Tecnologia: 89 providers (-5%) ████░░░░░░ ⚠️          │
│  🚗 Automotivo: 67 providers (+2%) ███░░░░░░░              │
│                                                             │
│  ⚠️ Setores que precisam de atenção:                       │
│  • Tecnologia: Crescimento negativo                        │
│  • Automotivo: Crescimento abaixo da média                 │
│                                                             │
│  [Criar Campanha] [Ver Detalhes]                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 Analytics Detalhado

### 1. Análise de Usuários

```typescript
interface UserAnalytics {
  period: DateRange;
  
  // Crescimento
  total_users: number;
  new_users: number;
  active_users: number; // Últimos 30 dias
  churned_users: number;
  
  // Segmentação
  users_by_type: {
    clients: number;
    providers: number;
    both: number; // Usuários que são ambos
  };
  
  // Engajamento
  avg_sessions_per_user: number;
  avg_session_duration_min: number;
  dau: number; // Daily Active Users
  mau: number; // Monthly Active Users
  dau_mau_ratio: number; // Stickiness
  
  // Conversão
  signup_to_first_booking_days: number;
  signup_to_first_service_days: number; // Para providers
  
  // Retenção
  retention_day_1: number; // %
  retention_day_7: number;
  retention_day_30: number;
  
  // Geografia
  users_by_city: Record<string, number>;
  users_by_region: Record<string, number>;
}
```

**Dashboard de Usuários:**
```
┌─────────────────────────────────────────────────────┐
│  Análise de Usuários                                │
│                                                     │
│  ─── Crescimento ───                                │
│  [Gráfico de linha: Novos usuários por dia]        │
│                                                     │
│  ─── Retenção ───                                   │
│  Dia 1: 65% ████████████░░░░░░                     │
│  Dia 7: 42% ████████░░░░░░░░░░                     │
│  Dia 30: 28% █████░░░░░░░░░░░░░                    │
│                                                     │
│  ─── Top Cidades ───                                │
│  1. Lisboa - 3,456 usuários                        │
│  2. Porto - 2,134 usuários                         │
│  3. Braga - 1,234 usuários                         │
│                                                     │
│  ─── Funil de Conversão ───                         │
│  Visitantes: 10,000                                │
│  Cadastros: 2,500 (25%) ████████                   │
│  Primeiro agendamento: 1,250 (50%) ████            │
│  Usuários ativos: 875 (70%) ███                    │
└─────────────────────────────────────────────────────┘
```

### 2. Análise de Setores

```typescript
interface SectorAnalytics {
  sector_id: string;
  sector_name: string;
  
  // Providers
  total_providers: number;
  active_providers: number; // Receberam booking nos últimos 30 dias
  new_providers: number;
  growth_rate: number; // %
  
  // Serviços
  total_services: number;
  avg_services_per_provider: number;
  
  // Demanda
  total_searches: number;
  total_bookings: number;
  search_to_booking_rate: number; // %
  
  // Financeiro
  total_gmv: number; // Gross Merchandise Value
  avg_booking_value: number;
  platform_revenue: number; // Comissões
  
  // Qualidade
  avg_rating: number;
  total_reviews: number;
  
  // Competição
  avg_providers_per_city: number;
  market_concentration: number; // HHI Index
}
```

**Dashboard de Setores:**
```
┌─────────────────────────────────────────────────────┐
│  Análise por Setor - Beleza                         │
│                                                     │
│  📊 Visão Geral                                     │
│  Providers: 189 (+45% vs mês anterior)             │
│  GMV: €23,456 (+38%)                               │
│  Rating médio: 4.8 ⭐                              │
│                                                     │
│  📈 Tendências                                      │
│  • Crescimento acelerado                           │
│  • Alta demanda (busca/booking: 35%)               │
│  • Qualidade alta (4.8★)                           │
│  • Competição saudável                             │
│                                                     │
│  💡 Recomendações                                   │
│  ✅ Setor saudável, manter monitoramento           │
│  ⚠️ Considerar limitar novos providers em Lisboa   │
│     (saturação em 85%)                             │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Campanhas de Fomento

### 1. Criar Campanha

```typescript
interface MarketingCampaign {
  id: string;
  name: string;
  description: string;
  
  // Alvo
  target_type: 'sector' | 'region' | 'user_segment';
  target_ids: string[];
  
  // Tipo de campanha
  campaign_type: 'discount' | 'featured' | 'ads' | 'email' | 'push';
  
  // Configuração
  config: {
    // Para discount
    discount_percentage?: number;
    discount_max_amount?: number;
    
    // Para featured
    featured_duration_days?: number;
    featured_position?: 'top' | 'sidebar';
    
    // Para ads
    ad_budget?: number;
    ad_platforms?: ('google' | 'facebook' | 'instagram')[];
    
    // Para email/push
    message_template?: string;
    send_schedule?: Date;
  };
  
  // Período
  start_date: Date;
  end_date: Date;
  
  // Budget
  budget: number;
  spent: number;
  
  // Métricas
  impressions: number;
  clicks: number;
  conversions: number;
  roi: number; // Return on Investment
  
  // Status
  status: 'draft' | 'active' | 'paused' | 'completed';
  
  created_by: string;
  created_at: Date;
}
```

**Interface de Criação:**
```
┌─────────────────────────────────────────────────────┐
│  Nova Campanha de Fomento                           │
│                                                     │
│  Nome: [Impulsionar Setor Tecnologia]              │
│                                                     │
│  Objetivo:                                          │
│  ○ Atrair novos providers                          │
│  ● Aumentar visibilidade de providers existentes   │
│  ○ Aumentar demanda (clientes)                     │
│                                                     │
│  Alvo:                                              │
│  ● Setor: [Tecnologia ▼]                           │
│  ○ Região: [____]                                  │
│  ○ Segmento: [____]                                │
│                                                     │
│  Tipo de Campanha:                                  │
│  ☑ Destaque em buscas (30 dias)                    │
│  ☑ Desconto de 20% na comissão                     │
│  ☐ Anúncios pagos (Google/Facebook)                │
│  ☑ Email marketing para clientes                   │
│                                                     │
│  Período: [01/02/2026] até [28/02/2026]            │
│  Budget: [€500]                                     │
│                                                     │
│  [Criar Campanha] [Salvar Rascunho]                │
└─────────────────────────────────────────────────────┘
```

### 2. Monitorar Campanhas

```
┌─────────────────────────────────────────────────────┐
│  Campanhas Ativas                                   │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ 🎯 Impulsionar Setor Tecnologia               │ │
│  │ Status: ● Ativa | 15 dias restantes           │ │
│  │                                               │ │
│  │ Métricas:                                     │ │
│  │ • Impressões: 12,345                          │ │
│  │ • Cliques: 1,234 (CTR: 10%)                   │ │
│  │ • Novos providers: 23                         │ │
│  │ • ROI: 245% 📈                                │ │
│  │                                               │ │
│  │ Budget: €350 / €500 (70%)                     │ │
│  │ [Ver Detalhes] [Pausar] [Editar]             │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 🛡️ Moderação de Conteúdo

### 1. Fila de Moderação

```typescript
interface ModerationQueue {
  id: string;
  content_type: 'post' | 'review' | 'profile' | 'message';
  content_id: string;
  
  // Conteúdo
  content: {
    text?: string;
    images?: string[];
    videos?: string[];
  };
  
  // Autor
  author_id: string;
  author_type: 'client' | 'provider';
  
  // Motivo da moderação
  reason: 'auto_flagged' | 'user_reported' | 'manual_review';
  flags: string[]; // Ex: ['spam', 'inappropriate', 'fake']
  
  // Decisão
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  moderated_by?: string;
  moderation_note?: string;
  moderated_at?: Date;
  
  created_at: Date;
}
```

**Interface de Moderação:**
```
┌─────────────────────────────────────────────────────┐
│  Fila de Moderação                                  │
│  [Pendentes (23)] [Aprovados] [Rejeitados]         │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ 🚩 Post de Provider                           │ │
│  │ João Silva - Eletricista                      │ │
│  │                                               │ │
│  │ [Imagem do trabalho]                          │ │
│  │ "Instalação elétrica completa..."            │ │
│  │                                               │ │
│  │ ⚠️ Flagged: Possível spam                     │ │
│  │ Reportado por: 2 usuários                     │ │
│  │                                               │ │
│  │ Histórico do usuário:                         │ │
│  │ • 15 posts aprovados                          │ │
│  │ • 0 violações anteriores                      │ │
│  │ • Rating: 4.8★                                │ │
│  │                                               │ │
│  │ [✅ Aprovar] [❌ Rejeitar] [⚠️ Avisar]       │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 2. Regras de Moderação Automática

```typescript
interface ModerationRule {
  id: string;
  name: string;
  content_type: 'post' | 'review' | 'profile' | 'message';
  
  // Condições
  conditions: {
    // Texto
    contains_keywords?: string[]; // Palavras proibidas
    min_length?: number;
    max_length?: number;
    
    // Imagens
    max_images?: number;
    requires_image_moderation?: boolean; // AI moderation
    
    // Comportamento
    max_posts_per_day?: number;
    min_account_age_days?: number;
    
    // Qualidade
    min_user_rating?: number;
  };
  
  // Ação
  action: 'auto_approve' | 'auto_reject' | 'flag_for_review';
  severity: 'low' | 'medium' | 'high';
  
  is_active: boolean;
  created_at: Date;
}
```

---

## 👥 Gestão de Usuários

### 1. Buscar Usuários

```
┌─────────────────────────────────────────────────────┐
│  Gestão de Usuários                                 │
│  🔍 [Buscar por nome, email, ID...]                │
│                                                     │
│  Filtros:                                           │
│  Tipo: [Todos ▼] Status: [Todos ▼] Role: [Todos ▼]│
│                                                     │
│  Resultados (1,234):                                │
│  ┌───────────────────────────────────────────────┐ │
│  │ João Silva                                    │ │
│  │ joao@email.com | Provider | ✅ Ativo          │ │
│  │ Cadastro: 15/01/2025 | Rating: 4.8★          │ │
│  │ [Ver Perfil] [Editar] [Suspender] [...]      │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 2. Ações Administrativas

```typescript
interface AdminAction {
  action_type: 
    | 'suspend_user'
    | 'ban_user'
    | 'verify_user'
    | 'change_role'
    | 'issue_warning'
    | 'remove_content'
    | 'issue_refund';
  
  target_user_id: string;
  reason: string;
  duration_days?: number; // Para suspensão temporária
  notes?: string;
  
  // Auditoria
  performed_by: string;
  ip_address: string;
  created_at: Date;
}
```

**Suspender Usuário:**
```
┌─────────────────────────────────────────┐
│  Suspender Usuário                      │
│                                         │
│  Usuário: João Silva                    │
│  Email: joao@email.com                  │
│                                         │
│  Motivo:                                │
│  ● Violação de termos                  │
│  ○ Spam                                 │
│  ○ Fraude                               │
│  ○ Comportamento inadequado             │
│  ○ Outro: [____]                        │
│                                         │
│  Duração:                               │
│  ○ 7 dias                               │
│  ● 30 dias                              │
│  ○ Permanente (banimento)               │
│                                         │
│  Notificar usuário: ☑                  │
│                                         │
│  Notas internas:                        │
│  [Múltiplas reclamações de clientes...] │
│                                         │
│  [Confirmar Suspensão]                  │
└─────────────────────────────────────────┘
```

---

## ⚙️ Configurações da Plataforma

### 1. Algoritmo de Busca

```typescript
interface SearchAlgorithmConfig {
  // Pesos dos fatores de ranking
  weights: {
    distance: number; // 0-1
    rating: number;
    reviews_count: number;
    response_time: number;
    completion_rate: number;
    price: number;
    availability: number;
  };
  
  // Boost para providers
  boosts: {
    verified: number; // Ex: 1.2x
    pro_plan: number; // Ex: 1.5x
    new_provider: number; // Ex: 1.1x (primeiros 30 dias)
    featured_campaign: number; // Ex: 2.0x
  };
  
  // Penalidades
  penalties: {
    low_rating: number; // < 3.0
    high_cancellation_rate: number; // > 20%
    slow_response: number; // > 24h
  };
  
  // Diversidade
  diversity: {
    max_same_provider_in_results: number; // Ex: 2
    promote_small_providers: boolean;
    balance_by_sector: boolean;
  };
}
```

**Interface de Configuração:**
```
┌─────────────────────────────────────────────────────┐
│  Configuração do Algoritmo de Busca                 │
│                                                     │
│  ─── Pesos dos Fatores ───                          │
│  Distância:      ████████░░ 40%                     │
│  Avaliação:      ██████████ 50%                     │
│  Nº Avaliações:  ████░░░░░░ 20%                     │
│  Tempo Resposta: ██████░░░░ 30%                     │
│  Taxa Conclusão: ████████░░ 40%                     │
│                                                     │
│  ─── Boosts ───                                     │
│  Verificado: [1.2]x                                 │
│  Plano Pro: [1.5]x                                  │
│  Novo Provider: [1.1]x                              │
│                                                     │
│  ─── Diversidade ───                                │
│  ☑ Promover pequenos providers                     │
│  ☑ Balancear por setor                             │
│  Max mesmo provider: [2]                            │
│                                                     │
│  [Salvar Configurações] [Testar Algoritmo]         │
└─────────────────────────────────────────────────────┘
```

### 2. Comissões e Taxas

```typescript
interface CommissionConfig {
  // Comissão padrão
  default_rate: number; // Ex: 0.15 (15%)
  
  // Por setor
  sector_rates: Record<string, number>;
  
  // Por plano
  plan_rates: {
    free: number; // Ex: 0.15
    pro: number; // Ex: 0.10
    business: number; // Ex: 0.05
  };
  
  // Taxas adicionais
  payment_processing_fee: number; // Ex: 0.029 + €0.30
  cancellation_fee: number; // Ex: €5
  
  // Limites
  min_commission: number; // Ex: €1
  max_commission: number; // Ex: €100
}
```

---

## 📊 Relatórios

### 1. Relatório Executivo Mensal

```markdown
# Relatório Executivo - Janeiro 2026

## Resumo Executivo
- Crescimento de usuários: +18%
- GMV: €45,678 (+15%)
- Novos providers: 234 (+23%)
- Rating médio: 4.7★ (+0.2)

## Destaques
✅ Setor de Beleza cresceu 45%
✅ Taxa de conclusão de agendamentos: 87%
⚠️ Setor de Tecnologia em declínio (-5%)

## Ações Tomadas
- Criada campanha para Setor Tecnologia
- Suspendidos 12 usuários por violação
- Aprovados 1,234 posts

## Próximos Passos
- Expandir para 3 novas cidades
- Lançar programa de referência
- Melhorar algoritmo de busca
```

---

## 🗄️ Tabelas Necessárias

### 1. marketing_campaigns
```sql
CREATE TABLE marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  
  target_type TEXT CHECK (target_type IN ('sector', 'region', 'user_segment')),
  target_ids TEXT[],
  
  campaign_type TEXT CHECK (campaign_type IN ('discount', 'featured', 'ads', 'email', 'push')),
  config JSONB NOT NULL,
  
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  
  budget NUMERIC NOT NULL,
  spent NUMERIC DEFAULT 0,
  
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  roi NUMERIC DEFAULT 0,
  
  status TEXT CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. moderation_queue
```sql
CREATE TABLE moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT CHECK (content_type IN ('post', 'review', 'profile', 'message')),
  content_id UUID NOT NULL,
  content JSONB NOT NULL,
  
  author_id UUID REFERENCES auth.users(id),
  author_type TEXT CHECK (author_type IN ('client', 'provider')),
  
  reason TEXT CHECK (reason IN ('auto_flagged', 'user_reported', 'manual_review')),
  flags TEXT[],
  
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'escalated')),
  moderated_by UUID REFERENCES auth.users(id),
  moderation_note TEXT,
  moderated_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_moderation_status ON moderation_queue(status) WHERE status = 'pending';
```

---

## 📈 Métricas de Sucesso

- **Crescimento mensal de usuários:** > 15%
- **GMV mensal:** Crescimento constante
- **Tempo de moderação:** < 2 horas
- **Satisfação de providers:** > 4.5/5
- **Equilíbrio entre setores:** Gini < 0.4

---

**Próximo:** [05-role-super-admin.md](./05-role-super-admin.md)
