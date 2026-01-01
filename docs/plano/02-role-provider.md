# 🔧 Role: PROVIDER (Prestador de Serviço)

## 🎯 Objetivo da Role

**"Divulgar meu serviço, construir reputação, gerenciar agendamentos e aumentar minha receita através de uma plataforma profissional."**

---

## 📋 Personas de Provider

### Persona 1: João - Eletricista Individual
- **Situação:** Trabalha sozinho, atende 5-8 clientes/dia
- **Necessidade:** Agenda organizada, divulgação local
- **Comportamento:** Aceita agendamentos rápido, responde chat
- **Objetivo:** Manter agenda cheia, construir reputação

### Persona 2: Ana - Salão de Beleza (Pequena Empresa)
- **Situação:** 3 funcionários, múltiplos serviços
- **Necessidade:** Gestão de equipe, promoções, posts frequentes
- **Comportamento:** Cria posts diários, oferece pacotes
- **Objetivo:** Crescer base de clientes, fidelizar

### Persona 3: TechFix - Empresa de TI (Grande)
- **Situação:** 20+ técnicos, atendimento 24/7
- **Necessidade:** API, múltiplas agendas, analytics avançado
- **Comportamento:** Integração com sistema próprio
- **Objetivo:** Escalar operação, otimizar recursos

---

## 🔑 Funcionalidades Detalhadas

### 1. 📝 Perfil Profissional

#### 1.1 Configuração Inicial (Onboarding)

**Passo 1: Tipo de Prestador**
```
┌─────────────────────────────────────┐
│  Você é:                            │
│  ○ Profissional Individual          │
│  ○ Pequena Empresa (2-10 pessoas)   │
│  ○ Empresa (10+ pessoas)            │
└─────────────────────────────────────┘
```

**Passo 2: Categoria Principal**
```
┌─────────────────────────────────────┐
│  Qual seu setor?                    │
│  ○ 🔧 Manutenção e Reparos          │
│  ○ 💇 Beleza e Estética             │
│  ○ 🏠 Construção e Reformas         │
│  ○ 💻 Tecnologia                    │
│  ○ 🚗 Automotivo                    │
│  ○ 📚 Educação                      │
│  ○ 🎨 Arte e Design                 │
│  ○ Outro                            │
└─────────────────────────────────────┘
```

**Passo 3: Informações Básicas**
```typescript
interface ProviderProfile {
  // Básico
  business_name: string;
  display_name: string;
  bio: string; // Max 500 chars
  avatar_url: string;
  cover_image_url?: string;
  
  // Contato
  phone: string;
  email: string;
  website?: string;
  social_media?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
  
  // Localização
  address: {
    street: string;
    number: string;
    complement?: string;
    postal_code: string;
    city: string;
    state: string;
    country: string;
  };
  location: Point; // PostGIS
  location_text: string; // "Lisboa, Portugal"
  
  // Tipo de atendimento
  service_types: ('on_site' | 'home_visit' | 'both')[];
  service_radius_km?: number; // Para home_visit
  
  // Verificação
  is_verified: boolean;
  verification_documents?: string[];
  
  // Plano
  current_plan: 'free' | 'pro' | 'business';
  plan_expires_at?: Date;
}
```

**Passo 4: Horário de Funcionamento**
```
┌─────────────────────────────────────┐
│  Quando você atende?                │
│                                     │
│  Segunda: 09:00 - 18:00 ✓          │
│  Terça:   09:00 - 18:00 ✓          │
│  Quarta:  09:00 - 18:00 ✓          │
│  Quinta:  09:00 - 18:00 ✓          │
│  Sexta:   09:00 - 18:00 ✓          │
│  Sábado:  09:00 - 13:00 ✓          │
│  Domingo: Fechado                   │
│                                     │
│  ☑ Atendo emergências 24h          │
└─────────────────────────────────────┘
```

### 2. 📸 Sistema de Posts (Portfólio)

#### 2.1 Criar Post
```
┌─────────────────────────────────────────┐
│  Novo Post                              │
│                                         │
│  [📷 Adicionar Fotos/Vídeos]           │
│  [Foto1] [Foto2] [Vídeo1]              │
│                                         │
│  Legenda:                               │
│  [Instalação elétrica completa em...]  │
│                                         │
│  Serviço relacionado:                   │
│  [Instalação Elétrica - €50/h] ▼       │
│                                         │
│  Tags:                                  │
│  #instalação #residencial #lisboa       │
│                                         │
│  [Publicar] [Salvar Rascunho]          │
└─────────────────────────────────────────┘
```

