# Fixy Backoffice - Memory Bank

This directory contains detailed documentation for all modules and features of the Fixy Backoffice system.

## 📚 Documentation Structure

### Phase 1 - Foundation
- [Phase 1.1 - Supabase Setup](./phase-1.1-supabase-setup.md)
- [Phase 1.2 - RBAC System](./phase-1.2-rbac-system.md)
- [Phase 1.3 - Middleware Protection](./phase-1.3-middleware-protection.md)

### Phase 2 - User Management & Notifications
- [Phase 2A - User Management](./phase-2a-user-management.md)
- [Phase 2B - Notification System](./phase-2b-notification-system.md)
- [Phase 2C - Campaign System](./phase-2c-campaign-system.md)

### Technical Documentation
- [Database Schema](./database-schema.md)
- [API Reference](./api-reference.md)
- [Security Guidelines](./security-guidelines.md)
- [Deployment Guide](./deployment-guide.md)

## 🎯 Project Overview

**Project:** Fixy Backoffice  
**Framework:** Next.js 16 (App Router)  
**Backend:** Supabase (PostgreSQL + Auth)  
**Language:** TypeScript (Strict Mode)  
**Styling:** Tailwind CSS v4

## 🔐 Role Hierarchy

```
super_admin  → Full system access
    ↓
admin        → Manage users, services, bookings
    ↓
support      → View all, provide support
    ↓
provider     → Manage own services
    ↓
client       → Manage own profile
```

## 📊 Current Status

- ✅ Phase 1.1 - Supabase Setup (Complete)
- ✅ Phase 1.2 - RBAC System (Complete)
- ✅ Phase 1.3 - Middleware Protection (Complete)
- 🔄 Phase 2A - User Management (In Progress)
- ⏳ Phase 2B - Notification System (Planned)
- ⏳ Phase 2C - Campaign System (Planned)

## 🚀 Quick Start

1. Review [Phase 1.1](./phase-1.1-supabase-setup.md) for Supabase configuration
2. Understand [RBAC System](./phase-1.2-rbac-system.md) for role management
3. Check [Security Guidelines](./security-guidelines.md) before implementing features

## 📝 Notes

- All migrations are stored in `fixy-supabase/supabase/migrations/`
- TypeScript types are auto-generated from Supabase schema
- Follow the steering rules in `.kiro/steering/kiro-agent.md`

---

**Last Updated:** 2025-12-26  
**Version:** 1.0.0
