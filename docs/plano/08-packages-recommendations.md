# 📦 Packages & Solutions Recommendations

## 📋 Visão Geral

Este documento recomenda packages, bibliotecas e soluções para implementar todas as funcionalidades da plataforma Fixy de forma eficiente e escalável.

---

## 🎨 Frontend (Next.js + React)

### 1. UI Components & Styling

```json
{
  "dependencies": {
    // UI Components
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-dialog": "^1.1.16",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-select": "^2.1.16",
    "@radix-ui/react-tabs": "^1.1.16",
    "@radix-ui/react-toast": "^1.2.16",
    "@radix-ui/react-tooltip": "^1.1.16",
    
    // Styling
    "tailwindcss": "^4.1.17",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.4.0",
    
    // Icons
    "lucide-react": "^0.554.0",
    
    // Animations
    "framer-motion": "^12.23.24"
  }
}
```

**Recomendação:** Usar Radix UI como base + shadcn/ui para componentes prontos e acessíveis.

### 2. Forms & Validation

```json
{
  "dependencies": {
    "react-hook-form": "^7.54.2",
    "zod": "^3.24.1",
    "@hookform/resolvers": "^3.9.1",
    "react-dropzone": "^14.3.8"
  }
}
```

**Exemplo de uso:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema),
});
```

### 3. State Management

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.90.11",
    "@tanstack/react-query-devtools": "^5.91.1",
    "zustand": "^5.0.2"
  }
}
```

**Recomendação:**
- **React Query** para estado do servidor (cache, refetch, mutations)
- **Zustand** para estado global da UI (sidebar, modals, theme)

### 4. Date & Time

```json
{
  "dependencies": {
    "date-fns": "^4.1.0",
    "react-day-picker": "^9.4.3"
  }
}
```

### 5. Rich Text Editor (Para posts)

```json
{
  "dependencies": {
    "@tiptap/react": "^2.12.2",
    "@tiptap/starter-kit": "^2.12.2",
    "@tiptap/extension-image": "^2.12.2",
    "@tiptap/extension-link": "^2.12.2"
  }
}
```

**Alternativa:** Lexical (Facebook) ou Slate

### 6. Image Upload & Optimization

```json
{
  "dependencies": {
    "react-dropzone": "^14.3.8",
    "react-image-crop": "^11.0.7",
    "sharp": "^0.33.5"
  }
}
```

### 7. Charts & Visualizations

```json
{
  "dependencies": {
    "recharts": "^2.15.0",
    "react-apexcharts": "^1.8.0",
    "apexcharts": "^4.7.0"
  }
}
```

**Recomendação:** Recharts para simplicidade, ApexCharts para dashboards complexos.

### 8. Maps

```json
{
  "dependencies": {
    "@react-google-maps/api": "^2.20.3",
    // OU
    "react-map-gl": "^7.1.7",
    "mapbox-gl": "^3.9.2"
  }
}
```

**Recomendação:** Google Maps para Portugal (melhor cobertura) ou Mapbox (mais customizável).

### 9. Notifications

```json
{
  "dependencies": {
    "react-hot-toast": "^2.6.0",
    // OU
    "sonner": "^1.7.3"
  }
}
```

### 10. Calendar & Scheduling

```json
{
  "dependencies": {
    "@fullcalendar/react": "^6.1.19",
    "@fullcalendar/daygrid": "^6.1.19",
    "@fullcalendar/timegrid": "^6.1.19",
    "@fullcalendar/interaction": "^6.1.19"
  }
}
```

---

## 🔐 Authentication & Security

```json
{
  "dependencies": {
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.89.0",
    "jose": "^5.9.6"
  }
}
```

**2FA (Futuro):**
```json
{
  "dependencies": {
    "speakeasy": "^2.0.0",
    "qrcode": "^1.5.4"
  }
}
```

---

## 💬 Real-time & Chat

### 1. Supabase Realtime (Recomendado)

```typescript
// Já incluído no @supabase/supabase-js
const channel = supabase
  .channel('chat-room')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages',
    filter: `conversation_id=eq.${conversationId}`
  }, (payload) => {
    console.log('New message:', payload.new);
  })
  .subscribe();
```

### 2. Alternativas

```json
{
  "dependencies": {
    // Socket.io (se precisar de mais controle)
    "socket.io-client": "^4.8.1",
    
    // Pusher (serviço gerenciado)
    "pusher-js": "^8.4.0-rc2"
  }
}
```

