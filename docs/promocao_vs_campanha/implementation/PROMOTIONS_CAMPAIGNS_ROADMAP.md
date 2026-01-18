# 🗺️ Roadmap de Implementação - Promoções e Campanhas

## 📋 Visão Geral

Este documento detalha o plano de implementação passo a passo do sistema de Promoções e Campanhas, dividido em fases incrementais.

---

## 🎯 Estratégia de Implementação

### Princípios
1. ✅ **Incremental:** Cada fase entrega valor
2. ✅ **Testável:** Testar antes de avançar
3. ✅ **Reversível:** Poder voltar atrás se necessário
4. ✅ **Documentado:** Documentar cada decisão

### Priorização
- 🔥 **P0 (Crítico):** MVP funcional
- ⚡ **P1 (Alto):** Features essenciais
- 📊 **P2 (Médio):** Melhorias
- 🔮 **P3 (Baixo):** Features avançadas

---

## 📅 FASE 1: Fundação (Semana 1-2) 🔥 P0

### Objetivo
Criar estrutura básica de promoções simples.

### 1.1 Migration SQL - Tabelas Base (Dia 1-2)

**Arquivo:** `fixy-supabase/supabase/migrations/YYYYMMDD_promotions_foundation.sql`

**O que criar:**
```sql
-- 1. Tabela promotions (versão simplificada)
-- 2. Tabela promotion_usage
-- 3. Tabela promotion_limits
-- 4. Índices básicos
-- 5. RLS policies
```

**Checklist:**
- [ ] Criar tabela `promotions` com campos essenciais
- [ ] Criar tabela `promotion_usage` para tracking
- [ ] Criar tabela `promotion_limits` com limites por plano
- [ ] Popular `promotion_limits` com dados dos 3 planos
- [ ] Criar índices para performance
- [ ] Implementar RLS policies
- [ ] Testar queries básicas

**Tempo estimado:** 4-6 horas

---

### 1.2 Funções SQL Básicas (Dia 2-3)

**Arquivo:** Mesmo migration acima

**O que criar:**
```sql
-- 1. check_promotion_limit()
-- 2. create_promotion()
-- 3. activate_promotion()
-- 4. deactivate_promotion()
-- 5. increment_promotion_metrics()
```

**Checklist:**
- [ ] Função para verificar limites
- [ ] Função para criar promoção
- [ ] Função para ativar/desativar
- [ ] Função para atualizar métricas
- [ ] Triggers automáticos
- [ ] Testar todas as funções

**Tempo estimado:** 3-4 horas

---

### 1.3 Types TypeScript (Dia 3)

**Arquivo:** `fixy-backoffice/src/types/promotions.ts`

**O que criar:**
```typescript
// Interfaces básicas
- Promotion
- PromotionLimits
- PromotionUsage
- CreatePromotionParams
- PromotionFilters
- PromotionStats

// Enums e constantes
- PromotionStatus
- TargetType
- PROMOTION_STATUS_LABELS
- PROMOTION_LIMITS (por plano)
```

**Checklist:**
- [ ] Criar todas as interfaces
- [ ] Criar enums
- [ ] Criar constantes
- [ ] Validar com schema SQL
- [ ] Sem erros TypeScript

**Tempo estimado:** 2-3 horas

---

### 1.4 Server Actions Básicas (Dia 4-5)

**Arquivo:** `fixy-backoffice/src/app/actions/promotions.ts`

**O que criar:**
```typescript
// CRUD básico
- createPromotion()
- updatePromotion()
- deletePromotion()
- getPromotionById()
- getProviderPromotions()

// Limites
- checkPromotionLimit()
- getPromotionUsage()

// Ativação
- activatePromotion()
- pausePromotion()
```

**Checklist:**
- [ ] Implementar todas as actions
- [ ] Validações de permissão
- [ ] Error handling
- [ ] Revalidação de cache
- [ ] Testar cada action

**Tempo estimado:** 4-5 horas

---

### 1.5 Componente Básico de Promoção (Dia 5-6)

**Arquivo:** `fixy-backoffice/src/components/promotions/PromotionCard.tsx`

**O que criar:**
- Card de exibição de promoção
- Status visual
- Métricas básicas (impressions, clicks)
- Botões de ação (editar, pausar, deletar)

**Checklist:**
- [ ] Criar componente PromotionCard
- [ ] Exibir dados da promoção
- [ ] Mostrar status com cores
- [ ] Botões funcionais
- [ ] Responsivo
- [ ] Dark mode

**Tempo estimado:** 3-4 horas

