# 🎧 Role: SUPPORT (Suporte - 3 Níveis)

## 🎯 Objetivo da Role

**"Resolver problemas de usuários de forma rápida, eficiente e organizada, garantindo satisfação e retenção."**

---

## 📊 Hierarquia de Suporte

```
┌─────────────────────────────────────────────────────┐
│  SUPPORT LEVEL 1 (Avançado/Senior)                  │
│  - Problemas críticos e severos                     │
│  - Acesso a logs e dados sensíveis                  │
│  - Compensações e ofertas especiais                 │
│  - Escalar para Admin quando necessário             │
└─────────────────────────────────────────────────────┘
                        ↑
┌─────────────────────────────────────────────────────┐
│  SUPPORT LEVEL 2 (Intermediário)                    │
│  - Problemas específicos de usuários                │
│  - Ajustar configurações de conta                   │
│  - Investigar bugs reportados                       │
│  - Mediar conflitos cliente-provider                │
└─────────────────────────────────────────────────────┘
                        ↑
┌─────────────────────────────────────────────────────┐
│  SUPPORT LEVEL 3 (Inicial/Junior)                   │
│  - Dúvidas gerais e FAQs                           │
│  - Como usar a plataforma                           │
│  - Problemas simples                                │
│  - Escalar para nível superior                      │
└─────────────────────────────────────────────────────┘
```

---

## 🎫 Sistema de Tickets

### 1. Estrutura do Ticket

```typescript
interface SupportTicket {
  id: string;
  ticket_number: string; // Ex: "TKT-2026-00123"
  
  // Usuário
  user_id: string;
  user_type: 'client' | 'provider';
  user_email: string;
  user_phone?: string;
  
  // Classificação
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  
  // Conteúdo
  subject: string;
  description: string;
  attachments: string[];
  
  // Atribuição
  assigned_to?: string; // support user_id
  assigned_level: 1 | 2 | 3;
  assigned_at?: Date;
  
  // SLA
  created_at: Date;
  first_response_at?: Date;
  resolved_at?: Date;
  closed_at?: Date;
  sla_deadline: Date;
  is_sla_breached: boolean;
  
  // Satisfação
  satisfaction_rating?: number; // 1-5
  satisfaction_comment?: string;
  
  // Metadata
  tags: string[];
  related_booking_id?: string;
  related_payment_id?: string;
  ip_address?: string;
  user_agent?: string;
}

type TicketCategory = 
  | 'account' // Problemas de conta
  | 'booking' // Problemas com agendamento
  | 'payment' // Problemas de pagamento
  | 'technical' // Bugs técnicos
  | 'abuse' // Denúncias
  | 'feature_request' // Sugestões
  | 'other';

type TicketPriority = 
  | 'low' // Responder em 48h
  | 'medium' // Responder em 24h
  | 'high' // Responder em 4h
  | 'urgent'; // Responder em 1h

type TicketStatus = 
  | 'new' // Recém criado
  | 'assigned' // Atribuído a suporte
  | 'in_progress' // Em andamento
  | 'waiting_user' // Aguardando resposta do usuário
  | 'waiting_internal' // Aguardando outra equipe
  | 'escalated' // Escalado para nível superior
  | 'resolved' // Resolvido
  | 'closed'; // Fechado
```

### 2. Criação de Ticket (Usuário)

```
┌─────────────────────────────────────────┐
│  Precisa de Ajuda?                      │
│                                         │
│  Categoria:                             │
│  [Problema com agendamento] ▼           │
│                                         │
│  Assunto:                               │
│  [Provider cancelou sem aviso]          │
│                                         │
│  Descrição:                             │
│  [Descreva o problema em detalhes...]   │
│                                         │
│  Anexos (opcional):                     │
│  [📎 Adicionar arquivos]                │
│                                         │
│  Agendamento relacionado:               │
│  [#BKG-2026-00456] ▼                    │
│                                         │
│  [Enviar Ticket]                        │
└─────────────────────────────────────────┘
```

### 3. Dashboard de Tickets (Suporte)