---

## 💳 Payments

### 1. Stripe

```json
{
  "dependencies": {
    "@stripe/stripe-js": "^5.2.0",
    "@stripe/react-stripe-js": "^3.1.0",
    "stripe": "^18.5.0"
  }
}
```

**Exemplo:**
```typescript
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

<Elements stripe={stripePromise}>
  <CheckoutForm />
</Elements>
```

### 2. Mercado Pago (Alternativa para Brasil/LATAM)

```json
{
  "dependencies": {
    "mercadopago": "^2.0.15"
  }
}
```

---

## 📊 Analytics & Monitoring

### 1. Analytics

```json
{
  "dependencies": {
    "@vercel/analytics": "^1.4.1",
    "react-ga4": "^2.1.0"
  }
}
```

### 2. Error Tracking

```json
{
  "dependencies": {
    "@sentry/nextjs": "^8.46.0"
  }
}
```

### 3. Performance Monitoring

```json
{
  "dependencies": {
    "web-vitals": "^4.2.4"
  }
}
```

---

## 🔍 Search & Filtering

### 1. Client-side Search

```json
{
  "dependencies": {
    "fuse.js": "^7.0.0",
    "match-sorter": "^8.0.0"
  }
}
```

### 2. Elasticsearch (Futuro)

```json
{
  "dependencies": {
    "@elastic/elasticsearch": "^8.17.0"
  }
}
```

### 3. Algolia (Alternativa gerenciada)

```json
{
  "dependencies": {
    "algoliasearch": "^5.18.0",
    "react-instantsearch": "^7.14.2"
  }
}
```

---

## 📱 Mobile (Flutter - Futuro)

### 1. Core Packages

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  flutter_riverpod: ^2.6.1
  
  # Supabase
  supabase_flutter: ^2.9.1
  
  # UI
  flutter_svg: ^2.0.10+1
  cached_network_image: ^3.4.1
  shimmer: ^3.0.0
  
  # Forms
  flutter_form_builder: ^9.4.2
  form_builder_validators: ^11.0.0
  
  # Maps
  google_maps_flutter: ^2.9.0
  geolocator: ^13.0.2
  
  # Image
  image_picker: ^1.1.2
  image_cropper: ^8.0.2
  
  # Chat
  flutter_chat_ui: ^1.6.15
  
  # Notifications
  firebase_messaging: ^15.1.6
  flutter_local_notifications: ^18.0.1
  
  # Calendar
  table_calendar: ^3.1.2
  
  # Utils
  intl: ^0.20.1
  url_launcher: ^6.3.1
  share_plus: ^10.1.3
```

---

## 🤖 AI & Machine Learning (Futuro)

### 1. Content Moderation

```json
{
  "dependencies": {
    "@google-cloud/vision": "^4.3.2",
    "openai": "^4.77.3"
  }
}
```

**Exemplo:**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Moderar texto
const moderation = await openai.moderations.create({
  input: postContent,
});

if (moderation.results[0].flagged) {
  // Conteúdo inapropriado
}
```

### 2. Recommendations

```json
{
  "dependencies": {
    "@tensorflow/tfjs": "^4.23.0",
    "@tensorflow/tfjs-node": "^4.23.0"
  }
}
```

### 3. Chatbot (Suporte)

```json
{
  "dependencies": {
    "openai": "^4.77.3",
    "langchain": "^0.3.12"
  }
}
```

---

## 📧 Email & SMS

### 1. Email

```json
{
  "dependencies": {
    // Resend (recomendado)
    "resend": "^4.0.1",
    
    // Alternativas
    "nodemailer": "^6.9.16",
    "@sendgrid/mail": "^8.1.4"
  }
}
```

