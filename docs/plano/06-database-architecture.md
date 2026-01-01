# 🗄️ Database Architecture - Fixy Platform

## 📋 Visão Geral

Este documento detalha a arquitetura completa do banco de dados PostgreSQL + PostGIS + Supabase, incluindo todas as tabelas necessárias para implementar as funcionalidades descritas nos documentos de roles.

---

## 🏗️ Arquitetura Geral

```
┌─────────────────────────────────────────────────────┐
│                  SUPABASE                            │
├─────────────────────────────────────────────────────┤
│  PostgreSQL 17 + PostGIS                            │
│  - Row Level Security (RLS)                         │
│  - Realtime Subscriptions                           │
│  - Storage (avatars, images, videos)                │
│  - Edge Functions                                   │
│  - Auth (JWT + OAuth)                               │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Schema Completo

### 1. Core Tables (Já Existentes)

#### profiles
```sql
-- Já existe, mas precisa de ajustes
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_media JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
```

#### user_roles
```sql
-- Já existe e está correto
-- Mantém a estrutura RBAC atual
```

#### services
```sql
-- Já existe, adicionar campos
ALTER TABLE services ADD COLUMN IF NOT EXISTS pricing_model TEXT 
  CHECK (pricing_model IN ('hourly', 'fixed', 'daily', 'custom')) DEFAULT 'hourly';
ALTER TABLE services ADD COLUMN IF NOT EXISTS duration_max INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT false;
```

#### bookings
```sql
-- Já existe, adicionar campos
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS address JSONB;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_fee NUMERIC DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_by TEXT 
  CHECK (cancelled_by IN ('client', 'provider'));

-- Adicionar novo status
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'));
```

#### reviews
```sql
-- Já existe, adicionar ratings detalhados
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 5);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS provider_response TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS provider_response_at TIMESTAMPTZ;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT true;

