# 🚀 Provider Specialties API Documentation

API endpoints para gestão de especialidades, portfolio e certificações de providers.

## 📋 Índice

- [Categorias](#categorias)
- [Especialidades do Provider](#especialidades-do-provider)
- [Portfolio](#portfolio)
- [Certificações](#certificações)
- [Busca e Perfil](#busca-e-perfil)

---

## 🏷️ Categorias

### GET `/api/categories`
Lista todas as categorias disponíveis.

**Query Parameters:**
- `level` (optional): Filtrar por nível (1 = principal, 2 = subcategoria)
- `parent_id` (optional): Filtrar por categoria pai

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Beleza e Estética",
      "slug": "beleza-estetica",
      "level": 1,
      "is_active": true,
      "display_order": 0
    }
  ]
}
```

### GET `/api/categories/[id]`
Obter detalhes de uma categoria específica.

### GET `/api/categories/[id]/tags`
Obter tags de especialidade sugeridas para uma categoria.

**Query Parameters:**
- `limit` (optional): Número máximo de tags (default: 20)

---

## 🎯 Especialidades do Provider

### GET `/api/provider/specialties`
Lista todas as especialidades do provider autenticado.

**Headers:**
- `x-provider-id`: ID do provider (temporário, será substituído por auth)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "category_id": "uuid",
      "category_type": "primary",
      "display_order": 1,
      "years_experience": 5,
      "experience_level": "advanced",
      "specialty_tags": ["Corte Masculino", "Barba"],
      "avg_rating": 4.8,
      "total_bookings": 150
    }
  ]
}
```

### POST `/api/provider/specialties`
Criar nova especialidade.

**Body:**
```json
{
  "category_id": "uuid",
  "category_type": "primary",
  "display_order": 1,
  "years_experience": 5,
  "experience_level": "advanced",
  "custom_description": "Especialista em cortes modernos",
  "specialty_tags": ["Corte Masculino", "Barba"]
}
```

**Validações:**
- Apenas 1 categoria primária por provider
- Máximo 2 categorias secundárias
- Máximo 10 tags por categoria

### PUT `/api/provider/specialties/[id]`
Atualizar especialidade existente.

### DELETE `/api/provider/specialties/[id]`
Remover especialidade (apenas secundárias).

---

## 📸 Portfolio

### GET `/api/provider/portfolio`
Lista todos os items do portfolio do provider.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Corte Degradê",
      "description": "Corte moderno com degradê",
      "media_type": "image",
      "media_url": "https://...",
      "is_featured": true,
      "views_count": 120,
      "likes_count": 45
    }
  ]
}
```

### POST `/api/provider/portfolio`
Adicionar novo item ao portfolio.

**Body:**
```json
{
  "title": "Corte Degradê",
  "description": "Corte moderno com degradê",
  "media_type": "image",
  "media_url": "https://...",
  "thumbnail_url": "https://...",
  "category_id": "uuid",
  "tags": ["corte", "degradê"],
  "is_featured": false
}
```

**Validações:**
- Máximo 50 items por provider
- `media_type` deve ser 'image' ou 'video'

### PUT `/api/provider/portfolio/[id]`
Atualizar item do portfolio.

### DELETE `/api/provider/portfolio/[id]`
Remover item do portfolio.

### POST `/api/provider/portfolio/[id]/reorder`
Reordenar items do portfolio.

**Body:**
```json
{
  "items": [
    { "id": "uuid1", "display_order": 0 },
    { "id": "uuid2", "display_order": 1 }
  ]
}
```

---

## 🎓 Certificações

### GET `/api/provider/certifications`
Lista todas as certificações do provider.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Barbeiro Profissional",
      "issuer": "SENAC",
      "issue_date": "2020-01-15",
      "expiry_date": "2025-01-15",
      "is_verified": true,
      "document_url": "https://..."
    }
  ]
}
```

### POST `/api/provider/certifications`
Adicionar nova certificação.

**Body:**
```json
{
  "name": "Barbeiro Profissional",
  "issuer": "SENAC",
  "issue_date": "2020-01-15",
  "expiry_date": "2025-01-15",
  "credential_id": "ABC123",
  "credential_url": "https://...",
  "document_url": "https://...",
  "provider_category_id": "uuid"
}
```

**Validações:**
- Máximo 20 certificações por provider
- `issue_date` deve ser anterior a `expiry_date`

### PUT `/api/provider/certifications/[id]`
Atualizar certificação.

### DELETE `/api/provider/certifications/[id]`
Remover certificação.

---

## 🔍 Busca e Perfil

### POST `/api/search/providers`
Busca avançada de providers com filtros.

**Body:**
```json
{
  "search_text": "barbeiro",
  "category_ids": ["uuid1", "uuid2"],
  "specialty_tags": ["Corte Masculino", "Barba"],
  "user_lat": 38.7223,
  "user_lng": -9.1393,
  "radius_km": 10,
  "min_rating": 4.0,
  "experience_level": "advanced",
  "show_closed": false,
  "sort_by": "relevance",
  "limit": 20,
  "offset": 0
}
```

**Sort Options:**
- `relevance`: Por relevância (default)
- `rating`: Por avaliação
- `distance`: Por distância
- `experience`: Por experiência

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "provider_id": "uuid",
      "full_name": "João Silva",
      "business_name": "Barbearia do João",
      "primary_category_name": "Beleza e Estética",
      "primary_specialty_tags": ["Corte Masculino", "Barba"],
      "avg_rating": 4.8,
      "total_reviews": 127,
      "distance_km": 2.5,
      "relevance_score": 85.5
    }
  ]
}
```

**Score de Relevância:**
- 95% baseado em qualidade (rating, reviews, experiência, verificação)
- 5% boost de plano (preparado para futuro)

### GET `/api/provider/profile/complete`
Obter perfil completo do provider com todas as informações.

**Query Parameters:**
- `provider_id`: ID do provider

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": { ... },
    "primary_category": { ... },
    "secondary_categories": [ ... ],
    "certifications": [ ... ],
    "portfolio": [ ... ],
    "statistics": {
      "avg_rating": 4.8,
      "total_reviews": 127,
      "total_bookings": 450,
      "completed_bookings": 425,
      "followers_count": 89
    },
    "status": {
      "is_open": true,
      "status_type": "open"
    }
  }
}
```

---

## 🔐 Autenticação

**Nota:** Atualmente os endpoints usam o header `x-provider-id` para identificação temporária. 

**TODO:** Implementar autenticação real com Supabase Auth:
- Obter `provider_id` do token JWT
- Validar permissões de role
- Implementar middleware de autenticação

---

## 📊 Limites e Validações

```typescript
const PROVIDER_LIMITS = {
  SPECIALTY_TAGS_PER_CATEGORY: 10,
  PORTFOLIO_ITEMS: 50,
  CERTIFICATIONS: 20,
  DESCRIPTION_MAX_LENGTH: 1000,
  MAX_SECONDARY_CATEGORIES: 2,
};
```

---

## 🚨 Códigos de Erro

- `400`: Bad Request - Dados inválidos
- `401`: Unauthorized - Provider ID não fornecido
- `404`: Not Found - Recurso não encontrado
- `500`: Internal Server Error - Erro no servidor

---

## 📝 Próximos Passos

- [ ] Implementar autenticação real com Supabase Auth
- [ ] Adicionar middleware de validação de roles
- [ ] Implementar rate limiting
- [ ] Adicionar paginação em todas as listagens
- [ ] Implementar upload de imagens para portfolio
- [ ] Adicionar testes de integração
