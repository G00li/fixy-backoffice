# 👤 Role: CLIENT (Cliente/Usuário Final)

## 🎯 Objetivo da Role

**"Encontrar serviços de confiança de forma rápida e fácil, especialmente em situações de emergência ou quando preciso de recomendações."**

---

## 📋 Personas de Cliente

### Persona 1: João - Emergência Noturna
- **Situação:** Chave quebrou dentro da fechadura às 2h da manhã
- **Necessidade:** Chaveiro disponível AGORA
- **Comportamento:** Busca rápida, filtro por "aberto", contato imediato
- **Prioridade:** Velocidade > Preço

### Persona 2: Maria - Serviço Planejado
- **Situação:** Precisa reformar a cozinha
- **Necessidade:** Pedreiro confiável com boas avaliações
- **Comportamento:** Pesquisa detalhada, lê avaliações, compara preços
- **Prioridade:** Qualidade > Velocidade

### Persona 3: Pedro - Novo na Cidade
- **Situação:** Mudou-se recentemente, não conhece prestadores
- **Necessidade:** Mecânico, eletricista, encanador de confiança
- **Comportamento:** Busca recomendações de outros usuários
- **Prioridade:** Confiança > Preço

---

## 🔑 Funcionalidades Detalhadas

### 1. 🔍 Busca de Serviços

#### 1.1 Busca Rápida (Homepage)
```
┌─────────────────────────────────────────┐
│  🔍 O que você precisa?                 │
│  [Chaveiro, Encanador, Eletricista...] │
│                                         │
│  📍 Onde?                               │
│  [Sua localização atual] 📍            │
│                                         │
│  [🔍 Buscar Agora]                     │
└─────────────────────────────────────────┘
```

**Campos:**
- Serviço (autocomplete com categorias)
- Localização (GPS atual ou manual)
- Filtros rápidos: "Aberto agora", "Melhor avaliado", "Mais próximo"

#### 1.2 Busca Avançada
```sql
-- Exemplo de query
SELECT p.*, s.*, 
  AVG(r.rating) as avg_rating,
  COUNT(r.id) as total_reviews,
  ST_Distance(p.location, ST_Point($user_lng, $user_lat)) as distance
FROM profiles p
JOIN services s ON s.provider_id = p.id
LEFT JOIN reviews r ON r.provider_id = p.id
WHERE s.category_id = $category_id
  AND s.is_active = true
  AND ST_DWithin(p.location, ST_Point($user_lng, $user_lat), $radius_meters)
  AND (
    -- Provider está aberto agora
    EXISTS (
      SELECT 1 FROM availability_schedules avs
      WHERE avs.provider_id = p.id
        AND avs.day_of_week = EXTRACT(DOW FROM NOW())
        AND NOW()::time BETWEEN avs.start_time AND avs.end_time
        AND avs.is_active = true
    )
    OR $show_closed = true
  )
GROUP BY p.id, s.id
HAVING AVG(r.rating) >= $min_rating
ORDER BY 
  CASE $sort_by
    WHEN 'rating' THEN AVG(r.rating)
    WHEN 'distance' THEN distance
    WHEN 'reviews' THEN COUNT(r.id)
  END DESC
LIMIT 20;
```

**Filtros:**
- ✅ Categoria de serviço
- ✅ Raio de distância (1km, 5km, 10km, 20km)
- ✅ Avaliação mínima (3★, 4★, 5★)
- ✅ Faixa de preço (€, €€, €€€)
- ✅ Status: Aberto agora / Todos
- ✅ Disponibilidade: Hoje, Amanhã, Esta semana
- ✅ Tipo de atendimento: Presencial, Domicílio, Ambos
- ✅ Verificado (selo de confiança)

**Ordenação:**
- Relevância (algoritmo)
- Distância (mais próximo)
- Avaliação (melhor avaliado)
- Preço (menor/maior)
- Mais recente

