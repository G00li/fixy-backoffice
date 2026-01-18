# ⭐ Review System Components

Sistema completo de avaliações para a plataforma Fixy, permitindo que clientes avaliem serviços concluídos e providers respondam às avaliações.

---

## 📦 Componentes Disponíveis

### 1. **ReviewStars**
Componente de estrelas reutilizável para exibir e selecionar ratings.

**Props:**
```typescript
interface ReviewStarsProps {
  rating: number;
  maxRating?: number; // Default: 5
  size?: 'sm' | 'md' | 'lg' | 'xl'; // Default: 'md'
  interactive?: boolean; // Default: false
  onChange?: (rating: number) => void;
  showLabel?: boolean; // Default: false
  className?: string;
}
```

**Exemplo de Uso:**
```tsx
// Display only
<ReviewStars rating={4.5} size="lg" showLabel />

// Interactive
<ReviewStars
  rating={rating}
  interactive
  onChange={setRating}
  size="lg"
  showLabel
/>
```

**Features:**
- ✅ Suporta half-stars (0.5)
- ✅ Modo interativo com hover
- ✅ Labels descritivos (Excelente, Bom, etc.)
- ✅ 4 tamanhos diferentes
- ✅ Dark mode

---

### 2. **ReviewCard**
Card individual de avaliação com todas as informações e ações.

**Props:**
```typescript
interface ReviewCardProps {
  review: ReviewWithDetails;
  isProvider?: boolean;
  onRespond?: (reviewId: string, response: string) => void;
  onFlag?: (reviewId: string, reason: string) => void;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
  className?: string;
}
```

**Exemplo de Uso:**
```tsx
<ReviewCard
  review={review}
  isProvider={true}
  onRespond={handleRespond}
  onFlag={handleFlag}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

**Features:**
- ✅ Rating geral e detalhado (4 critérios)
- ✅ Comentário e fotos
- ✅ Resposta do provider
- ✅ Formulário inline para responder
- ✅ Reportar avaliação inadequada
- ✅ Editar/excluir (dentro de 7 dias)
- ✅ Informações do reviewer
- ✅ Data da avaliação

---

### 3. **ReviewsList**
Lista de avaliações com filtros e ordenação.

**Props:**
```typescript
interface ReviewsListProps {
  reviews: ReviewWithDetails[];
  isProvider?: boolean;
  onRespond?: (reviewId: string, response: string) => void;
  onFlag?: (reviewId: string, reason: string) => void;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
  className?: string;
}
```

**Exemplo de Uso:**
```tsx
<ReviewsList
  reviews={reviews}
  isProvider={false}
  onFlag={handleFlag}
/>
```

**Features:**
- ✅ Filtro por rating (1-5 estrelas)
- ✅ Filtro "apenas com fotos"
- ✅ Ordenação (recentes, maior/menor rating)
- ✅ Contador de resultados
- ✅ Empty state
- ✅ Integração com ReviewCard

---

### 4. **ReviewStats**
Estatísticas visuais de avaliações.

**Props:**
```typescript
interface ReviewStatsProps {
  stats: ReviewStats;
  className?: string;
}
```

**Exemplo de Uso:**
```tsx
<ReviewStats stats={stats} />
```

**Features:**
- ✅ Rating médio geral (grande destaque)
- ✅ Distribuição por estrelas (gráfico de barras)
- ✅ Médias detalhadas (4 critérios)
- ✅ Estatísticas adicionais (com fotos, com resposta)
- ✅ Design visual atrativo

---

### 5. **ReviewForm**
Formulário completo para criar avaliação.

**Props:**
```typescript
interface ReviewFormProps {
  bookingId: string;
  serviceName: string;
  providerName: string;
  onSuccess?: (reviewId: string) => void;
  onCancel?: () => void;
  className?: string;
}
```

**Exemplo de Uso:**
```tsx
<ReviewForm
  bookingId={bookingId}
  serviceName="Instalação Elétrica"
  providerName="João Silva"
  onSuccess={(reviewId) => {
    router.push(`/bookings`);
  }}
  onCancel={() => router.back()}
