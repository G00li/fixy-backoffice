# ⚙️ System Configuration - Fixy Platform

## 📋 Visão Geral

Este documento detalha todas as configurações técnicas necessárias para o funcionamento completo da plataforma Fixy.

---

## 🔧 Configurações do Supabase

### 1. Variáveis de Ambiente

**fixy/.env.local (Frontend Web)**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://cvucdcgsoufrqubtftmg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Fixy

# Features
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_POSTS=true
NEXT_PUBLIC_ENABLE_PROMOTIONS=true

# Maps (Google Maps ou Mapbox)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here

# Analytics (opcional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**fixy-backoffice/.env.local (Backoffice)**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://cvucdcgsoufrqubtftmg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Service Role (apenas server-side)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Fixy Backoffice

# Admin
NEXT_PUBLIC_REQUIRE_2FA=true
```

### 2. Storage Buckets

```sql
-- Criar buckets no Supabase
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('post-images', 'post-images', true),
  ('post-videos', 'post-videos', true),
  ('review-images', 'review-images', true),
  ('ticket-attachments', 'ticket-attachments', false),
  ('verification-documents', 'verification-documents', false);

-- Políticas de storage para avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Políticas para post-images
CREATE POLICY "Post images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');

CREATE POLICY "Providers can upload post images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'post-images' AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'provider'
    )
  );
```

### 3. Realtime Configuration

```sql
-- Habilitar realtime para tabelas específicas
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE provider_status;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
```

---

## 🔐 Autenticação e Segurança

### 1. Auth Configuration (Supabase Dashboard)

```json
{
  "site_url": "https://fixy.com",
  "redirect_urls": [
    "http://localhost:3000/**",
    "https://fixy.com/**",
    "https://admin.fixy.com/**"
  ],
  "jwt_expiry": 3600,
  "refresh_token_rotation_enabled": true,
  "security_update_password_require_reauthentication": true,
  "password_min_length": 8,
  "password_required_characters": ["lower", "upper", "number"]
}
```

### 2. OAuth Providers (Opcional)

```typescript
// Google OAuth
{
  "client_id": "your_google_client_id",
  "client_secret": "your_google_client_secret",
  "redirect_uri": "https://cvucdcgsoufrqubtftmg.supabase.co/auth/v1/callback"
}

// Facebook OAuth
{
  "client_id": "your_facebook_app_id",
  "client_secret": "your_facebook_app_secret",
  "redirect_uri": "https://cvucdcgsoufrqubtftmg.supabase.co/auth/v1/callback"
}
```

### 3. Rate Limiting

```sql
-- Criar tabela para rate limiting
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rate_limits_user ON rate_limits(user_id, endpoint, window_start);
CREATE INDEX idx_rate_limits_ip ON rate_limits(ip_address, endpoint, window_start);

-- Function para verificar rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_endpoint TEXT,
  p_max_requests INTEGER,
  p_window_minutes INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM rate_limits
  WHERE (user_id = auth.uid() OR ip_address = inet_client_addr())
    AND endpoint = p_endpoint
    AND window_start > NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  RETURN v_count < p_max_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 📧 Notificações e Email

### 1. Email Templates (Supabase Auth)

**Confirmação de Email**
```html
<h2>Bem-vindo ao Fixy!</h2>
<p>Clique no link abaixo para confirmar seu email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar Email</a></p>
```

**Redefinir Senha**
```html
<h2>Redefinir Senha</h2>
<p>Clique no link abaixo para redefinir sua senha:</p>
<p><a href="{{ .ConfirmationURL }}">Redefinir Senha</a></p>
<p>Se você não solicitou isso, ignore este email.</p>
```

### 2. Notificações Push (Futuro - Mobile)

```typescript
// Firebase Cloud Messaging Configuration
{
  "apiKey": "your_fcm_api_key",
  "authDomain": "fixy-app.firebaseapp.com",
  "projectId": "fixy-app",
  "storageBucket": "fixy-app.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:abcdef"
}
```

---

## 💳 Pagamentos (Futuro)

### 1. Stripe Configuration

```env
# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Produtos
STRIPE_PRODUCT_PRO_MONTHLY=price_...
STRIPE_PRODUCT_PRO_YEARLY=price_...
STRIPE_PRODUCT_BUSINESS_MONTHLY=price_...
STRIPE_PRODUCT_BUSINESS_YEARLY=price_...
```

### 2. Mercado Pago Configuration (Alternativa)

```env
# Mercado Pago
MERCADOPAGO_PUBLIC_KEY=APP_USR_...
MERCADOPAGO_ACCESS_TOKEN=APP_USR_...
MERCADOPAGO_WEBHOOK_SECRET=...
```

---

## 🗺️ Geolocalização

### 1. PostGIS Configuration

