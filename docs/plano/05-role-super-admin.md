# 👑 Role: SUPER ADMIN (Super Administrador)

## 🎯 Objetivo da Role

**"Visão estratégica completa do negócio, controle total da plataforma e tomada de decisões críticas."**

---

## 🔑 Poderes e Responsabilidades

### Poderes Exclusivos
- ✅ Acesso total a todos os dados
- ✅ Gerenciar outros admins e suporte
- ✅ Configurações globais da plataforma
- ✅ Análise financeira completa
- ✅ Auditoria de todas as ações
- ✅ Decisões estratégicas de negócio
- ✅ Configurar períodos de ofertas especiais
- ✅ Acesso a código e infraestrutura

### Responsabilidades
1. **Estratégia de Negócio** - Definir direção da empresa
2. **Análise Financeira** - Receitas, custos, lucro
3. **Gestão de Equipe** - Contratar, promover, demitir
4. **Compliance** - LGPD, GDPR, regulamentações
5. **Parcerias** - Negociar com parceiros estratégicos
6. **Investimentos** - Decisões de alocação de recursos

---

## 📊 Dashboard Executivo

```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard Executivo - Super Admin                          │
│  Período: [Q4 2025 ▼] Comparar com: [Q3 2025 ▼]           │
│                                                             │
│  ─── Métricas de Negócio ───                               │
│  ┌──────────┬──────────┬──────────┬──────────┐            │
│  │ €125,678 │ €45,234  │ €80,444  │ 64%      │            │
│  │ Receita  │ Custos   │ Lucro    │ Margem   │            │
│  │ +18% ↗   │ +12% ↗   │ +22% ↗   │ +3pp ↗   │            │
│  └──────────┴──────────┴──────────┴──────────┘            │
│                                                             │
│  ─── Crescimento ───                                        │
│  [Gráfico: Receita, Custos, Lucro - Últimos 12 meses]     │
│                                                             │
│  ─── KPIs Estratégicos ───                                  │
│  CAC (Customer Acquisition Cost): €12.50 (-15%) ✅         │
│  LTV (Lifetime Value): €450 (+23%) ✅                      │
│  LTV/CAC Ratio: 36x (Target: >3x) ✅                       │
│  Churn Rate: 4.2% (Target: <5%) ✅                         │
│  Payback Period: 2.3 meses (Target: <6m) ✅                │
│                                                             │
│  ─── Alertas Críticos ───                                   │
│  ⚠️ Custo de infraestrutura +35% vs mês anterior           │
│  ⚠️ Taxa de fraude aumentou 0.3pp                          │
│  ✅ Todos os SLAs cumpridos                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 💰 Análise Financeira Completa

### 1. Receitas

```typescript
interface RevenueBreakdown {
  period: DateRange;
  
  // Receitas por fonte
  commission_revenue: number; // Comissões em serviços
  subscription_revenue: number; // Planos Pro/Business
  advertising_revenue: number; // Anúncios patrocinados
  verification_revenue: number; // Selos de verificação
  other_revenue: number;
  
  total_revenue: number;
  
  // Análise
  revenue_by_sector: Record<string, number>;
  revenue_by_region: Record<string, number>;
  revenue_by_plan: Record<string, number>;
  
  // Crescimento
  mom_growth: number; // Month over Month
  yoy_growth: number; // Year over Year
  
  // Projeções
  projected_next_month: number;
  projected_next_quarter: number;
  projected_next_year: number;
}
```

**Dashboard Financeiro:**
```
┌─────────────────────────────────────────────────────┐
│  Análise Financeira - Janeiro 2026                  │
│                                                     │
│  ─── Receitas (€125,678) ───                        │
│  Comissões:      €85,234 (68%) ████████████████    │
│  Assinaturas:    €32,456 (26%) ██████░░░░░░░░░░    │
│  Anúncios:       €6,789 (5%)   █░░░░░░░░░░░░░░░    │
│  Verificações:   €1,199 (1%)   ░░░░░░░░░░░░░░░░    │
│                                                     │
│  ─── Custos (€45,234) ───                           │
│  Infraestrutura: €15,678 (35%) ████████░░░░░░░░    │
│  Equipe:         €20,123 (44%) ██████████░░░░░░    │
│  Marketing:      €7,890 (17%)  ████░░░░░░░░░░░░    │
│  Pagamentos:     €1,543 (4%)   █░░░░░░░░░░░░░░░    │
│                                                     │
│  ─── Lucro Líquido ───                              │
│  €80,444 (64% margem) 📈                            │
│                                                     │
│  [Exportar Relatório] [Ver Detalhes]               │
└─────────────────────────────────────────────────────┘
```

### 2. Unit Economics

```typescript
interface UnitEconomics {
  // Por Cliente
  avg_customer_ltv: number;
  avg_customer_cac: number;
  ltv_cac_ratio: number;
  payback_period_months: number;
  