```
┌─────────────────────────────────────────────────────┐
│  Tickets - Support Level 3                          │
│  [Meus] [Não Atribuídos] [Todos] [Escalados]       │
│                                                     │
│  Filtros: [Prioridade ▼] [Status ▼] [Categoria ▼] │
│                                                     │
│  ⚠️ SLA em Risco (3)                                │
│  ┌───────────────────────────────────────────────┐ │
│  │ 🔴 TKT-2026-00123 | URGENT                    │ │
│  │ "Não consigo fazer login"                     │ │
│  │ João Silva | Criado há 45min | SLA: 15min    │ │
│  │ [Atribuir a mim] [Ver Detalhes]              │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  📋 Meus Tickets Ativos (5)                         │
│  ┌───────────────────────────────────────────────┐ │
│  │ 🟡 TKT-2026-00124 | HIGH                      │ │
│  │ "Provider não apareceu"                       │ │
│  │ Maria Santos | Em progresso | SLA: 2h        │ │
│  │ [Responder] [Escalar] [Resolver]             │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Funcionalidades por Nível

### SUPPORT LEVEL 3 (Inicial)

#### Permissões
- ✅ Ver tickets atribuídos a si
- ✅ Responder tickets
- ✅ Escalar para Level 2
- ✅ Acessar base de conhecimento
- ✅ Ver perfil básico do usuário
- ❌ Modificar dados de usuário
- ❌ Acessar logs do sistema
- ❌ Oferecer compensações

#### Responsabilidades
1. **Atender FAQs**
   - Como criar conta
   - Como agendar serviço
   - Como avaliar provider
   - Como alterar senha

2. **Problemas Simples**
   - Redefinir senha
   - Atualizar email
   - Explicar funcionalidades

3. **Escalar quando necessário**
   - Problemas técnicos
   - Disputas entre usuários
   - Solicitações de reembolso

#### Dashboard Level 3
```
┌─────────────────────────────────────────┐
│  Meu Dashboard - Level 3                │
│                                         │
│  Hoje:                                  │
│  📊 8 tickets atendidos                 │
│  ⏱️ Tempo médio: 12min                  │
│  ⭐ Satisfação: 4.6/5                   │
│                                         │
│  Esta Semana:                           │
│  📊 42 tickets atendidos                │
│  📈 6 escalados para Level 2            │
│  🎯 SLA cumprido: 95%                   │
└─────────────────────────────────────────┘
```

### SUPPORT LEVEL 2 (Intermediário)

#### Permissões
- ✅ Tudo do Level 3
- ✅ Ver todos os tickets não atribuídos
- ✅ Modificar dados básicos de usuário
- ✅ Suspender contas temporariamente
- ✅ Acessar histórico completo do usuário
- ✅ Mediar disputas
- ✅ Oferecer créditos até €50
- ❌ Banir usuários permanentemente
- ❌ Acessar dados financeiros sensíveis

#### Responsabilidades
1. **Resolver Problemas Específicos**
   - Ajustar configurações de conta
   - Corrigir dados incorretos
   - Investigar bugs reportados
   - Recuperar dados perdidos

2. **Mediar Conflitos**
   - Cliente vs Provider
   - Disputas de pagamento
   - Avaliações injustas
   - Cancelamentos problemáticos

3. **Investigar Bugs**
   - Reproduzir problema
   - Coletar logs
   - Documentar para dev team
   - Acompanhar correção

#### Ferramentas Especiais
```typescript
interface Level2Tools {
  // Modificar usuário
  updateUserProfile(userId: string, data: Partial<Profile>): Promise<void>;
  
  // Suspender conta
  suspendAccount(userId: string, reason: string, days: number): Promise<void>;
  
  // Oferecer crédito
  issueCredit(userId: string, amount: number, reason: string): Promise<void>;
  
  // Cancelar agendamento
  cancelBooking(bookingId: string, reason: string, refund: boolean): Promise<void>;
  
