# Project Decisions - Fixy Backoffice

**Last Updated:** 2025-12-26  
**Status:** Active Development

## Overview

This document records all major architectural and implementation decisions made for the Fixy Backoffice project.

---

## Phase 2 Implementation Decisions

### Decision Date: 2025-12-26

### 1. Super Admin Setup Route

**Decision:** Create temporary `/setup-super-admin` route

**Details:**
- Route will be created for initial super_admin setup
- Protected by secret token in environment variable
- Must be deleted after first super_admin is created
- Only super_admins can create or modify other super_admin roles

**Rationale:**
- Provides secure way to bootstrap the system
- Prevents chicken-and-egg problem (need admin to create admin)
- Temporary nature ensures security after setup

**Implementation:**
- Create route at `/setup-super-admin`
- Add `SUPER_ADMIN_SETUP_TOKEN` to `.env`
- Log creation in audit trail
- Document deletion procedure

---

### 2. Notification System - Phase 1

**Decision:** Implement in-app notifications first

**Details:**
- Focus on in-app notification system initially
- Design architecture to support mobile apps in future
- Email and push notifications deferred to Phase 3

**Rationale:**
- Faster initial implementation
- In-app notifications provide immediate value
- Architecture designed for extensibility
- Mobile app compatibility ensured from start

**Implementation:**
- Create `notifications` table with all fields
- Implement `notification_preferences` table
- Build notification bell component
- Design API for mobile consumption
- Email/push channels marked as "future"

**Future Considerations:**
- Email service integration (SendGrid/Resend) - Phase 3
- Push notifications (FCM/OneSignal) - Phase 3
- SMS notifications (Twilio) - Phase 4

---

### 3. Campaign Images and Banners

**Decision:** Support images and banners from start

**Details:**
- Create dedicated Supabase Storage bucket for campaigns
- Support banner images (hero images)
- Support thumbnail images (list view)
- Implement image upload and validation

**Rationale:**
- Visual campaigns are more effective
- Better user engagement
- Professional appearance
- Competitive advantage

**Implementation:**
- Create `campaign-banners` storage bucket
- Implement image upload component
- Add image validation (type, size, dimensions)
- Store URLs in `campaigns` table
- Implement image optimization (future)

**Storage Structure:**
```
campaign-banners/
├── {campaign-id}/
│   ├── banner.jpg
│   └── thumbnail.jpg
```

**Bucket Policies:**
- Public read access
- Admin/super_admin write access
- Max file size: 5MB
- Allowed types: JPEG, PNG, WebP

---

### 4. Implementation Priority

**Decision:** Sequential implementation A → B → C

**Phase Order:**
1. **Phase 2A:** User Management + Super Admin Setup
2. **Phase 2B:** Notification System (in-app only)
3. **Phase 2C:** Campaign System (with images)

**Rationale:**
- User management is foundation for other features
- Notifications needed before campaigns
- Campaigns depend on both users and notifications
- Logical dependency chain

**Timeline Estimate:**
- Phase 2A: 2-3 days
- Phase 2B: 2-3 days
- Phase 2C: 3-4 days
- Total: ~7-10 days

---

### 5. Email Service

**Decision:** Use Supabase Auth emails initially

**Details:**
- Start with Supabase built-in email functionality
- Plan for external service integration later
- Document migration path

**Rationale:**
- Faster initial development
- Lower initial costs
- Supabase emails sufficient for MVP
- Easy to migrate later

**Current Capabilities:**
- Password reset emails
- Email verification
- Magic link authentication

**Future Migration (Phase 3+):**
- Evaluate: SendGrid, Resend, AWS SES
- Implement custom email templates
- Add transactional email tracking
- Support email preferences
- Implement email analytics

**Migration Checklist (Future):**
- [ ] Choose email service provider
- [ ] Create email templates
- [ ] Implement email queue
- [ ] Add delivery tracking
- [ ] Test email deliverability
- [ ] Update notification system
- [ ] Migrate existing users

---

## Technical Decisions

### Database

**Decision:** PostgreSQL via Supabase

**Rationale:**
- Robust relational database
- Built-in auth and RLS
- Real-time capabilities
- Excellent TypeScript support
- Generous free tier

### Frontend Framework

**Decision:** Next.js 16 (App Router)

**Rationale:**
- Server-side rendering
- API routes
- File-based routing
- Excellent TypeScript support
- Large ecosystem

### Styling

**Decision:** Tailwind CSS v4

**Rationale:**
- Utility-first approach
- Excellent DX
- Small bundle size
- Easy customization
- TailAdmin template compatibility

### State Management

**Decision:** React Server Components + Server Actions

**Rationale:**
- Reduced client-side JavaScript
- Better performance
- Simpler data fetching
- Built-in caching
- No external state library needed

### Form Handling

**Decision:** Native HTML forms + Server Actions

**Rationale:**
- Progressive enhancement
- Works without JavaScript
- Simpler implementation
- Better accessibility
- Native validation

