# 🎯 Plano Geral - Fixy Platform

## 📌 Visão Geral

**Fixy** é uma plataforma completa (Web + Mobile futuro) que conecta clientes a prestadores de serviços locais de confiança, diferenciando-se de redes sociais tradicionais ao focar em **utilidade prática, confiança e descoberta de serviços**.

### 🎯 Objetivo Principal

Criar um ecossistema onde:
- **Clientes** encontram serviços de qualidade rapidamente (emergências, recomendações, avaliações)
- **Prestadores** divulgam seus serviços, constroem reputação e gerenciam agendamentos
- **Admins** garantem crescimento equilibrado e justo da plataforma
- **Suporte** resolve problemas de forma ágil e organizada
- **Super Admins** têm visão estratégica completa do negócio

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                        │
├─────────────────────────────────────────────────────────┤
│  Web Client (fixy)          │  Backoffice (fixy-backoffice) │
│  - Next.js 16 + React 19    │  - Next.js 16 + React 19      │
│  - Tailwind CSS 4           │  - TailAdmin Template         │
│  - Framer Motion            │  - ApexCharts                 │
│  - Radix UI                 │  - FullCalendar               │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    BACKEND LAYER                         │
├─────────────────────────────────────────────────────────┤
│              Supabase (fixy-supabase)                    │
│  - PostgreSQL 17 + PostGIS                               │
│  - Row Level Security (RLS)                              │
│  - Realtime Subscriptions                                │
│  - Storage (avatars, images)                             │
│  - Edge Functions                                        │
│  - Auth (JWT + OAuth)                                    │
└─────────────────────────────────────────────────────────┘
```

### Hierarquia de Roles

```
super_admin (Nível 5) - Visão estratégica completa
    ↓
admin (Nível 4) - Gestão operacional e análises
    ↓
support (Nível 3) - Atendimento especializado
    ↓ (support_level: 1, 2, 3)
provider (Nível 2) - Prestadores de serviço
    ↓