  // Remover avaliação
  removeReview(reviewId: string, reason: string): Promise<void>;
}
```

### SUPPORT LEVEL 1 (Avançado)

#### Permissões
- ✅ Tudo do Level 2
- ✅ Acessar logs completos do sistema
- ✅ Banir usuários permanentemente
- ✅ Acessar dados financeiros
- ✅ Oferecer compensações ilimitadas
- ✅ Modificar qualquer dado
- ✅ Escalar para Admin
- ✅ Criar campanhas de compensação

#### Responsabilidades
1. **Problemas Críticos**
   - Falhas de pagamento
   - Vazamento de dados
   - Fraudes
   - Problemas legais

2. **Compensações Especiais**
   - Reembolsos acima de €50
   - Planos gratuitos temporários
   - Créditos especiais
   - Descontos personalizados

3. **Análise Profunda**
   - Investigar padrões de fraude
   - Analisar logs de erro
   - Identificar bugs críticos
   - Propor melhorias

#### Dashboard Level 1
```
┌─────────────────────────────────────────────────────┐
│  Dashboard Avançado - Level 1                       │
│                                                     │
│  🚨 Tickets Críticos (2)                            │
│  • Falha de pagamento - €1,250                     │
│  • Possível fraude - Investigar                    │
│                                                     │
│  📊 Estatísticas da Equipe                          │
│  Level 3: 5 agentes | 42 tickets/dia | 4.5★       │
│  Level 2: 3 agentes | 28 tickets/dia | 4.7★       │
│  Level 1: 2 agentes | 15 tickets/dia | 4.9★       │
│                                                     │
│  💰 Compensações Este Mês                           │
│  Total: €2,340 | Média: €45/ticket                 │
│                                                     │
│  🎯 SLA Geral: 96.5%                                │
└─────────────────────────────────────────────────────┘
```

---

## 📚 Base de Conhecimento

```typescript
interface KnowledgeBaseArticle {
  id: string;
  category: string;
  title: string;
  content: string; // Markdown
  tags: string[];
  
  // Visibilidade
  is_public: boolean; // Visível para usuários
  is_internal: boolean; // Apenas para suporte
  
  // Utilidade
  views_count: number;
  helpful_count: number;
  not_helpful_count: number;
  
  // Versão
  version: number;
  last_updated_by: string;
  created_at: Date;
  updated_at: Date;
}
```

**Categorias:**
- 🏁 Primeiros Passos
- 📅 Agendamentos
- 💳 Pagamentos
- ⭐ Avaliações
- 🔧 Problemas Técnicos
- 🛡️ Segurança
- 📱 App Mobile

**Interface:**
```
┌─────────────────────────────────────────┐
│  Base de Conhecimento                   │
│  🔍 [Buscar artigos...]                 │
│                                         │
│  📂 Categorias Populares                │
│  • Como criar uma conta                 │
│  • Como agendar um serviço              │
│  • Como avaliar um provider             │
│  • Política de cancelamento             │
│                                         │
│  🔥 Artigos Mais Úteis                  │
│  1. "Esqueci minha senha" (👍 234)     │
│  2. "Como alterar email" (👍 189)      │
│  3. "Reembolso de serviço" (👍 156)    │
└─────────────────────────────────────────┘
```

---

## 💬 Respostas Rápidas (Templates)

```typescript
interface QuickReply {
  id: string;
  title: string;
  content: string;
  category: string;
  variables: string[]; // Ex: {{user_name}}, {{booking_id}}
  usage_count: number;
  created_by: string;
}
```

**Exemplos:**
```
1. Boas-vindas
"Olá {{user_name}}, obrigado por entrar em contato! 
Sou {{agent_name}} e vou ajudá-lo(a) com {{issue}}."

2. Redefinir Senha
"Enviamos um link de redefinição para {{email}}. 
Verifique sua caixa de entrada e spam. 
O link expira em 1 hora."

3. Escalar Ticket
"Entendo sua situação. Vou escalar seu ticket para 
nossa equipe especializada. Você receberá retorno 
em até {{sla_time}}."

4. Ticket Resolvido
"Fico feliz em ter ajudado! Seu ticket foi resolvido. 
Se precisar de mais ajuda, é só responder este ticket."
```

---

## 📊 Métricas e KPIs

### Métricas Individuais (Por Agente)
```typescript
interface AgentMetrics {
  agent_id: string;
  period: 'day' | 'week' | 'month';
  