---

### 1.6 Página de Gestão de Promoções (Dia 6-7)

**Arquivo:** `fixy-backoffice/src/app/(dashboard)/provider/promotions/page.tsx`

**O que criar:**
- Lista de promoções do provider
- Filtros básicos (status, data)
- Botão "Criar Promoção"
- Estatísticas gerais

**Checklist:**
- [ ] Criar página
- [ ] Listar promoções
- [ ] Implementar filtros
- [ ] Mostrar estatísticas
- [ ] Link para criar nova
- [ ] Testar fluxo completo

**Tempo estimado:** 4-5 horas

---

### 1.7 Formulário de Criação (Dia 7-8)

**Arquivo:** `fixy-backoffice/src/components/promotions/PromotionForm.tsx`

**O que criar:**
- Formulário simples
- Seleção de alvo (post, serviço, perfil)
- Datas de início/fim
- Raio de alcance
- Validações

**Checklist:**
- [ ] Criar formulário
- [ ] Validações client-side
- [ ] Verificar limite antes de criar
- [ ] Feedback visual
- [ ] Testar criação

**Tempo estimado:** 4-5 horas

---

### 1.8 Testes e Ajustes (Dia 9-10)

**O que testar:**
- [ ] Criar promoção como Free (limite 5)
- [ ] Tentar criar 6ª promoção (deve bloquear)
- [ ] Ativar promoção
- [ ] Pausar promoção
- [ ] Deletar promoção
- [ ] Ver estatísticas
- [ ] Testar em mobile
- [ ] Testar dark mode

**Tempo estimado:** 4-6 horas

---

### ✅ Entregável Fase 1
- Sistema básico de promoções funcionando
- Provider pode criar, editar, pausar, deletar
- Limites por plano funcionando
- Interface básica mas funcional

**Tempo total Fase 1:** 28-38 horas (2 semanas)

---

## 📅 FASE 2: Campanhas Básicas (Semana 3-4) ⚡ P1

### Objetivo
Adicionar sistema de campanhas com mais recursos.

### 2.1 Migration SQL - Tabela Campaigns (Dia 11-12)

**Arquivo:** `fixy-supabase/supabase/migrations/YYYYMMDD_campaigns_system.sql`

**O que criar:**
```sql
-- 1. Tabela campaigns
-- 2. Atualizar promotion_limits com limites de campanhas
-- 3. Atualizar promotion_usage com contador de campanhas
-- 4. Índices
-- 5. RLS policies
```

**Checklist:**
- [ ] Criar tabela campaigns
- [ ] Adicionar campos de campanha em limits
- [ ] Adicionar contador em usage
- [ ] Criar índices
- [ ] RLS policies
- [ ] Testar queries

**Tempo estimado:** 4-5 horas

---

### 2.2 Funções SQL de Campanhas (Dia 12-13)

**O que criar:**
```sql
-- 1. check_campaign_limit()
-- 2. create_campaign()
-- 3. activate_campaign()
-- 4. calculate_campaign_roi()
```

**Checklist:**
- [ ] Função de verificação de limite
- [ ] Função de criação
- [ ] Função de ativação
- [ ] Função de cálculo de ROI
- [ ] Testar todas

**Tempo estimado:** 3-4 horas

---

### 2.3 Types e Actions de Campanhas (Dia 13-14)

**Arquivos:**
- `src/types/campaigns.ts`
- `src/app/actions/campaigns.ts`

**O que criar:**
- Interfaces de Campaign
- Actions CRUD
- Validações específicas

**Checklist:**
- [ ] Criar types
- [ ] Criar actions
- [ ] Validações
- [ ] Error handling
- [ ] Testar

**Tempo estimado:** 4-5 horas

---

### 2.4 Componentes de Campanha (Dia 14-16)

**Arquivos:**
- `CampaignCard.tsx`
- `CampaignForm.tsx`
- `CampaignStats.tsx`

**O que criar:**
- Card de campanha (mais rico que promoção)
- Formulário de criação (mais complexo)
- Estatísticas detalhadas

**Checklist:**
- [ ] Criar CampaignCard
- [ ] Criar CampaignForm
- [ ] Criar CampaignStats
- [ ] Integrar com actions
- [ ] Testar

**Tempo estimado:** 8-10 horas

---

### 2.5 Página de Campanhas (Dia 16-17)

**Arquivo:** `src/app/(dashboard)/provider/campaigns/page.tsx`

**O que criar:**
- Lista de campanhas
- Filtros avançados
- Comparação de performance