```sql
-- Já habilitado, mas verificar
CREATE EXTENSION IF NOT EXISTS postgis;

-- Função para calcular distância
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DOUBLE PRECISION,
  lng1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lng2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
BEGIN
  RETURN ST_Distance(
    ST_MakePoint(lng1, lat1)::geography,
    ST_MakePoint(lng2, lat2)::geography
  ) / 1000; -- Retorna em km
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### 2. Geocoding API

```typescript
// Google Geocoding API
const geocodeAddress = async (address: string) => {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
  );
  const data = await response.json();
  return data.results[0]?.geometry.location;
};
```

---

## 📊 Analytics e Monitoring

### 1. Google Analytics 4

```typescript
// lib/analytics.ts
export const pageview = (url: string) => {
  window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label: string;
  value?: number;
}) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
```

### 2. Sentry (Error Tracking)

```typescript
// sentry.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Não enviar erros de desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});
```

### 3. Logging

```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

// Uso
logger.info({ userId: '123' }, 'User logged in');
logger.error({ error }, 'Payment failed');
```

---

## 🔄 Cron Jobs e Background Tasks

### 1. Supabase Edge Functions (Cron)

```typescript
// supabase/functions/daily-cleanup/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Limpar tickets antigos resolvidos
  await supabase
    .from('support_tickets')
    .delete()
    .eq('status', 'closed')
    .lt('closed_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

  // Fechar automaticamente providers
  await supabase
    .from('provider_status')
    .update({ is_open: false, status_type: 'closed' })
    .lt('auto_close_at', new Date().toISOString())
    .eq('is_open', true);

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

**Configurar Cron:**
```bash
# No Supabase Dashboard > Edge Functions > Cron
# Executar daily-cleanup todos os dias às 3h
0 3 * * * daily-cleanup
```

### 2. Tarefas Agendadas

```sql
-- Criar tabela de scheduled_tasks
CREATE TABLE scheduled_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type TEXT NOT NULL,
  payload JSONB,
  scheduled_for TIMESTAMPTZ NOT NULL,
  executed_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed')) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scheduled_tasks_pending ON scheduled_tasks(scheduled_for) 
  WHERE status = 'pending';
```

---

## 🔍 Search Configuration

### 1. Full-Text Search (PostgreSQL)

```sql
-- Adicionar coluna de busca em profiles
ALTER TABLE profiles ADD COLUMN search_vector tsvector;

-- Atualizar search_vector automaticamente
CREATE OR REPLACE FUNCTION update_profile_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('portuguese', COALESCE(NEW.full_name, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.bio, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.location_text, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_search_vector
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_search_vector();

-- Criar índice GIN
CREATE INDEX idx_profiles_search ON profiles USING GIN(search_vector);

-- Buscar providers
SELECT * FROM profiles
WHERE search_vector @@ to_tsquery('portuguese', 'eletricista & lisboa')
ORDER BY ts_rank(search_vector, to_tsquery('portuguese', 'eletricista & lisboa')) DESC;
```

### 2. Elasticsearch (Futuro - Opcional)

```typescript
// Para buscas mais avançadas
import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY
  }
});

// Indexar provider
await client.index({
  index: 'providers',
  id: provider.id,
  document: {
    name: provider.full_name,
    bio: provider.bio,
    location: provider.location_text,
    services: provider.services.map(s => s.title),
    rating: provider.avg_rating,
  }
});
```

---

## 🛡️ Backup e Disaster Recovery

### 1. Backup Automático (Supabase)

```bash
# Supabase faz backup automático diário
# Configurar retenção no Dashboard:
# - Daily backups: 7 dias
# - Weekly backups: 4 semanas
# - Monthly backups: 3 meses
```

### 2. Backup Manual

```bash
# Backup do banco de dados
pg_dump -h db.cvucdcgsoufrqubtftmg.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f backup_$(date +%Y%m%d).dump

# Restore
pg_restore -h db.cvucdcgsoufrqubtftmg.supabase.co \
  -U postgres \
  -d postgres \
  backup_20260101.dump
```

---

## 📱 Mobile App Configuration (Futuro)

### 1. Deep Links

```json
{
  "expo": {
    "scheme": "fixy",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "https",
              "host": "fixy.com",
              "pathPrefix": "/provider"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "ios": {
      "associatedDomains": ["applinks:fixy.com"]
    }
  }
}
```

---

## 🔧 Development Tools

### 1. Docker Compose (Local Development)

```yaml
version: '3.8'
services:
  postgres:
    image: supabase/postgres:15.1.0.117
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

  supabase-studio:
    image: supabase/studio:latest
    ports:
      - "3000:3000"
    environment:
      SUPABASE_URL: http://localhost:54321
      SUPABASE_ANON_KEY: your_anon_key

volumes:
  postgres_data:
```

---

**Próximo:** [08-packages-recommendations.md](./08-packages-recommendations.md)