  // Volume
  tickets_assigned: number;
  tickets_resolved: number;
  tickets_escalated: number;
  
  // Tempo
  avg_first_response_time_min: number;
  avg_resolution_time_min: number;
  
  // Qualidade
  satisfaction_rating: number; // 1-5
  sla_compliance_rate: number; // %
  
  // Produtividade
  tickets_per_day: number;
  active_hours: number;
}
```

### Métricas da Equipe
```typescript
interface TeamMetrics {
  period: 'day' | 'week' | 'month';
  
  // Volume
  total_tickets: number;
  new_tickets: number;
  resolved_tickets: number;
  open_tickets: number;
  
  // SLA
  sla_compliance_rate: number;
  sla_breached_count: number;
  
  // Satisfação
  avg_satisfaction: number;
  nps_score: number;
  
  // Categorias
  tickets_by_category: Record<TicketCategory, number>;
  tickets_by_priority: Record<TicketPriority, number>;
  
  // Escalação
  escalation_rate: number; // %
  avg_escalation_time_min: number;
}
```

---

## 🗄️ Tabelas Necessárias

### 1. support_tickets
```sql
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  
  -- Usuário
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT CHECK (user_type IN ('client', 'provider')),
  user_email TEXT NOT NULL,
  user_phone TEXT,
  
  -- Classificação
  category TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL CHECK (status IN ('new', 'assigned', 'in_progress', 'waiting_user', 'waiting_internal', 'escalated', 'resolved', 'closed')),
  
  -- Conteúdo
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  attachments TEXT[],
  
  -- Atribuição
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_level INTEGER CHECK (assigned_level IN (1, 2, 3)),
  assigned_at TIMESTAMPTZ,
  
  -- SLA
  created_at TIMESTAMPTZ DEFAULT NOW(),
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  sla_deadline TIMESTAMPTZ NOT NULL,
  is_sla_breached BOOLEAN DEFAULT false,
  
  -- Satisfação
  satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
  satisfaction_comment TEXT,
  
  -- Metadata
  tags TEXT[],
  related_booking_id UUID REFERENCES bookings(id),
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX idx_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_tickets_assigned ON support_tickets(assigned_to, status);
CREATE INDEX idx_tickets_status ON support_tickets(status);
CREATE INDEX idx_tickets_sla ON support_tickets(sla_deadline) WHERE status NOT IN ('resolved', 'closed');
```

### 2. ticket_messages
```sql
CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_type TEXT CHECK (sender_type IN ('user', 'support', 'system')),
  message TEXT NOT NULL,
  attachments TEXT[],
  is_internal BOOLEAN DEFAULT false, -- Nota interna, não visível para usuário
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id, created_at);
```

### 3. knowledge_base_articles
```sql
CREATE TABLE knowledge_base_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  
  is_public BOOLEAN DEFAULT true,
  is_internal BOOLEAN DEFAULT false,
  
  views_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  version INTEGER DEFAULT 1,
  last_updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kb_category ON knowledge_base_articles(category);
CREATE INDEX idx_kb_search ON knowledge_base_articles USING gin(to_tsvector('portuguese', title || ' ' || content));
```

### 4. quick_replies
```sql
CREATE TABLE quick_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  variables TEXT[],
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎯 SLA (Service Level Agreement)

| Prioridade | Primeira Resposta | Resolução | Escalação |
|------------|-------------------|-----------|-----------|
| **Urgent** | 1 hora | 4 horas | Imediata |
| **High** | 4 horas | 24 horas | 2 horas |
| **Medium** | 24 horas | 72 horas | 24 horas |
| **Low** | 48 horas | 7 dias | 48 horas |

---

## 📈 Métricas de Sucesso

- **First Response Time:** < 2 horas (média)
- **Resolution Time:** < 24 horas (média)
- **SLA Compliance:** > 95%
- **Customer Satisfaction:** > 4.5/5
- **Escalation Rate:** < 10%
- **Ticket Reopen Rate:** < 5%

---

**Próximo:** [04-role-admin.md](./04-role-admin.md)