client (Nível 1) - Usuários finais
```

---

## 🎨 Diferenciação vs Redes Sociais

### ❌ O que NÃO somos

- Não somos Facebook (foco em conexões pessoais)
- Não somos LinkedIn (foco em networking profissional)
- Não somos Instagram (foco em lifestyle e entretenimento)

### ✅ O que SOMOS

**Marketplace de Serviços Locais com Componente Social**

| Aspecto | Redes Sociais | Fixy |
|---------|---------------|------|
| **Objetivo** | Entretenimento/Networking | Resolver problemas práticos |
| **Conteúdo** | Posts pessoais/lifestyle | Portfólio de serviços |
| **Interação** | Curtidas/Comentários | Agendamentos/Avaliações |
| **Descoberta** | Algoritmo de engajamento | Busca por necessidade + localização |
| **Monetização** | Ads/Influencers | Comissão em serviços + Planos |
| **Confiança** | Seguidores | Avaliações verificadas + Histórico |

---

## 🔑 Funcionalidades Core por Role

### 👤 CLIENT (Usuário Final)

**Problema que resolve:** "Preciso de um serviço confiável AGORA"

- ✅ Busca por serviço + localização + disponibilidade
- ✅ Filtros: avaliação, preço, distância, status (aberto/fechado)
- ✅ Ver portfólio do provider (posts, fotos, vídeos)
- ✅ Agendar serviços (agenda pública/privada)
- ✅ Avaliar serviços (rating + comentário + fotos)
- ✅ Seguir providers favoritos
- ✅ Receber recomendações de amigos
- ✅ Fixar recomendações no perfil
- ✅ Chat com provider
- ✅ Histórico de serviços

### 🔧 PROVIDER (Prestador de Serviço)

**Problema que resolve:** "Preciso divulgar meu serviço e gerenciar clientes"

- ✅ Perfil profissional completo
- ✅ Criar posts (portfólio: fotos, vídeos, textos)
- ✅ Gerenciar serviços (título, descrição, preço, duração)
- ✅ Configurar disponibilidade (horários, dias, status aberto/fechado)
- ✅ Agenda (pública = clientes veem slots / privada = apenas provider)
- ✅ Aceitar/Recusar/Cancelar agendamentos
- ✅ Receber avaliações
- ✅ Criar promoções
- ✅ Dashboard com métricas (agendamentos, receita, avaliações)
- ✅ Chat com clientes
- ✅ Configurar local de atendimento ou ida ao domicílio

### 🎧 SUPPORT (Suporte - 3 Níveis)

**Problema que resolve:** "Usuários precisam de ajuda rápida e eficiente"

#### Support Level 3 (Inicial)
- Atender tickets simples (dúvidas gerais, como usar)
- Responder FAQs
- Escalar para nível superior quando necessário

#### Support Level 2 (Intermediário)
- Resolver problemas específicos de usuários
- Ajustar configurações de conta
- Investigar bugs reportados
- Mediar conflitos cliente-provider

#### Support Level 1 (Avançado)
- Resolver problemas críticos e severos
- Acesso a logs e dados sensíveis
- Oferecer compensações/promoções especiais
- Escalar para admin quando necessário

**Ferramentas:**
- Sistema de tickets (categorizado, priorizado)
- Base de conhecimento
- Chat interno
- Histórico completo do usuário

### 👨‍💼 ADMIN (Administrador)

**Problema que resolve:** "Plataforma precisa crescer de forma equilibrada"

- ✅ Dashboard com KPIs (usuários, agendamentos, receita)
- ✅ Análise por setor (quais crescem, quais precisam de fomento)
- ✅ Criar campanhas de marketing para setores específicos
- ✅ Moderar conteúdo (posts, avaliações)
- ✅ Gerenciar usuários (banir, suspender, promover)
- ✅ Visualizar tickets de suporte
- ✅ Garantir que pequenos providers não sejam "engolidos" por grandes
- ✅ Ajustar algoritmo de busca/recomendação
- ✅ Criar ofertas e promoções sazonais

### 👑 SUPER ADMIN (Super Administrador)

**Problema que resolve:** "Visão estratégica e controle total"

- ✅ Dashboard executivo (crescimento, churn, LTV, CAC)
- ✅ Comparação temporal (mês a mês, ano a ano)
- ✅ Gerenciar admins e suporte
- ✅ Configurar períodos de ofertas especiais
- ✅ Análise de tickets (SLA, tempo de resolução, satisfação)
- ✅ Configurações globais da plataforma
- ✅ Auditoria completa (logs de ações administrativas)
- ✅ Gestão financeira (comissões, planos, pagamentos)

---

## 📊 Modelo de Negócio

### Receitas

1. **Comissão em Serviços** (5-15% por transação)
2. **Planos de Assinatura para Providers**
   - Free: Básico (limite de posts, sem destaque)
   - Pro: Destaque em buscas, posts ilimitados, analytics
   - Business: Múltiplos funcionários, API, prioridade

3. **Anúncios Patrocinados** (providers pagam para aparecer no topo)
4. **Verificação de Perfil** (selo de confiança)

### Custos

- Infraestrutura (Supabase, hosting)
- Equipe (devs, suporte, marketing)
- Pagamentos (Stripe/Mercado Pago fees)
- Marketing (aquisição de usuários)

---

## 🚀 Roadmap de Implementação

### Fase 1: MVP (3 meses) ✅ ATUAL
- [x] Sistema de autenticação
- [x] Perfis (client/provider)
- [x] RBAC (roles)
- [x] Serviços básicos
- [x] Agendamentos
- [x] Avaliações

### Fase 2: Social & Discovery (2 meses) 🔄 EM PROGRESSO
- [ ] Sistema de posts para providers
- [ ] Busca avançada (filtros, localização)
- [ ] Sistema de seguir/recomendações
- [ ] Agenda pública/privada
- [ ] Status aberto/fechado

### Fase 3: Admin & Support (2 meses)
- [ ] Backoffice completo
- [ ] Sistema de tickets
- [ ] Dashboard de métricas
- [ ] Logs de auditoria
- [ ] Campanhas de marketing

### Fase 4: Pagamentos & Monetização (2 meses)
- [ ] Integração Stripe/Mercado Pago
- [ ] Planos de assinatura
- [ ] Sistema de comissões
- [ ] Carteira digital

### Fase 5: Mobile App (3 meses)
- [ ] Flutter app (iOS + Android)
- [ ] Notificações push
- [ ] Chat em tempo real
- [ ] Geolocalização avançada

### Fase 6: Escala & Otimização (contínuo)
- [ ] Cache e CDN
- [ ] Elasticsearch para busca
- [ ] Machine Learning (recomendações)
- [ ] Internacionalização

---

## 🎯 Métricas de Sucesso

### Para Clientes
- Tempo médio para encontrar serviço < 2 minutos
- Taxa de agendamento completado > 80%
- NPS (Net Promoter Score) > 50

### Para Providers
- Tempo médio para primeiro agendamento < 7 dias
- Taxa de ocupação da agenda > 60%
- Receita média mensal crescente

### Para Plataforma
- Crescimento mensal de usuários > 20%
- Churn rate < 5%
- GMV (Gross Merchandise Value) crescente
- Tempo de resolução de tickets < 24h

---

## 🔐 Segurança & Compliance

- ✅ LGPD/GDPR compliance
- ✅ Row Level Security (RLS) em todas as tabelas
- ✅ Criptografia de dados sensíveis
- ✅ Auditoria de ações administrativas
- ✅ 2FA para admins
- ✅ Rate limiting
- ✅ Validação e sanitização de inputs
- ✅ Backup automático diário

---

## 📚 Próximos Documentos

1. **01-role-client.md** - Detalhamento completo do cliente
2. **02-role-provider.md** - Detalhamento completo do provider
3. **03-role-support.md** - Sistema de tickets e níveis
4. **04-role-admin.md** - Dashboard e ferramentas administrativas
5. **05-role-super-admin.md** - Visão estratégica e controle total
6. **06-database-architecture.md** - Schema e melhorias
7. **07-system-configuration.md** - Configurações técnicas
8. **08-packages-recommendations.md** - Tecnologias recomendadas

---

**Última atualização:** 2026-01-01
**Versão:** 1.0
**Status:** 🔄 Em desenvolvimento ativo