  // Por Provider
  avg_provider_ltv: number;
  avg_provider_cac: number;
  avg_revenue_per_provider_monthly: number;
  
  // Por Transação
  avg_booking_value: number;
  avg_commission_per_booking: number;
  avg_cost_per_booking: number; // Processamento, suporte, etc
  avg_profit_per_booking: number;
}
```

---

## 📈 Análise de Crescimento

### 1. Comparação Temporal

```
┌─────────────────────────────────────────────────────┐
│  Comparação Ano a Ano                               │
│                                                     │
│  ─── 2025 vs 2024 ───                               │
│                                                     │
│  Usuários:                                          │
│  2024: 8,456  ████████░░░░░░░░░░                   │
│  2025: 15,234 ████████████████░░░░ (+80%)          │
│                                                     │
│  Providers:                                         │
│  2024: 1,234  ████████░░░░░░░░░░                   │
│  2025: 3,456  ████████████████████ (+180%)         │
│                                                     │
│  GMV:                                               │
│  2024: €234K  ████████░░░░░░░░░░                   │
│  2025: €1.2M  ████████████████████████ (+412%)     │
│                                                     │
│  Receita:                                           │
│  2024: €35K   ████████░░░░░░░░░░                   │
│  2025: €156K  ████████████████████████ (+346%)     │
└─────────────────────────────────────────────────────┘
```

### 2. Análise de Coortes

```typescript
interface CohortAnalysis {
  cohort_month: string; // Ex: "2025-01"
  initial_users: number;
  
  // Retenção por mês
  retention: {
    month_0: number; // 100%
    month_1: number; // Ex: 65%
    month_3: number; // Ex: 42%
    month_6: number; // Ex: 28%
    month_12: number; // Ex: 18%
  };
  
  // Receita acumulada
  cumulative_revenue: {
    month_1: number;
    month_3: number;
    month_6: number;
    month_12: number;
  };
  
  // LTV projetado
  projected_ltv: number;
}
```

---

## 👥 Gestão de Equipe

### 1. Gerenciar Admins e Suporte

```
┌─────────────────────────────────────────────────────┐
│  Gestão de Equipe                                   │
│  [Admins (3)] [Suporte (10)] [Todos]               │
│                                                     │
│  ─── Admins ───                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ Maria Santos - Admin                          │ │
│  │ maria@fixy.com | Ativa desde 01/2025         │ │
│  │                                               │ │
│  │ Performance:                                  │ │
│  │ • 45 campanhas criadas                        │ │
│  │ • 234 usuários moderados                      │ │
│  │ • Rating: 4.8★                                │ │
│  │                                               │ │
│  │ [Ver Detalhes] [Editar] [Remover Role]       │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [+ Adicionar Admin]                                │
└─────────────────────────────────────────────────────┘
```

### 2. Promover/Rebaixar Usuários

```typescript
interface RoleChange {
  user_id: string;
  from_role: UserRole;
  to_role: UserRole;
  reason: string;
  effective_date: Date;
  
  // Auditoria
  changed_by: string;
  created_at: Date;
}
```

---

## 🎁 Campanhas e Ofertas Especiais

### 1. Períodos de Ofertas Sazonais

```typescript
interface SeasonalCampaign {
  id: string;
  name: string; // Ex: "Black Friday 2026"
  description: string;
  
  // Período
  start_date: Date;
  end_date: Date;
  
  // Ofertas
  offers: {
    // Para clientes
    client_discount?: number; // Ex: 20% off
    free_service_fee?: boolean;
    
    // Para providers
    reduced_commission?: number; // Ex: 5% em vez de 15%
    free_featured?: boolean;
    free_plan_upgrade?: {
      from: 'free' | 'pro';
      to: 'pro' | 'business';
      duration_days: number;
    };
  };
  
  // Limites
  max_budget: number;
  max_participants?: number;
  
  // Métricas
  participants: number;
  revenue_impact: number;
  new_users: number;
  