**Exemplo com Resend:**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Fixy <noreply@fixy.com>',
  to: user.email,
  subject: 'Bem-vindo ao Fixy!',
  html: '<p>Olá...</p>',
});
```

### 2. SMS

```json
{
  "dependencies": {
    "twilio": "^5.3.5"
  }
}
```

---

## 🧪 Testing

### 1. Unit & Integration Tests

```json
{
  "devDependencies": {
    "vitest": "^2.1.8",
    "@testing-library/react": "^16.1.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/user-event": "^14.5.2"
  }
}
```

### 2. E2E Tests

```json
{
  "devDependencies": {
    "@playwright/test": "^1.49.1",
    // OU
    "cypress": "^13.17.0"
  }
}
```

### 3. API Testing

```json
{
  "devDependencies": {
    "supertest": "^7.0.0",
    "msw": "^2.7.0"
  }
}
```

---

## 🛠️ Development Tools

### 1. Code Quality

```json
{
  "devDependencies": {
    "eslint": "^9.39.1",
    "prettier": "^3.4.2",
    "husky": "^9.1.7",
    "lint-staged": "^15.2.11",
    "typescript": "^5.9.3"
  }
}
```

### 2. Documentation

```json
{
  "devDependencies": {
    "typedoc": "^0.27.5",
    "storybook": "^8.5.3"
  }
}
```

---

## 🚀 Deployment & Infrastructure

### 1. Hosting

**Recomendações:**
- **Frontend:** Vercel (Next.js otimizado)
- **Backend:** Supabase (já configurado)
- **CDN:** Cloudflare
- **Storage:** Supabase Storage ou AWS S3

### 2. CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

### 3. Monitoring

```json
{
  "dependencies": {
    "@vercel/speed-insights": "^1.1.0",
    "@sentry/nextjs": "^8.46.0"
  }
}
```

---

## 📦 Recommended Package.json (Complete)

```json
{
  "name": "fixy",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "test": "vitest",
    "test:e2e": "playwright test",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    // Core
    "next": "16.0.10",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    
    // Supabase
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.89.0",
    
    // UI
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-dialog": "^1.1.16",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-select": "^2.1.16",
    "@radix-ui/react-tabs": "^1.1.16",
    "@radix-ui/react-toast": "^1.2.16",
    "lucide-react": "^0.554.0",
    "framer-motion": "^12.23.24",
    
    // Styling
    "tailwindcss": "^4.1.17",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.4.0",
    
    // Forms
    "react-hook-form": "^7.54.2",
    "zod": "^3.24.1",
    "@hookform/resolvers": "^3.9.1",
    
    // State
    "@tanstack/react-query": "^5.90.11",
    "zustand": "^5.0.2",
    
    // Utils
    "date-fns": "^4.1.0",
    "react-hot-toast": "^2.6.0",
    
    // Maps
    "@react-google-maps/api": "^2.20.3",
    
    // Charts
    "recharts": "^2.15.0",
    
    // Rich Text
    "@tiptap/react": "^2.12.2",
    "@tiptap/starter-kit": "^2.12.2",
    
    // Calendar
    "@fullcalendar/react": "^6.1.19",
    "@fullcalendar/daygrid": "^6.1.19",
    "@fullcalendar/timegrid": "^6.1.19",
    
    // Payments
    "@stripe/stripe-js": "^5.2.0",
    "@stripe/react-stripe-js": "^3.1.0",
    
    // Analytics
    "@vercel/analytics": "^1.4.1",
    "@sentry/nextjs": "^8.46.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5.9.3",
    "eslint": "^9.39.1",
    "eslint-config-next": "16.0.10",
    "prettier": "^3.4.2",
    "vitest": "^2.1.8",
    "@playwright/test": "^1.49.1"
  }
}
```

---

## 🎯 Priority Implementation Order

### Phase 1: MVP (Mês 1-2)
1. ✅ Supabase + Auth
2. ✅ React Query + Zustand
3. ✅ Radix UI + Tailwind
4. ✅ React Hook Form + Zod
5. ✅ Date-fns

### Phase 2: Core Features (Mês 3-4)
6. Google Maps
7. FullCalendar
8. Tiptap (posts)
9. React Dropzone
10. Recharts

### Phase 3: Advanced (Mês 5-6)
11. Stripe
12. Sentry
13. Vercel Analytics
14. OpenAI (moderação)

### Phase 4: Mobile (Mês 7-9)
15. Flutter + Supabase Flutter
16. Firebase Messaging
17. Google Maps Flutter

---

## 💡 Best Practices

1. **Sempre prefira packages mantidos ativamente**
2. **Verifique bundle size** (use bundlephobia.com)
3. **Leia a documentação** antes de implementar
4. **Teste em produção** antes de escalar
5. **Monitore performance** com Lighthouse
6. **Mantenha dependencies atualizadas** (Dependabot)

---

**Fim da Documentação** 🎉

Todos os documentos foram criados com sucesso em `fixy-backoffice/docs/plano/`!