-- Atualizar overall_rating automaticamente
CREATE OR REPLACE FUNCTION calculate_overall_rating()
RETURNS TRIGGER AS $$
BEGIN
  NEW.overall_rating := ROUND((
    COALESCE(NEW.quality_rating, NEW.rating) + 
    COALESCE(NEW.punctuality_rating, NEW.rating) + 
    COALESCE(NEW.communication_rating, NEW.rating) + 
    COALESCE(NEW.value_rating, NEW.rating)
  ) / 4.0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_overall_rating
  BEFORE INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION calculate_overall_rating();
```

---

### 2. Provider Features (Novas Tabelas)

#### provider_settings

```sql
CREATE TABLE provider_settings (
  provider_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Tipo de prestador
  business_type TEXT CHECK (business_type IN ('individual', 'small_business', 'enterprise')) DEFAULT 'individual',
  
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

CREATE INDEX idx_provider_settings_verified ON provider_settings(is_verified);
```

#### provider_posts
```sql
CREATE TABLE provider_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  type TEXT CHECK (type IN ('image', 'video', 'carousel')) DEFAULT 'image',
  media_urls TEXT[] NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  tags TEXT[],
  
  -- Engajamento
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- Moderação
  is_active BOOLEAN DEFAULT true,
  moderation_status TEXT CHECK (moderation_status IN ('pending', 'approved', 'rejected')) DEFAULT 'approved',
  moderation_reason TEXT,
  moderated_by UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMPTZ,
  
  -- SEO
  alt_text TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_provider_posts_provider ON provider_posts(provider_id, created_at DESC);
CREATE INDEX idx_provider_posts_active ON provider_posts(is_active, created_at DESC);
CREATE INDEX idx_provider_posts_moderation ON provider_posts(moderation_status) WHERE moderation_status = 'pending';
```

#### post_likes
```sql
CREATE TABLE post_likes (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES provider_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

CREATE INDEX idx_post_likes_post ON post_likes(post_id);
```

#### post_comments
```sql
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES provider_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_post_comments_post ON post_comments(post_id, created_at DESC);
```

#### provider_status
```sql
CREATE TABLE provider_status (
  provider_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_open BOOLEAN DEFAULT false,
  status_type TEXT CHECK (status_type IN ('open', 'closed', 'busy', 'emergency_only')) DEFAULT 'closed',
  status_message TEXT,
  auto_close_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_provider_status_open ON provider_status(is_open, status_type);
```

#### blocked_time_slots
```sql
CREATE TABLE blocked_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reason TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX idx_blocked_slots_provider_time ON blocked_time_slots(provider_id, start_time, end_time);
```

#### service_extras
```sql
CREATE TABLE service_extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_extras_service ON service_extras(service_id, display_order);
```

---

### 3. Social Features (Novas Tabelas)

#### profile_recommendations
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

CREATE INDEX idx_recommendations_user ON profile_recommendations(user_id, is_pinned DESC);
CREATE INDEX idx_recommendations_provider ON profile_recommendations(provider_id);
```

#### conversations
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

CREATE INDEX idx_conversations_client ON conversations(client_id, last_message_at DESC);
CREATE INDEX idx_conversations_provider ON conversations(provider_id, last_message_at DESC);
```

#### chat_messages
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
CREATE INDEX idx_chat_messages_unread ON chat_messages(receiver_id, is_read) WHERE is_read = false;

-- Trigger para atualizar last_message na conversation
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message = NEW.message,
      last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();
```

---

### 4. Support System (Novas Tabelas)

#### support_tickets
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
CREATE INDEX idx_tickets_number ON support_tickets(ticket_number);

-- Função para gerar ticket_number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'TKT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('ticket_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS ticket_number_seq;

CREATE TRIGGER set_ticket_number
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  WHEN (NEW.ticket_number IS NULL)
  EXECUTE FUNCTION generate_ticket_number();
```

#### ticket_messages
```sql
CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_type TEXT CHECK (sender_type IN ('user', 'support', 'system')),
  message TEXT NOT NULL,
  attachments TEXT[],
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id, created_at);
```

#### knowledge_base_articles
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
CREATE INDEX idx_kb_public ON knowledge_base_articles(is_public) WHERE is_public = true;
CREATE INDEX idx_kb_search ON knowledge_base_articles USING gin(to_tsvector('portuguese', title || ' ' || content));
```

#### quick_replies
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

CREATE INDEX idx_quick_replies_category ON quick_replies(category);
```

---

### 5. Admin Features (Novas Tabelas)

#### marketing_campaigns
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
  
  budget NUMERIC NOT NULL CHECK (budget >= 0),
  spent NUMERIC DEFAULT 0 CHECK (spent >= 0),
  
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  roi NUMERIC DEFAULT 0,
  
  status TEXT CHECK (status IN ('draft', 'active', 'paused', 'completed')) DEFAULT 'draft',
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_status ON marketing_campaigns(status, start_date);
CREATE INDEX idx_campaigns_dates ON marketing_campaigns(start_date, end_date);
```

#### moderation_queue
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
  
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'escalated')) DEFAULT 'pending',
  moderated_by UUID REFERENCES auth.users(id),
  moderation_note TEXT,
  moderated_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_moderation_status ON moderation_queue(status) WHERE status = 'pending';
CREATE INDEX idx_moderation_content ON moderation_queue(content_type, content_id);
```

---

### 6. Super Admin Features (Novas Tabelas)

#### seasonal_campaigns
```sql
CREATE TABLE seasonal_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  
  offers JSONB NOT NULL,
  
  max_budget NUMERIC NOT NULL CHECK (max_budget >= 0),
  max_participants INTEGER,
  
  participants INTEGER DEFAULT 0,
  revenue_impact NUMERIC DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  
  status TEXT CHECK (status IN ('scheduled', 'active', 'completed')) DEFAULT 'scheduled',
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_seasonal_campaigns_dates ON seasonal_campaigns(start_date, end_date);
CREATE INDEX idx_seasonal_campaigns_status ON seasonal_campaigns(status);
```

#### system_config
```sql
CREATE TABLE system_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir configurações padrão
INSERT INTO system_config (key, value, description) VALUES
  ('platform_name', '"Fixy"', 'Nome da plataforma'),
  ('default_commission_rate', '0.15', 'Taxa de comissão padrão (15%)'),
  ('max_file_size_mb', '10', 'Tamanho máximo de arquivo em MB'),
  ('require_2fa_for_admins', 'true', 'Requer 2FA para admins'),
  ('maintenance_mode', 'false', 'Modo de manutenção')
ON CONFLICT (key) DO NOTHING;
```

#### feature_flags
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

-- Inserir feature flags iniciais
INSERT INTO feature_flags (name, description, is_enabled) VALUES
  ('chat_enabled', 'Sistema de chat em tempo real', true),
  ('posts_enabled', 'Sistema de posts para providers', true),
  ('promotions_enabled', 'Sistema de promoções', true),
  ('ai_moderation', 'Moderação automática com IA', false)
ON CONFLICT (name) DO NOTHING;
```

---

## 🔐 Row Level Security (RLS)

### Políticas para Novas Tabelas

```sql
-- provider_posts
ALTER TABLE provider_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can manage their own posts"
  ON provider_posts FOR ALL
  USING (provider_id = auth.uid());

CREATE POLICY "Everyone can view active posts"
  ON provider_posts FOR SELECT
  USING (is_active = true AND moderation_status = 'approved');

-- conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (client_id = auth.uid() OR provider_id = auth.uid());

-- chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON chat_messages FOR SELECT
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- support_tickets
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tickets"
  ON support_tickets FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Support can view assigned tickets"
  ON support_tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('support', 'admin', 'super_admin')
    )
  );
```

---

## 📈 Índices para Performance

```sql
-- Busca de providers por localização
CREATE INDEX idx_profiles_location ON profiles USING GIST(location);

-- Busca de serviços
CREATE INDEX idx_services_active ON services(is_active, category_id);
CREATE INDEX idx_services_provider ON services(provider_id, is_active);

-- Agendamentos
CREATE INDEX idx_bookings_dates ON bookings(start_time, end_time);
CREATE INDEX idx_bookings_provider_status ON bookings(provider_id, status, start_time);
CREATE INDEX idx_bookings_client_status ON bookings(client_id, status, start_time);

-- Avaliações
CREATE INDEX idx_reviews_provider_rating ON reviews(provider_id, overall_rating DESC);

-- Posts
CREATE INDEX idx_posts_trending ON provider_posts(created_at DESC, likes_count DESC, views_count DESC);
```

---

## 🔄 Triggers e Functions

### Atualizar contadores automaticamente

```sql
-- Atualizar likes_count em provider_posts
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE provider_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE provider_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_likes_count
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

-- Atualizar comments_count em provider_posts
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE provider_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE provider_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comments_count
  AFTER INSERT OR DELETE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();
```

---

## 📊 Views Úteis

```sql
-- View de providers com estatísticas
CREATE OR REPLACE VIEW provider_stats AS
SELECT 
  p.id,
  p.full_name,
  p.avatar_url,
  p.location_text,
  COUNT(DISTINCT s.id) as total_services,
  COUNT(DISTINCT b.id) as total_bookings,
  COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'completed') as completed_bookings,
  AVG(r.overall_rating) as avg_rating,
  COUNT(DISTINCT r.id) as total_reviews,
  COUNT(DISTINCT f.follower_id) as followers_count,
  ps.is_open,
  ps.status_type
FROM profiles p
LEFT JOIN services s ON s.provider_id = p.id AND s.is_active = true
LEFT JOIN bookings b ON b.provider_id = p.id
LEFT JOIN reviews r ON r.provider_id = p.id
LEFT JOIN follows f ON f.following_id = p.id
LEFT JOIN provider_status ps ON ps.provider_id = p.id
WHERE EXISTS (
  SELECT 1 FROM user_roles ur
  WHERE ur.user_id = p.id AND ur.role = 'provider'
)
GROUP BY p.id, ps.is_open, ps.status_type;
```

---

## 🔄 Migration Script Completo

Ver arquivo: `fixy-supabase/supabase/migrations/20260101000000_complete_platform_schema.sql`

---

**Próximo:** [07-system-configuration.md](./07-system-configuration.md)