```typescript
interface ProviderPost {
  id: string;
  provider_id: string;
  type: 'image' | 'video' | 'carousel';
  media_urls: string[]; // Max 10
  thumbnail_url?: string; // Para vídeos
  caption: string; // Max 2000 chars
  service_id?: string;
  tags: string[]; // Max 10
  
  // Engajamento
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  
  // Moderação
  is_active: boolean;
  moderation_status: 'pending' | 'approved' | 'rejected';
  moderation_reason?: string;
  
  // SEO
  alt_text?: string;
  
  created_at: Date;
  updated_at: Date;
}
```

**Limites por Plano:**
- **Free:** 5 posts/mês, 3 fotos/post
- **Pro:** Posts ilimitados, 10 fotos/post, vídeos até 2min
- **Business:** Tudo ilimitado, vídeos até 10min, prioridade

#### 2.2 Feed de Posts (Visão do Provider)
```
┌─────────────────────────────────────────┐
│  Meus Posts                             │
│  [+ Novo Post]                          │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ [Foto] Instalação em apartamento  │ │
│  │ 👁 245 | ❤️ 23 | 💬 5             │ │
│  │ Publicado há 2 dias               │ │
│  │ [Editar] [Estatísticas] [Excluir] │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ [Vídeo] Manutenção preventiva     │ │
│  │ 👁 512 | ❤️ 45 | 💬 12            │ │
│  │ Publicado há 5 dias               │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 3. 💼 Gestão de Serviços

```typescript
interface Service {
  id: string;
  provider_id: string;
  category_id: string;
  
  // Informações
  title: string;
  description: string;
  images: string[];
  
  // Precificação
  pricing_model: 'hourly' | 'fixed' | 'daily' | 'custom';
  base_price: number;
  currency: string;
  
  // Duração
  duration_min: number; // Duração mínima em minutos
  duration_max?: number;
  
  // Disponibilidade
  is_active: boolean;
  requires_approval: boolean; // Cliente precisa aguardar aprovação
  
  // Extras
  extras?: ServiceExtra[];
  
  created_at: Date;
  updated_at: Date;
}

interface ServiceExtra {
  id: string;
  name: string;
  description: string;
  price: number;
  is_required: boolean;
}
```

**Exemplo de Serviço:**
```
┌─────────────────────────────────────────┐
│  Instalação Elétrica Residencial        │
│                                         │
│  Descrição:                             │
│  Instalação completa de sistema         │
│  elétrico residencial...                │
│                                         │
│  Preço: €50/hora                        │
│  Duração: 2-4 horas                     │
│                                         │
│  Extras:                                │
│  ☑ Material incluído (+€30)            │
│  ☐ Certificação (+€50)                 │
│  ☐ Garantia estendida (+€20)           │
│                                         │
│  Status: ✅ Ativo                       │
│  [Editar] [Desativar]                   │
└─────────────────────────────────────────┘
```

### 4. 📅 Gestão de Agenda

#### 4.1 Tipos de Agenda

**Agenda PÚBLICA:**
- Clientes veem slots disponíveis
- Agendamento instantâneo (sem aprovação)
- Melhor para serviços padronizados

**Agenda PRIVADA:**
- Clientes solicitam horário
- Provider aprova/recusa
- Melhor para serviços customizados

```typescript
interface AgendaSettings {
  provider_id: string;
  is_public: boolean;
  
  // Configurações de agendamento
  min_advance_hours: number; // Ex: 2h de antecedência mínima
  max_advance_days: number; // Ex: 30 dias no futuro
  slot_duration_min: number; // Ex: 30min
  buffer_between_slots_min: number; // Ex: 15min entre agendamentos
  
  // Cancelamento
  allow_client_cancellation: boolean;
  cancellation_deadline_hours: number; // Ex: 24h antes
  