### 2. 📱 Perfil do Provider

#### 2.1 Visualização do Perfil
```
┌─────────────────────────────────────────────────────┐
│  [Avatar] João Silva - Eletricista                  │
│  ⭐ 4.8 (127 avaliações) | 📍 2.3km | ✅ Verificado │
│  🟢 Aberto até 18h                                  │
│                                                     │
│  [📞 Ligar] [💬 Chat] [📅 Agendar] [⭐ Seguir]    │
│                                                     │
│  ─── Sobre ───                                      │
│  Eletricista com 15 anos de experiência...         │
│                                                     │
│  ─── Serviços ───                                   │
│  • Instalação elétrica - €50/h                     │
│  • Manutenção - €40/h                              │
│  • Emergência 24h - €80/h                          │
│                                                     │
│  ─── Portfólio (Posts) ───                         │
│  [Foto] [Foto] [Vídeo] [Foto]                      │
│                                                     │
│  ─── Avaliações ───                                 │
│  ⭐⭐⭐⭐⭐ Maria S. - "Excelente trabalho!"        │
│  [Foto] [Foto]                                      │
│                                                     │
│  ⭐⭐⭐⭐ Pedro L. - "Pontual e profissional"       │
└─────────────────────────────────────────────────────┘
```

#### 2.2 Posts do Provider (Portfólio)
```typescript
interface ProviderPost {
  id: string;
  provider_id: string;
  type: 'image' | 'video' | 'carousel';
  media_urls: string[];
  caption: string;
  service_id?: string; // Link para serviço específico
  tags: string[]; // Ex: ['instalação', 'residencial']
  likes_count: number;
  comments_count: number;
  created_at: Date;
}
```

**Funcionalidades:**
- Ver posts em grid ou lista
- Curtir posts
- Comentar (apenas clientes que já usaram o serviço)
- Compartilhar
- Filtrar por tipo de serviço

### 3. 📅 Agendamento

#### 3.1 Fluxo de Agendamento

**Passo 1: Escolher Serviço**
```
┌─────────────────────────────────────┐
│  Selecione o serviço:               │
│  ○ Instalação elétrica - €50/h     │
│  ○ Manutenção - €40/h               │
│  ● Emergência 24h - €80/h           │
└─────────────────────────────────────┘
```

**Passo 2: Escolher Data/Hora**

*Se agenda PÚBLICA:*
```
┌─────────────────────────────────────┐
│  Horários disponíveis:              │
│  Hoje (15/01)                       │
│  ○ 14:00 - 15:00                    │
│  ○ 16:00 - 17:00                    │
│                                     │
│  Amanhã (16/01)                     │
│  ○ 09:00 - 10:00                    │
│  ○ 10:00 - 11:00                    │
│  ○ 14:00 - 15:00                    │
└─────────────────────────────────────┘
```

*Se agenda PRIVADA:*
```
┌─────────────────────────────────────┐
│  Quando você precisa?               │
│  📅 [Selecionar data]               │
│  🕐 [Selecionar hora]               │
│                                     │
│  ⚠️ Sujeito a confirmação do        │
│     prestador                       │
└─────────────────────────────────────┘
```

**Passo 3: Detalhes**
```
┌─────────────────────────────────────┐
│  Endereço:                          │
│  [Rua, número, complemento]         │
│                                     │
│  Observações:                       │
│  [Descreva o problema/serviço]      │
│                                     │
│  Estimativa: €80 (1h)               │
│  Taxa de serviço: €8                │
│  Total: €88                         │
│                                     │
│  [Confirmar Agendamento]            │
└─────────────────────────────────────┘
```

#### 3.2 Estados do Agendamento