  status: 'scheduled' | 'active' | 'completed';
  created_by: string;
  created_at: Date;
}
```

**Criar Campanha Sazonal:**
```
┌─────────────────────────────────────────────────────┐
│  Nova Campanha Sazonal                              │
│                                                     │
│  Nome: [Black Friday 2026]                          │
│  Período: [29/11/2026] até [02/12/2026]            │
│                                                     │
│  ─── Ofertas para Clientes ───                      │
│  ☑ 30% de desconto em todos os serviços            │
│  ☑ Taxa de serviço grátis                          │
│                                                     │
│  ─── Ofertas para Providers ───                     │
│  ☑ Comissão reduzida: 5% (normal: 15%)             │
│  ☑ Destaque grátis por 7 dias                      │
│  ☐ Upgrade grátis para Pro (30 dias)               │
│                                                     │
│  Budget máximo: [€10,000]                           │
│  Participantes máx: [500 providers]                 │
│                                                     │
│  [Criar Campanha] [Agendar]                        │
└─────────────────────────────────────────────────────┘
```

---

## 🎫 Análise de Tickets (Suporte)

### 1. Visão Geral de Tickets

```
┌─────────────────────────────────────────────────────┐
│  Análise de Tickets - Últimos 30 dias               │
│                                                     │
│  ─── Volume ───                                     │
│  Total: 1,234 tickets                              │
│  Novos: 456 | Resolvidos: 423 | Abertos: 33       │
│                                                     │
│  ─── SLA ───                                        │
│  Cumprimento: 96.5% ✅                              │
│  Violações: 43 tickets                             │
│  Tempo médio primeira resposta: 1.8h               │
│  Tempo médio resolução: 18.5h                      │
│                                                     │
│  ─── Satisfação ───                                 │
│  Rating médio: 4.6/5 ⭐                            │
│  NPS: +52 (Excelente)                              │
│                                                     │
│  ─── Por Categoria ───                              │
│  Account: 345 (28%) ████████░░░░░░░░░░             │
│  Booking: 289 (23%) ███████░░░░░░░░░░░             │
│  Payment: 234 (19%) ██████░░░░░░░░░░░░             │
│  Technical: 189 (15%) █████░░░░░░░░░░░░            │
│  Other: 177 (15%) ████░░░░░░░░░░░░░░               │
│                                                     │
│  ─── Performance por Nível ───                      │
│  Level 3: 8.5 tickets/dia | 4.5★ | SLA: 94%       │
│  Level 2: 6.2 tickets/dia | 4.7★ | SLA: 97%       │
│  Level 1: 3.8 tickets/dia | 4.9★ | SLA: 99%       │
└─────────────────────────────────────────────────────┘
```

### 2. Identificar Problemas Recorrentes

```typescript
interface RecurringIssue {
  issue_type: string;
  occurrences: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  avg_resolution_time_hours: number;
  user_satisfaction: number;
  
  // Impacto
  affected_users: number;
  revenue_impact: number;
  
  // Recomendação
  recommended_action: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}
```

**Dashboard de Problemas:**
```
┌─────────────────────────────────────────────────────┐
│  Problemas Recorrentes                              │
│                                                     │
│  🔴 CRÍTICO                                         │
│  ┌───────────────────────────────────────────────┐ │
│  │ "Falha no pagamento"                          │ │
│  │ 89 ocorrências (+45% vs mês anterior) 📈      │ │
│  │ Impacto: €12,345 em receita perdida           │ │
│  │                                               │ │
│  │ Recomendação:                                 │ │
│  │ • Investigar integração com gateway           │ │
│  │ • Adicionar retry automático                  │ │
│  │ • Melhorar mensagens de erro                  │ │
│  │                                               │ │
│  │ [Criar Task para Dev] [Ver Tickets]          │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 Auditoria e Compliance

### 1. Log de Ações Administrativas

```typescript
interface AdminAuditLog {
  id: string;
  admin_id: string;
  admin_role: 'admin' | 'super_admin';
  
  action_type: string;
  action_description: string;
  
  // Alvo
  target_type: 'user' | 'booking' | 'payment' | 'config';
  target_id: string;
  
  // Dados
  before_data: any;
  after_data: any;
  
  // Contexto
  ip_address: string;
  user_agent: string;
  location?: string;
  
  // Resultado
  success: boolean;
  error_message?: string;
  
  created_at: Date;
}
```

**Interface de Auditoria:**
```
┌─────────────────────────────────────────────────────┐
│  Log de Auditoria                                   │
│  Filtros: [Todas as ações ▼] [Todos admins ▼]     │
│  Período: [Últimos 7 dias ▼]                       │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ 2026-01-15 14:32:15                           │ │
│  │ Maria Santos (Admin)                          │ │
│  │ Ação: Suspendeu usuário                       │ │
│  │ Alvo: João Silva (joao@email.com)            │ │
│  │ Motivo: Violação de termos                    │ │
│  │ Duração: 30 dias                              │ │
│  │ IP: 192.168.1.100                             │ │
│  │ [Ver Detalhes]                                │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 2. Compliance LGPD/GDPR

```typescript
interface ComplianceReport {
  period: DateRange;
  