**Checklist:**
- [ ] Criar página
- [ ] Listar campanhas
- [ ] Filtros
- [ ] Comparações
- [ ] Testar

**Tempo estimado:** 4-5 horas

---

### 2.6 Testes Fase 2 (Dia 18-19)

**O que testar:**
- [ ] Criar campanha como Free (limite 2)
- [ ] Criar campanha como Premium (limite 5)
- [ ] Múltiplos serviços
- [ ] Desconto configurável
- [ ] Estatísticas
- [ ] ROI calculado

**Tempo estimado:** 4-6 horas

---

### ✅ Entregável Fase 2
- Sistema de campanhas funcionando
- Diferenciação clara entre promoção e campanha
- Limites por plano respeitados
- Estatísticas mais ricas

**Tempo total Fase 2:** 27-35 horas (2 semanas)

---

## 📅 FASE 3: Segmentação e Analytics (Semana 5-6) 📊 P1

### Objetivo
Adicionar segmentação de público e analytics avançado.

### 3.1 Segmentação de Público (Dia 20-22)

**O que implementar:**
- Filtros de idade, gênero, interesses
- Raio geográfico avançado
- Horários específicos
- Histórico de comportamento

**Checklist:**
- [ ] Adicionar campos de segmentação
- [ ] UI para configurar segmentação
- [ ] Validar segmentação no backend
- [ ] Aplicar filtros em queries
- [ ] Testar

**Tempo estimado:** 8-10 horas

---

### 3.2 Analytics Avançado (Dia 22-24)

**O que implementar:**
- Dashboard de métricas
- Gráficos de performance
- Comparação temporal
- Exportação de relatórios

**Checklist:**
- [ ] Criar dashboard
- [ ] Implementar gráficos (ApexCharts)
- [ ] Comparações
- [ ] Exportar PDF/CSV
- [ ] Testar

**Tempo estimado:** 8-10 horas

---

### 3.3 A/B Testing (Dia 24-26)

**O que implementar:**
- Criar variações de promoção/campanha
- Distribuir tráfego
- Comparar resultados
- Declarar vencedor

**Checklist:**
- [ ] Tabela de variações
- [ ] Lógica de distribuição
- [ ] Tracking separado
- [ ] Comparação de resultados
- [ ] Testar

**Tempo estimado:** 8-10 horas

---

### ✅ Entregável Fase 3
- Segmentação avançada funcionando
- Analytics completo
- A/B testing operacional
- Relatórios exportáveis

**Tempo total Fase 3:** 24-30 horas (2 semanas)

---

## 📅 FASE 4: IA e Automação (Semana 7-10) 🔮 P2

### Objetivo
Implementar agente de IA para Premium+.

### 4.1 Infraestrutura de IA (Dia 27-30)

**O que implementar:**
- Tabelas de sugestões e relatórios
- Edge Function para IA
- Integração com OpenAI/Claude
- Cron jobs

**Checklist:**
- [ ] Criar tabelas de IA
- [ ] Edge Function de análise
- [ ] Integrar LLM
- [ ] Cron jobs
- [ ] Testar

**Tempo estimado:** 12-15 horas

---

### 4.2 Análise de Tendências (Dia 30-33)

**O que implementar:**
- Coletar dados de buscas
- Identificar tendências
- Detectar oportunidades
- Gerar insights

**Checklist:**
- [ ] Coletar dados
- [ ] Algoritmo de tendências
- [ ] Detecção de oportunidades
- [ ] Gerar insights
- [ ] Testar

**Tempo estimado:** 10-12 horas

---

### 4.3 Sugestões Automáticas (Dia 33-36)

**O que implementar:**
- Gerar sugestões de campanhas
- Calcular ROI previsto
- Priorizar por urgência
- Notificar provider

**Checklist:**
- [ ] Algoritmo de sugestões
- [ ] Cálculo de ROI
- [ ] Sistema de prioridade
- [ ] Notificações
- [ ] Testar

**Tempo estimado:** 10-12 horas

---

### 4.4 Relatórios Semanais (Dia 36-38)

**O que implementar:**
- Gerar relatório semanal
- Análise de performance
- Comparação com mercado
- Recomendações

**Checklist:**
- [ ] Cron semanal
- [ ] Coletar dados
- [ ] Gerar análise
- [ ] Criar recomendações
- [ ] Enviar email
- [ ] Testar

**Tempo estimado:** 8-10 horas

---

### 4.5 Otimização Automática (Dia 38-40)

**O que implementar:**
- Ajustar orçamento automaticamente
- Expandir/reduzir raio
- Alterar horários
- Pausar se performance ruim