```typescript
type BookingStatus = 
  | 'pending'    // Aguardando confirmação do provider
  | 'confirmed'  // Provider confirmou
  | 'in_progress' // Serviço em andamento
  | 'completed'  // Serviço concluído
  | 'cancelled'  // Cancelado (por cliente ou provider)
  | 'no_show';   // Cliente não compareceu

interface Booking {
  id: string;
  client_id: string;
  provider_id: string;
  service_id: string;
  start_time: Date;
  end_time: Date;
  status: BookingStatus;
  address: {
    street: string;
    number: string;
    complement?: string;
    postal_code: string;
    city: string;
  };
  notes: string;
  total_price: number;
  service_fee: number; // Comissão da plataforma
  cancellation_reason?: string;
  cancelled_by?: 'client' | 'provider';
  created_at: Date;
  updated_at: Date;
}
```

### 4. ⭐ Sistema de Avaliações

#### 4.1 Criar Avaliação (Após serviço completado)

```
┌─────────────────────────────────────────────┐
│  Como foi o serviço de João Silva?          │
│                                             │
│  Qualidade do serviço:                      │
│  ⭐⭐⭐⭐⭐                                  │
│                                             │
│  Pontualidade:                              │
│  ⭐⭐⭐⭐⭐                                  │
│                                             │
│  Comunicação:                               │
│  ⭐⭐⭐⭐⭐                                  │
│                                             │
│  Custo-benefício:                           │
│  ⭐⭐⭐⭐⭐                                  │
│                                             │
│  Comentário:                                │
│  [Conte como foi sua experiência...]        │
│                                             │
│  Adicionar fotos:                           │
│  [📷] [📷] [📷]                             │
│                                             │
│  [Publicar Avaliação]                       │
└─────────────────────────────────────────────┘
```

**Regras:**
- ✅ Apenas clientes que completaram serviço podem avaliar
- ✅ Uma avaliação por booking
- ✅ Avaliação pode ser editada em até 7 dias
- ✅ Provider pode responder avaliação
- ✅ Fotos são opcionais (máx 5 fotos)
- ✅ Avaliações são públicas e verificadas

```typescript
interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  provider_id: string;
  
  // Ratings detalhados
  quality_rating: number; // 1-5
  punctuality_rating: number; // 1-5
  communication_rating: number; // 1-5
  value_rating: number; // 1-5
  overall_rating: number; // Média dos 4
  
  comment: string;
  images: string[];
  
  // Resposta do provider
  provider_response?: string;
  provider_response_at?: Date;
  
  // Verificação
  is_verified: boolean; // Booking foi completado
  
  created_at: Date;
  updated_at: Date;
}
```

### 5. 👥 Sistema Social

#### 5.1 Seguir Providers
```typescript
interface Follow {
  follower_id: string; // Cliente
  following_id: string; // Provider
  created_at: Date;
}
```

**Benefícios de seguir:**
- Ver posts do provider no feed
- Receber notificações de promoções
- Acesso prioritário a agenda
- Descontos exclusivos

#### 5.2 Recomendações

**Recomendar para amigos:**
```
┌─────────────────────────────────────┐
│  Recomendar João Silva para:        │
│  🔍 [Buscar amigos...]              │
│                                     │
│  Amigos selecionados:               │
│  ✓ Maria Santos                     │
│  ✓ Pedro Oliveira                   │
│                                     │
│  Mensagem (opcional):               │
│  [Esse eletricista é ótimo!]        │
│                                     │
│  [Enviar Recomendação]              │
└─────────────────────────────────────┘
```

**Fixar recomendações no perfil:**
```typescript
interface ProfileRecommendation {
  user_id: string;
  provider_id: string;
  is_pinned: boolean; // Aparece no topo do perfil
  recommendation_text?: string;
  created_at: Date;
}
```

**Visualização no perfil:**
```
┌─────────────────────────────────────┐
│  Maria Santos                       │
│  📍 Lisboa                          │
│                                     │
│  ⭐ Minhas Recomendações            │
│  ┌─────────────────────────────┐   │
│  │ 🔧 João Silva - Eletricista │   │
│  │ ⭐ 4.8 | "Muito profissional"│   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 🚰 Ana Costa - Encanadora   │   │
│  │ ⭐ 5.0 | "Resolveu rápido!" │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 6. 💬 Chat com Provider

```typescript
interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  media_url?: string;
  booking_id?: string; // Link para agendamento
  is_read: boolean;
  created_at: Date;
}