  // Solicitações de dados
  data_requests: {
    total: number;
    completed: number;
    pending: number;
    avg_response_time_days: number;
  };
  
  // Exclusões de dados
  deletion_requests: {
    total: number;
    completed: number;
    pending: number;
  };
  
  // Consentimentos
  consent_tracking: {
    total_users: number;
    with_consent: number;
    consent_rate: number;
  };
  
  // Violações
  data_breaches: {
    total: number;
    severity: Record<'low' | 'medium' | 'high' | 'critical', number>;
    reported_to_authority: number;
  };
  
  // Auditoria
  last_audit_date: Date;
  next_audit_date: Date;
  compliance_score: number; // 0-100
}
```

---

## ⚙️ Configurações Globais

### 1. Configurações de Sistema

```typescript
interface SystemConfig {
  // Plataforma
  platform_name: string;
  platform_url: string;
  support_email: string;
  support_phone: string;
  
  // Limites
  max_file_size_mb: number;
  max_images_per_post: number;
  max_services_per_provider: number;
  
  // Comissões
  default_commission_rate: number;
  commission_by_sector: Record<string, number>;
  
  // Pagamentos
  payment_providers: ('stripe' | 'mercadopago')[];
  min_payout_amount: number;
  payout_schedule: 'daily' | 'weekly' | 'monthly';
  
  // Segurança
  require_2fa_for_admins: boolean;
  session_timeout_minutes: number;
  max_login_attempts: number;
  
  // Features
  features: {
    chat_enabled: boolean;
    posts_enabled: boolean;
    reviews_enabled: boolean;
    promotions_enabled: boolean;
  };
  
  // Manutenção
  maintenance_mode: boolean;
  maintenance_message?: string;
}
```

### 2. Feature Flags

```typescript
interface FeatureFlag {
  name: string;
  description: string;
  is_enabled: boolean;
  
  // Rollout
  rollout_percentage: number; // 0-100
  rollout_user_ids?: string[]; // Beta testers
  
  // Ambiente
  environments: ('development' | 'staging' | 'production')[];
  
  created_at: Date;
  updated_at: Date;
}
```

---

## 📊 Relatórios Executivos

### 1. Relatório Trimestral

```markdown
# Relatório Executivo Q4 2025

## Executive Summary
- Receita: €456,789 (+45% YoY)
- Lucro: €234,567 (51% margem)
- Usuários: 15,234 (+80% YoY)
- GMV: €1.2M (+412% YoY)

## Highlights
✅ Lançamento em 3 novas cidades
✅ Parcerias com 5 grandes empresas
✅ LTV/CAC ratio: 36x (excelente)
✅ Churn rate: 4.2% (abaixo da meta)

## Challenges
⚠️ Custo de aquisição aumentou 15%
⚠️ Competição intensificou em Lisboa
⚠️ Problemas técnicos com pagamentos

## Strategic Initiatives
1. Expansão internacional (Espanha)
2. Lançamento de app mobile
3. Programa de referência
4. Integração com ERPs

## Financial Projections
- Q1 2026: €550K receita
- 2026 Total: €2.5M receita
- Break-even: Q2 2026
```

---

## 🗄️ Tabelas Adicionais

### 1. seasonal_campaigns
```sql
CREATE TABLE seasonal_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  
  offers JSONB NOT NULL,
  
  max_budget NUMERIC NOT NULL,
  max_participants INTEGER,
  
  participants INTEGER DEFAULT 0,
  revenue_impact NUMERIC DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  
  status TEXT CHECK (status IN ('scheduled', 'active', 'completed')),
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. system_config
```sql
CREATE TABLE system_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. feature_flags
```sql
CREATE TABLE feature_flags (
  name TEXT PRIMARY KEY,
  description TEXT,
  is_enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
  rollout_user_ids UUID[],
  environments TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📈 Métricas de Sucesso

- **Receita anual:** > €2M
- **Margem de lucro:** > 50%
- **LTV/CAC ratio:** > 3x
- **Churn rate:** < 5%
- **NPS:** > 50
- **Crescimento MoM:** > 15%

---

**Próximo:** [06-database-architecture.md](./06-database-architecture.md)