---

## Security Decisions

### Authentication

**Decision:** Supabase Auth

**Rationale:**
- Industry-standard security
- Built-in session management
- JWT tokens
- Refresh token rotation
- MFA support (future)

### Authorization

**Decision:** Database-level RBAC with RLS

**Rationale:**
- Security at database level
- Cannot be bypassed
- Centralized permission logic
- Audit trail built-in
- Consistent across all clients

### API Security

**Decision:** Server-side validation only

**Rationale:**
- Client-side can be bypassed
- Single source of truth
- Easier to maintain
- Better security

---

## Architecture Decisions

### Monorepo Structure

**Decision:** Separate projects for backoffice, mobile, and supabase

**Current Structure:**
```
projetos/
├── fixy/                    # Mobile app (Flutter)
├── fixy-backoffice/         # Admin dashboard (Next.js)
└── fixy-supabase/           # Database migrations
```

**Rationale:**
- Clear separation of concerns
- Independent deployment
- Different tech stacks
- Shared database

### API Design

**Decision:** Server Actions over REST API

**Rationale:**
- Type-safe
- Automatic serialization
- Built into Next.js
- Simpler than REST
- Better DX

### File Organization

**Decision:** Feature-based organization

**Structure:**
```
src/
├── app/                     # Routes
├── components/              # Shared components
├── lib/                     # Utilities
└── types/                   # TypeScript types
```

---

## Performance Decisions

### Image Optimization

**Decision:** Next.js Image component + Supabase Storage

**Rationale:**
- Automatic optimization
- Lazy loading
- Responsive images
- CDN delivery

### Caching Strategy

**Decision:** Next.js built-in caching + Supabase cache

**Rationale:**
- Automatic cache invalidation
- Reduced database queries
- Better performance
- Simpler implementation

### Pagination

**Decision:** Cursor-based pagination

**Rationale:**
- Better performance for large datasets
- Consistent results
- Works with real-time updates
- Supabase native support

---

## Future Considerations

### Mobile App Integration

**Planned:**
- Shared notification system
- Shared campaign system
- Real-time updates via Supabase Realtime
- Push notifications

**API Design:**
- RESTful endpoints for mobile
- GraphQL consideration (future)
- WebSocket for real-time

### Analytics

**Planned:**
- Campaign performance tracking
- User behavior analytics
- Admin action analytics
- System health monitoring

**Tools Under Consideration:**
- PostHog (open source)
- Mixpanel
- Google Analytics 4
- Custom solution

### Internationalization (i18n)

**Planned:**
- Multi-language support
- Portuguese (primary)
- English (secondary)
- Spanish (future)

**Implementation:**
- next-intl library
- Translation files
- Language switcher
- RTL support (future)

### Testing Strategy

**Planned:**
- Unit tests (Vitest)
- Integration tests (Playwright)
- E2E tests (Playwright)
- Visual regression tests (Chromatic)

**Coverage Goals:**
- Unit tests: 70%+
- Integration tests: Key flows
- E2E tests: Critical paths

---

## Deferred Decisions

### Items Pending Future Discussion

1. **Payment Integration**
   - Stripe vs. other providers
   - Subscription billing
   - Invoice generation

2. **Advanced Analytics**
   - Real-time dashboards
   - Custom reports
   - Data export

3. **Multi-tenancy**
   - Multiple organizations
   - Workspace isolation
   - Billing per workspace

4. **Advanced Search**
   - Full-text search
   - Elasticsearch integration
   - Search analytics

5. **Audit Log Retention**
   - Long-term storage
   - Compliance requirements
   - Archive strategy

---

## Decision Log

| Date       | Decision                          | Status    | Phase |
|------------|-----------------------------------|-----------|-------|
| 2025-12-25 | Use Supabase for backend          | ✅ Done   | 1.1   |
| 2025-12-26 | Implement 5-role RBAC             | ✅ Done   | 1.2   |
| 2025-12-26 | Add middleware protection         | ✅ Done   | 1.3   |
| 2025-12-26 | Create super admin setup route    | 🔄 Active | 2A.1  |
| 2025-12-26 | In-app notifications first        | ⏳ Planned| 2B    |
| 2025-12-26 | Campaign images support           | ⏳ Planned| 2C    |
| 2025-12-26 | Use Supabase Auth emails          | ⏳ Planned| 2B    |

**Legend:**
- ✅ Done - Implemented and tested
- 🔄 Active - Currently in development
- ⏳ Planned - Scheduled for implementation
- 🤔 Considering - Under discussion
- ❌ Rejected - Decided against

---

## Review Schedule

This document should be reviewed and updated:
- After each phase completion
- When major decisions are made
- Monthly during active development
- Quarterly during maintenance

**Next Review:** After Phase 2A completion

---

## References

- [Architecture Decision Records (ADR)](https://adr.github.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TailAdmin Documentation](https://tailadmin.com/docs)