interface Conversation {
  id: string;
  client_id: string;
  provider_id: string;
  last_message: string;
  last_message_at: Date;
  unread_count: number;
  created_at: Date;
}
```

**Funcionalidades:**
- Mensagens em tempo real (Supabase Realtime)
- Enviar fotos do problema
- Compartilhar localização
- Criar agendamento direto do chat
- Histórico de conversas

### 7. 📊 Meu Perfil (Cliente)

```
┌─────────────────────────────────────────┐
│  [Avatar] Maria Santos                  │
│  📧 maria@email.com                     │
│  📱 +351 912 345 678                    │
│  📍 Lisboa, Portugal                    │
│                                         │
│  [Editar Perfil]                        │
│                                         │
│  ─── Meus Agendamentos ───              │
│  • Hoje: Eletricista às 14h            │
│  • Amanhã: Encanador às 10h            │
│                                         │
│  ─── Histórico ───                      │
│  • 15 serviços completados             │
│  • 12 avaliações feitas                │
│                                         │
│  ─── Seguindo ───                       │
│  • 8 prestadores                       │
│                                         │
│  ─── Minhas Recomendações Fixadas ───   │
│  • João Silva - Eletricista            │
│  • Ana Costa - Encanadora              │
└─────────────────────────────────────────┘
```

### 8. 🔔 Notificações

```typescript
type NotificationType = 
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_reminder' // 1h antes
  | 'provider_message'
  | 'provider_promotion'
  | 'review_request'
  | 'recommendation_received';

interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: {
    booking_id?: string;
    provider_id?: string;
    conversation_id?: string;
  };
  is_read: boolean;
  created_at: Date;
}
```

---

## 🗄️ Tabelas Necessárias (Novas)

### 1. provider_posts
```sql
CREATE TABLE provider_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('image', 'video', 'carousel')),
  media_urls TEXT[],
  caption TEXT,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  tags TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_provider_posts_provider ON provider_posts(provider_id);
CREATE INDEX idx_provider_posts_created ON provider_posts(created_at DESC);
```

### 2. post_likes
```sql
CREATE TABLE post_likes (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES provider_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);
```

### 3. post_comments
```sql
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES provider_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. profile_recommendations
```sql
CREATE TABLE profile_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT false,
  recommendation_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider_id)
);
```

### 5. conversations
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, provider_id)
);
```

### 6. chat_messages
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  media_url TEXT,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id, created_at DESC);
```

### 7. provider_status
```sql
CREATE TABLE provider_status (
  provider_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_open BOOLEAN DEFAULT false,
  status_message TEXT, -- Ex: "Atendendo emergências"
  auto_close_at TIMESTAMPTZ, -- Fecha automaticamente
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎨 UI/UX Considerations

### Mobile-First
- Busca rápida na homepage
- Botões grandes para ações principais
- Swipe para ver mais providers
- Filtros em bottom sheet

### Acessibilidade
- Alto contraste
- Textos legíveis (min 16px)
- Labels em todos os inputs
- Navegação por teclado

### Performance
- Lazy loading de imagens
- Infinite scroll nos resultados
- Cache de buscas recentes
- Offline mode (ver agendamentos salvos)

---

## 📈 Métricas de Sucesso

- **Tempo médio de busca:** < 30 segundos
- **Taxa de conversão (busca → agendamento):** > 15%
- **Taxa de conclusão de agendamento:** > 80%
- **NPS (Net Promoter Score):** > 50
- **Retenção 30 dias:** > 40%

---

**Próximo:** [02-role-provider.md](./02-role-provider.md)