  // Automação
  auto_confirm: boolean;
  auto_reminder_hours: number; // Ex: 1h antes
}
```

#### 4.2 Visualização da Agenda
```
┌─────────────────────────────────────────────────────┐
│  Minha Agenda - Janeiro 2026                        │
│  [Dia] [Semana] [Mês]                              │
│                                                     │
│  Segunda, 13/01                                     │
│  09:00 - 10:00  Maria S. - Instalação ✅           │
│  10:30 - 12:00  João P. - Manutenção ✅            │
│  14:00 - 15:00  [Bloqueado - Almoço] 🔒           │
│  15:30 - 17:00  Ana C. - Emergência ⏳ Pendente    │
│  17:30 - 18:30  [Disponível] ➕                    │
│                                                     │
│  Terça, 14/01                                       │
│  09:00 - 10:00  [Disponível] ➕                    │
│  ...                                                │
└─────────────────────────────────────────────────────┘
```

#### 4.3 Bloquear Horários
```
┌─────────────────────────────────────┐
│  Bloquear Horário                   │
│                                     │
│  Data: [15/01/2026]                 │
│  Hora início: [09:00]               │
│  Hora fim: [18:00]                  │
│                                     │
│  Motivo:                            │
│  ○ Férias                           │
│  ○ Compromisso pessoal              │
│  ○ Manutenção                       │
│  ● Outro: [Treinamento]             │
│                                     │
│  ☑ Repetir semanalmente             │
│                                     │
│  [Bloquear]                         │
└─────────────────────────────────────┘
```

### 5. 🟢 Status de Disponibilidade

```typescript
interface ProviderStatus {
  provider_id: string;
  is_open: boolean;
  status_type: 'open' | 'closed' | 'busy' | 'emergency_only';
  status_message?: string; // Ex: "Atendendo emergências"
  auto_close_at?: Date; // Fecha automaticamente
  updated_at: Date;
}
```

**Widget de Status:**
```
┌─────────────────────────────────────┐
│  Status Atual: 🟢 Aberto            │
│                                     │
│  [🟢 Aberto]                        │
│  [🔴 Fechado]                       │
│  [🟡 Ocupado]                       │
│  [🔵 Apenas Emergências]            │
│                                     │
│  Mensagem personalizada:            │
│  [Atendendo até 18h]                │
│                                     │
│  Fechar automaticamente às:         │
│  [18:00] ☑                          │
│                                     │
│  [Atualizar Status]                 │
└─────────────────────────────────────┘
```

**Visibilidade na Busca:**
- 🟢 **Aberto:** Aparece em "Aberto agora"
- 🔴 **Fechado:** Não aparece em "Aberto agora"
- 🟡 **Ocupado:** Aparece mas com badge "Ocupado"
- 🔵 **Emergências:** Aparece apenas em busca de emergência

### 6. 📊 Dashboard do Provider

```
┌─────────────────────────────────────────────────────┐
│  Dashboard - João Silva Eletricista                 │
│                                                     │
│  ─── Hoje ───                                       │
│  📅 3 agendamentos | 💰 €240 | ⭐ 4.8              │
│                                                     │
│  ─── Este Mês ───                                   │
│  ┌─────────┬─────────┬─────────┬─────────┐        │
│  │ 45      │ €2,250  │ 4.9 ⭐  │ 12      │        │
│  │ Serviços│ Receita │ Rating  │ Novos   │        │
│  └─────────┴─────────┴─────────┴─────────┘        │
│                                                     │
│  ─── Gráfico de Receita ───                        │
│  [Gráfico de linha mensal]                         │
│                                                     │
│  ─── Próximos Agendamentos ───                     │
│  • Hoje 14:00 - Maria S. - Instalação             │
│  • Amanhã 09:00 - João P. - Manutenção            │
│                                                     │
│  ─── Avaliações Recentes ───                       │
│  ⭐⭐⭐⭐⭐ "Excelente!" - Maria S.                │
│  ⭐⭐⭐⭐ "Muito bom" - Pedro L.                   │
└─────────────────────────────────────────────────────┘
```

**Métricas Detalhadas:**
```typescript
interface ProviderMetrics {
  provider_id: string;
  period: 'day' | 'week' | 'month' | 'year';
  
  // Agendamentos
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  no_show_bookings: number;
  
  // Financeiro
  total_revenue: number;
  avg_booking_value: number;
  platform_fees: number;
  net_revenue: number;
  
  // Avaliações
  avg_rating: number;
  total_reviews: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  
  // Engajamento
  profile_views: number;
  post_views: number;
  post_likes: number;
  new_followers: number;
  
  // Conversão
  search_appearances: number;
  profile_clicks: number;
  booking_requests: number;
  conversion_rate: number; // booking_requests / profile_clicks
}
```

### 7. 💬 Chat com Clientes

```
┌─────────────────────────────────────────┐
│  Conversas                              │
│  [Todas] [Não lidas (3)]               │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 🔴 Maria Santos                   │ │
│  │ "Pode vir hoje às 14h?"           │ │
│  │ Há 5 min                          │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Pedro Oliveira                    │ │
│  │ "Obrigado pelo serviço!"          │ │
│  │ Há 2 horas                        │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Funcionalidades:**
- Respostas rápidas (templates)
- Enviar orçamento direto no chat
- Criar agendamento
- Compartilhar localização
- Enviar fotos/vídeos

### 8. 🎁 Promoções

```typescript
interface Promotion {
  id: string;
  provider_id: string;
  
  // Informações
  title: string;
  description: string;
  image_url?: string;
  
  // Desconto
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  
  // Aplicação
  applies_to: 'all_services' | 'specific_services';
  service_ids?: string[];
  
  // Validade
  valid_from: Date;
  valid_until: Date;
  
  // Limites
  max_uses?: number;
  max_uses_per_client?: number;
  current_uses: number;
  
  // Código
  promo_code?: string;
  
  // Visibilidade
  is_active: boolean;
  is_featured: boolean; // Aparece em destaque (plano Pro+)
  
  created_at: Date;
}
```