**Checklist:**
- [ ] Algoritmo de otimização
- [ ] Regras de ajuste
- [ ] Aplicar mudanças
- [ ] Notificar provider
- [ ] Testar

**Tempo estimado:** 8-10 horas

---

### ✅ Entregável Fase 4
- Agente de IA funcionando
- Sugestões automáticas
- Relatórios semanais
- Otimização em tempo real

**Tempo total Fase 4:** 48-59 horas (4 semanas)

---

## 📅 FASE 5: Polimento e Escala (Semana 11-12) 📊 P2

### Objetivo
Otimizar, documentar e preparar para escala.

### 5.1 Otimização de Performance (Dia 41-43)

**O que fazer:**
- Otimizar queries SQL
- Adicionar caching
- Lazy loading
- Paginação eficiente

**Checklist:**
- [ ] Analisar queries lentas
- [ ] Adicionar índices
- [ ] Implementar cache
- [ ] Otimizar frontend
- [ ] Testar performance

**Tempo estimado:** 8-10 horas

---

### 5.2 Documentação Completa (Dia 43-45)

**O que criar:**
- Guia do usuário
- Documentação técnica
- API docs
- Vídeos tutoriais

**Checklist:**
- [ ] Guia para providers
- [ ] Docs técnicas
- [ ] API reference
- [ ] Vídeos curtos
- [ ] FAQ

**Tempo estimado:** 8-10 horas

---

### 5.3 Testes de Carga (Dia 45-46)

**O que testar:**
- 1000 promoções simultâneas
- 100 campanhas ativas
- 10000 usuários buscando
- IA processando 100 providers

**Checklist:**
- [ ] Setup de testes
- [ ] Executar testes
- [ ] Identificar gargalos
- [ ] Otimizar
- [ ] Re-testar

**Tempo estimado:** 6-8 horas

---

### 5.4 Monitoramento e Alertas (Dia 46-47)

**O que implementar:**
- Logs estruturados
- Métricas de sistema
- Alertas de erro
- Dashboard de saúde

**Checklist:**
- [ ] Configurar logging
- [ ] Métricas (Prometheus/Grafana)
- [ ] Alertas (Sentry)
- [ ] Dashboard
- [ ] Testar

**Tempo estimado:** 6-8 horas

---

### ✅ Entregável Fase 5
- Sistema otimizado
- Documentação completa
- Testes de carga passando
- Monitoramento ativo

**Tempo total Fase 5:** 28-36 horas (2 semanas)

---

## 📊 Resumo Geral

| Fase | Objetivo | Tempo | Prioridade |
|------|----------|-------|------------|
| **Fase 1** | Promoções Básicas | 28-38h | 🔥 P0 |
| **Fase 2** | Campanhas | 27-35h | ⚡ P1 |
| **Fase 3** | Segmentação & Analytics | 24-30h | 📊 P1 |
| **Fase 4** | IA & Automação | 48-59h | 🔮 P2 |
| **Fase 5** | Polimento | 28-36h | 📊 P2 |
| **TOTAL** | **Sistema Completo** | **155-198h** | **10-12 semanas** |

---

## 🎯 Milestones

### Milestone 1: MVP (Fim Fase 1)
- ✅ Promoções básicas funcionando
- ✅ Limites por plano
- ✅ Interface funcional

### Milestone 2: Feature Complete (Fim Fase 3)
- ✅ Campanhas completas
- ✅ Segmentação avançada
- ✅ Analytics completo

### Milestone 3: AI Ready (Fim Fase 4)
- ✅ Agente de IA operacional
- ✅ Sugestões automáticas
- ✅ Otimização em tempo real

### Milestone 4: Production Ready (Fim Fase 5)
- ✅ Sistema otimizado
- ✅ Documentado
- ✅ Escalável

---

## 🚀 Como Começar

### Passo 1: Preparação
1. Revisar documentos de negócio e técnico
2. Configurar ambiente de desenvolvimento
3. Criar branch `feature/promotions-campaigns`

### Passo 2: Fase 1 - Dia 1
1. Criar migration SQL
2. Aplicar no Supabase
3. Testar funções básicas

### Passo 3: Continuar Incrementalmente
- Seguir roadmap passo a passo
- Testar cada entrega
- Documentar decisões
- Fazer code review

---

**Status:** 📋 Roadmap Completo - Pronto para Execução  
**Última atualização:** 2026-01-16  
**Próximo passo:** Aguardar aprovação para iniciar Fase 1