/>
```

**Features:**
- ✅ 4 ratings detalhados (interativos)
- ✅ Preview do rating geral
- ✅ Campo de comentário (2000 chars)
- ✅ Upload de fotos (placeholder)
- ✅ Validações client-side
- ✅ Loading states
- ✅ Error handling

---

## 📄 Páginas

### 1. **`/bookings/[id]/review`**
Página para cliente criar avaliação de um booking concluído.

**Features:**
- ✅ Verificação de autenticação
- ✅ Verificação de ownership (cliente do booking)
- ✅ Verificação de status (apenas completed)
- ✅ Verificação de avaliação existente
- ✅ Integração com ReviewForm
- ✅ Info box com dicas
- ✅ Redirect após sucesso

---

### 2. **`/providers/[id]/reviews`**
Página de avaliações do provider.

**Features:**
- ✅ Informações do provider
- ✅ Estatísticas em sidebar (sticky)
- ✅ Lista de avaliações
- ✅ Empty state com CTA
- ✅ Layout responsivo (grid)
- ✅ Link para voltar ao perfil

---

## 🔧 Actions (Server-Side)

Todas as ações estão em `@/app/actions/reviews.ts`:

### Para Clientes:
- `createReview(params)` - Criar avaliação
- `updateReview(params)` - Atualizar avaliação (7 dias)
- `deleteReview(reviewId)` - Excluir avaliação
- `getMyReviews()` - Listar minhas avaliações
- `flagReview(params)` - Reportar avaliação

### Para Providers:
- `respondToReview(params)` - Responder avaliação
- `getProviderReviews(params)` - Listar avaliações recebidas

### Compartilhadas:
- `getReviewById(reviewId)` - Buscar avaliação por ID
- `getReviewByBookingId(bookingId)` - Buscar avaliação por booking
- `getReviewStats(providerId)` - Estatísticas de avaliações

---

## 🎨 Tipos TypeScript

Todos os tipos estão em `@/types/reviews.ts`:

### Principais Interfaces:
- `Review` - Avaliação básica
- `ReviewWithDetails` - Avaliação com dados de reviewer/booking/service
- `ReviewStats` - Estatísticas de avaliações
- `RatingDistribution` - Distribuição de ratings

### Request/Response Types:
- `CreateReviewParams`
- `UpdateReviewParams`
- `RespondToReviewParams`
- `FlagReviewParams`
- `GetProviderReviewsParams`

### Constantes:
- `RATING_LABELS` - Labels em português
- `RATING_COLORS` - Classes Tailwind para cores
- `RATING_BG_COLORS` - Backgrounds por rating
- `RATING_CRITERIA_LABELS` - Labels dos critérios
- `RATING_CRITERIA_ICONS` - Ícones dos critérios
- `REVIEW_VALIDATION` - Constantes de validação

### Helper Functions:
- `getRatingLabel(rating)` - Retorna label do rating
- `getRatingColor(rating)` - Retorna classe de cor
- `getRatingBgColor(rating)` - Retorna classe de background
- `calculateRatingDistribution(stats)` - Calcula distribuição
- `canEditReview(createdAt)` - Verifica se pode editar
- `formatRating(rating)` - Formata rating (1 decimal)

---

## 🗄️ Banco de Dados

### Tabela Principal:
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  booking_id UUID UNIQUE REFERENCES bookings(id),
  reviewer_id UUID REFERENCES profiles(id),
  provider_id UUID REFERENCES profiles(id),
  quality_rating INTEGER (1-5),
  punctuality_rating INTEGER (1-5),
  communication_rating INTEGER (1-5),
  value_rating INTEGER (1-5),
  overall_rating NUMERIC (calculated),
  comment TEXT,
  images TEXT[],
  provider_response TEXT,
  provider_response_at TIMESTAMPTZ,
  is_verified BOOLEAN,
  is_flagged BOOLEAN,
  flag_reason TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Funções SQL:
- `create_review()` - Cria avaliação com validações
- `update_review()` - Atualiza avaliação (7 dias)
- `update_provider_rating()` - Atualiza rating do provider
- `respond_to_review()` - Provider responde
- `flag_review()` - Reporta avaliação
- `get_provider_reviews()` - Busca com filtros
- `get_review_stats()` - Estatísticas completas

### View:
- `reviews_with_details` - View com joins de reviewer, booking, service

### RLS Policies:
- ✅ Qualquer um pode ver reviews não reportadas
- ✅ Cliente pode criar review do seu booking
- ✅ Reviewer pode atualizar sua review (7 dias)
- ✅ Provider pode responder reviews

---

## 🎯 Fluxos de Uso

### Fluxo do Cliente:

1. **Completar Serviço**
   - Booking é marcado como "completed"
   - Cliente recebe notificação para avaliar

2. **Criar Avaliação**
   - Cliente acessa `/bookings/[id]/review`
   - Preenche 4 ratings detalhados
   - Adiciona comentário e fotos (opcional)
   - Submete avaliação

3. **Editar Avaliação**
   - Cliente pode editar em até 7 dias
   - Acessa a avaliação e clica em "Editar"
   - Atualiza ratings/comentário

4. **Ver Avaliações de Provider**
   - Cliente acessa `/providers/[id]/reviews`
   - Vê estatísticas e todas as avaliações
   - Pode reportar avaliações inadequadas

### Fluxo do Provider:

1. **Receber Avaliação**
   - Provider recebe notificação de nova avaliação
   - Avaliação aparece no perfil público

2. **Responder Avaliação**
   - Provider acessa suas avaliações
   - Clica em "Responder avaliação"
   - Escreve resposta (máx 1000 chars)
   - Resposta aparece publicamente

3. **Monitorar Rating**
   - Rating médio é atualizado automaticamente
   - Aparece no perfil e na busca
   - Influencia ranking de busca

---

## 🔐 Segurança

### Validações:
- ✅ Apenas bookings "completed" podem ser avaliados
- ✅ Uma avaliação por booking
- ✅ Apenas cliente do booking pode avaliar
- ✅ Edição limitada a 7 dias
- ✅ Ratings entre 1-5
- ✅ Comentário máx 2000 chars
- ✅ Resposta máx 1000 chars
- ✅ Máximo 5 imagens

### RLS:
- ✅ Reviews reportadas não aparecem publicamente
- ✅ Apenas reviewer pode editar/excluir
- ✅ Apenas provider pode responder
- ✅ Qualquer um pode ver reviews públicas

---

## 🎨 Estilização

### Cores por Rating:
- ⭐ **1 estrela:** Red (Muito ruim)
- ⭐⭐ **2 estrelas:** Orange (Ruim)
- ⭐⭐⭐ **3 estrelas:** Yellow (Regular)
- ⭐⭐⭐⭐ **4 estrelas:** Green (Bom)
- ⭐⭐⭐⭐⭐ **5 estrelas:** Emerald (Excelente)

### Critérios de Avaliação:
- ⭐ **Qualidade:** Qualidade do serviço prestado
- ⏰ **Pontualidade:** Chegou no horário combinado
- 💬 **Comunicação:** Clareza e profissionalismo
- 💰 **Custo-Benefício:** Preço justo pelo serviço

---

## 📱 Responsividade

Todos os componentes são totalmente responsivos:

- **Mobile (< 640px):** Layout em coluna, cards full-width
- **Tablet (640px - 1024px):** Grid 2 colunas
- **Desktop (> 1024px):** Grid 3 colunas (stats + reviews)

---

## ♿ Acessibilidade

- ✅ ARIA labels em estrelas
- ✅ Navegação por teclado
- ✅ Contraste adequado (WCAG AA)
- ✅ Focus states visíveis
- ✅ Mensagens de erro descritivas
- ✅ Alt text em imagens

---

## 🔄 Integrações

### Com Fase 2.5 (Agendamentos):
- Apenas bookings "completed" podem ser avaliados
- Link para criar review após conclusão
- Review aparece nos detalhes do booking

### Com Fase 2.2 (Busca):
- Rating influencia ranking de busca
- Filtro por rating mínimo
- Providers com mais reviews aparecem primeiro

### Com Fase 2.1 (Posts):
- Reviews aparecem no perfil do provider
- Estatísticas visíveis para todos

### Com Sistema de Notificações (Futuro):
- Notificar cliente para avaliar
- Notificar provider de nova avaliação
- Notificar provider de resposta

---

## 🚀 Melhorias Futuras

### Funcionalidades:
- [ ] Upload real de imagens (Supabase Storage)
- [ ] Galeria de fotos expandida
- [ ] Filtro por serviço específico
- [ ] Busca em comentários
- [ ] Ordenação por "mais úteis"
- [ ] Sistema de "útil/não útil" em reviews
- [ ] Badges para reviewers frequentes
- [ ] Verificação de compra (verified purchase)

### UX:
- [ ] Preview de imagens em lightbox
- [ ] Animações de transição
- [ ] Skeleton loading
- [ ] Infinite scroll
- [ ] Compartilhar review em redes sociais

### Analytics:
- [ ] Taxa de resposta do provider
- [ ] Tempo médio de resposta
- [ ] Evolução do rating ao longo do tempo
- [ ] Palavras mais usadas em comentários

---

## 📚 Documentação Adicional

- [Plano da Fase 2.6](../../docs/plano/02-role-provider.md)
- [Migration SQL](../../../fixy-supabase/supabase/migrations/20260104180000_review_system.sql)
- [Types](../../types/reviews.ts)
- [Actions](../../app/actions/reviews.ts)

---

## 🤝 Contribuindo

Ao adicionar novos componentes ou features:

1. Siga os padrões existentes
2. Use TypeScript com tipos estritos
3. Adicione documentação inline
4. Teste em mobile e desktop
5. Verifique dark mode
6. Adicione error handling
7. Atualize este README

---

**Última atualização:** 2026-01-04  
**Versão:** 1.0.0  
**Status:** ✅ Completo (100%)