**Criar Promoção:**
```
┌─────────────────────────────────────────┐
│  Nova Promoção                          │
│                                         │
│  Título: [Desconto de Verão]           │
│  Descrição: [20% off em todos...]      │
│                                         │
│  Desconto:                              │
│  ○ Percentual: [20] %                  │
│  ○ Valor fixo: [__] €                  │
│                                         │
│  Válido de: [01/06] até [31/08]        │
│                                         │
│  Aplicar em:                            │
│  ● Todos os serviços                   │
│  ○ Serviços específicos                │
│                                         │
│  Limite de usos: [100]                 │
│  Usos por cliente: [1]                 │
│                                         │
│  Código promocional: [VERAO20]         │
│                                         │
│  [Criar Promoção]                       │
└─────────────────────────────────────────┘
```

### 9. 📈 Analytics (Plano Pro+)

```
┌─────────────────────────────────────────────────────┐
│  Analytics - Últimos 30 dias                        │
│                                                     │
│  ─── Visibilidade ───                              │
│  Aparições em busca: 1,234 (+15%)                  │
│  Visualizações de perfil: 456 (+23%)               │
│  Taxa de clique: 37% (+5%)                         │
│                                                     │
│  ─── Conversão ───                                  │
│  Solicitações de agendamento: 89                   │
│  Taxa de conversão: 19.5%                          │
│  Taxa de conclusão: 85%                            │
│                                                     │
│  ─── Engajamento ───                                │
│  Novos seguidores: 23                              │
│  Curtidas em posts: 145                            │
│  Comentários: 34                                   │
│                                                     │
│  ─── Palavras-chave que te encontraram ───         │
│  1. "eletricista lisboa" - 234 buscas              │
│  2. "instalação elétrica" - 189 buscas             │
│  3. "eletricista emergência" - 156 buscas          │
└─────────────────────────────────────────────────────┘
```

---

## 🗄️ Tabelas Adicionais Necessárias

### 1. provider_settings
```sql
CREATE TABLE provider_settings (
  provider_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Tipo de prestador
  business_type TEXT CHECK (business_type IN ('individual', 'small_business', 'enterprise')),
  
  -- Atendimento
  service_types TEXT[] DEFAULT ARRAY['on_site'], -- on_site, home_visit
  service_radius_km INTEGER,
  
  -- Agenda
  agenda_is_public BOOLEAN DEFAULT false,
  min_advance_hours INTEGER DEFAULT 2,
  max_advance_days INTEGER DEFAULT 30,
  slot_duration_min INTEGER DEFAULT 60,
  buffer_between_slots_min INTEGER DEFAULT 0,
  
  -- Cancelamento
  allow_client_cancellation BOOLEAN DEFAULT true,
  cancellation_deadline_hours INTEGER DEFAULT 24,
  
  -- Automação
  auto_confirm BOOLEAN DEFAULT false,
  auto_reminder_hours INTEGER DEFAULT 1,
  
  -- Verificação
  is_verified BOOLEAN DEFAULT false,
  verification_documents TEXT[],
  verified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. blocked_time_slots
```sql
CREATE TABLE blocked_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reason TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB, -- {type: 'weekly', day_of_week: 1}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blocked_slots_provider_time ON blocked_time_slots(provider_id, start_time, end_time);
```

### 3. service_extras
```sql
CREATE TABLE service_extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📱 Notificações para Provider

```typescript
type ProviderNotificationType = 
  | 'new_booking_request'
  | 'booking_cancelled'
  | 'new_message'
  | 'new_review'
  | 'new_follower'
  | 'promotion_expiring'
  | 'payment_received'
  | 'plan_expiring';
```

---

## 🎯 Planos de Assinatura

### Free (€0/mês)
- ✅ Perfil básico
- ✅ 3 serviços ativos
- ✅ 5 posts/mês
- ✅ Agenda privada
- ✅ Chat básico
- ❌ Analytics
- ❌ Promoções
- ❌ Destaque em buscas

### Pro (€29/mês)
- ✅ Tudo do Free
- ✅ Serviços ilimitados
- ✅ Posts ilimitados
- ✅ Agenda pública
- ✅ Analytics completo
- ✅ 5 promoções ativas
- ✅ Selo "Pro"
- ✅ Suporte prioritário

### Business (€99/mês)
- ✅ Tudo do Pro
- ✅ Múltiplos funcionários
- ✅ API access
- ✅ Promoções ilimitadas
- ✅ Destaque em buscas
- ✅ White-label
- ✅ Account manager

---

## 📈 Métricas de Sucesso

- **Tempo para primeiro agendamento:** < 7 dias
- **Taxa de ocupação da agenda:** > 60%
- **Taxa de resposta no chat:** > 90%
- **Rating médio:** > 4.5
- **Taxa de retenção (12 meses):** > 70%

---

**Próximo:** [03-role-support.md](./03-role-support.md)
