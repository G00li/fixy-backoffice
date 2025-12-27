# Security Guidelines - Fixy Backoffice

**Last Updated:** 2025-12-26  
**Classification:** Internal Use Only

## Overview

Comprehensive security guidelines for the Fixy Backoffice system, covering authentication, authorization, data protection, and best practices.

## Authentication Security

### 1. Password Requirements

**Minimum Requirements:**
- Length: 8 characters minimum
- Complexity: Mix of uppercase, lowercase, numbers
- No common passwords (use password strength checker)
- No personal information (name, email, etc.)

**Implementation:**
```typescript
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function validatePassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}
```

### 2. Session Management

**Best Practices:**
- Use Supabase Auth for session management
- Sessions expire after 1 hour of inactivity
- Refresh tokens valid for 7 days
- Implement "Remember Me" with extended refresh token (30 days)

**Cookie Security:**
```typescript
{
  httpOnly: true,
  secure: true, // HTTPS only
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 // 7 days
}
```

### 3. Multi-Factor Authentication (Future)

**Planned Implementation:**
- TOTP (Time-based One-Time Password)
- SMS verification (optional)
- Backup codes
- Required for super_admin accounts

## Authorization Security

### 1. Role-Based Access Control (RBAC)

**Hierarchy:**
```
super_admin > admin > support > provider > client
```

**Permission Validation:**
- Always validate on server-side
- Never trust client-side role checks
- Use database RPC functions (`is_admin()`, etc.)
- Log all permission checks

**Example:**
```typescript
// ❌ BAD - Client-side only
if (user.role === 'admin') {
  // Allow action
}

// ✅ GOOD - Server-side validation
const { data: isAdmin } = await supabase.rpc('is_admin', {
  user_id: user.id
});

if (isAdmin) {
  // Allow action
}
```

### 2. Row Level Security (RLS)

**Requirements:**
- ALL tables must have RLS enabled
- Policies must be tested thoroughly
- Use `auth.uid()` for user-specific data
- Use RBAC functions for role-based access

**Policy Template:**
```sql
-- Users can view own data
CREATE POLICY "Users can view own data"
  ON table_name
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all data
CREATE POLICY "Admins can view all data"
  ON table_name
  FOR SELECT
  USING (is_admin_or_above());
```

### 3. API Route Protection

**Middleware Protection:**
- All admin routes protected by middleware
- Public routes explicitly defined
- Redirect unauthenticated users
- Redirect unauthorized users to 403 page

**Server Action Protection:**
```typescript
export async function adminAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'Unauthorized' };
  }
  
  const { data: isAdmin } = await supabase.rpc('is_admin', {
    user_id: user.id
  });
  
  if (!isAdmin) {
    return { error: 'Forbidden' };
  }
  
  // Proceed with action
}
```

## Data Protection

### 1. Sensitive Data Handling

**Never Expose:**
- Service role keys
- API secrets
- User passwords (even hashed)
- Payment information
- Personal identification numbers

**Environment Variables:**
```env
# ✅ GOOD - Public (prefixed with NEXT_PUBLIC_)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# ✅ GOOD - Private (no prefix)
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...

# ❌ BAD - Exposing secrets
NEXT_PUBLIC_SERVICE_ROLE_KEY=... # NEVER DO THIS
```

### 2. Data Encryption

**At Rest:**
- Supabase encrypts all data at rest (AES-256)
- Sensitive fields can be additionally encrypted
- Use PostgreSQL `pgcrypto` for field-level encryption

**In Transit:**
- Always use HTTPS
- TLS 1.2 or higher
- Valid SSL certificates

### 3. Personal Data (GDPR/LGPD)

**User Rights:**
- Right to access (export data)
- Right to deletion (delete account)
- Right to rectification (edit data)
- Right to portability (data export)

**Implementation:**
- Soft delete users (mark as deleted, anonymize data)
- Provide data export functionality
- Log all data access
- Obtain consent for data processing

## Input Validation

### 1. Server-Side Validation

**Always Validate:**
- Email format
- Phone numbers
- URLs
- File uploads
- JSON payloads
- SQL parameters

**Example:**
```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(2).max(100),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
});

export async function createUser(data: unknown) {
  // Validate input
  const validated = userSchema.parse(data);
  
  // Proceed with validated data
}
```

### 2. SQL Injection Prevention

**Use Parameterized Queries:**
```typescript
// ✅ GOOD - Parameterized
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail);

// ❌ BAD - String concatenation
const query = `SELECT * FROM users WHERE email = '${userEmail}'`;
```

### 3. XSS Prevention

**Sanitize Output:**
- Use React's built-in XSS protection
- Sanitize user-generated content
- Use `dangerouslySetInnerHTML` only when necessary
- Validate and sanitize HTML input

**Example:**
```typescript
import DOMPurify from 'dompurify';

function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty);
}
```

## Audit Logging

### 1. What to Log

**Administrative Actions:**
- User creation/deletion
- Role changes
- Permission changes
- Configuration changes
- Data exports

**Security Events:**
- Failed login attempts
- Password changes
- Account lockouts
- Suspicious activities

**Business Events:**
- Campaign creation/approval
- Large transactions
- Bulk operations

### 2. Log Format

```typescript
interface AuditLog {
  id: string;
  timestamp: string;
  actor_id: string;
  actor_role: string;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address: string;
  user_agent: string;
  status: 'success' | 'failure';
  error_message?: string;
  metadata: Record<string, any>;
}
```

### 3. Log Retention

- Keep logs for minimum 90 days
- Archive old logs to cold storage
- Implement log rotation
- Ensure logs are tamper-proof

## Rate Limiting

### 1. API Rate Limits

**Recommended Limits:**
- Authentication: 5 attempts per 15 minutes
- Password reset: 3 attempts per hour
- User creation: 10 per hour (admin)
- Campaign creation: 5 per hour (admin)

**Implementation:**
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'),
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }
  
  // Process request
}
```

### 2. Brute Force Protection

**Login Protection:**
- Lock account after 5 failed attempts
- Require CAPTCHA after 3 failed attempts
- Implement exponential backoff
- Notify user of suspicious activity

## File Upload Security

### 1. Validation

**Check:**
- File type (MIME type)
- File size (max 5MB for images)
- File extension
- File content (magic bytes)

**Example:**
```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function validateFile(file: File): boolean {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return false;
  }
  
  if (file.size > MAX_SIZE) {
    return false;
  }
  
  return true;
}
```

### 2. Storage Security

**Supabase Storage:**
- Use signed URLs for private files
- Set appropriate bucket policies
- Scan files for malware (future)
- Implement file versioning

**Bucket Policies:**
```sql
-- Public read for avatars
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Authenticated write for own avatar
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## Third-Party Integrations

### 1. API Key Management

**Best Practices:**
- Store keys in environment variables
- Rotate keys regularly
- Use different keys for dev/staging/prod
- Never commit keys to Git

### 2. Webhook Security

**Verify Webhooks:**
- Validate webhook signatures
- Use HTTPS endpoints only
- Implement replay protection
- Log all webhook events

**Example (Stripe):**
```typescript
import Stripe from 'stripe';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const body = await request.text();
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    // Process event
  } catch (err) {
    return new Response('Invalid signature', { status: 400 });
  }
}
```

## Monitoring & Alerting

### 1. Security Monitoring

**Monitor:**
- Failed authentication attempts
- Unusual access patterns
- Privilege escalation attempts
- Data export activities
- Configuration changes

### 2. Alerts

**Immediate Alerts:**
- Multiple failed login attempts
- Super admin role assignment
- Bulk data deletion
- Service outages

**Daily Digest:**
- New user registrations
- Campaign approvals
- System health metrics

## Incident Response

### 1. Security Incident Procedure

**Steps:**
1. **Detect:** Identify the incident
2. **Contain:** Limit the damage
3. **Investigate:** Determine the cause
4. **Remediate:** Fix the vulnerability
5. **Document:** Record the incident
6. **Review:** Learn and improve

### 2. Data Breach Response

**Immediate Actions:**
1. Isolate affected systems
2. Notify security team
3. Preserve evidence
4. Assess impact
5. Notify affected users (if required by law)
6. Report to authorities (if required)

## Compliance

### 1. GDPR (Europe)

**Requirements:**
- Obtain user consent
- Provide data access
- Allow data deletion
- Implement data portability
- Appoint DPO (if required)

### 2. LGPD (Brazil)

**Requirements:**
- Similar to GDPR
- Obtain explicit consent
- Provide data access
- Allow data deletion
- Report breaches within 72 hours

### 3. PCI DSS (Payment Cards)

**If handling payments:**
- Never store CVV
- Encrypt card data
- Use PCI-compliant payment processor
- Implement strong access controls

## Security Checklist

### Development

- [ ] All environment variables secured
- [ ] No secrets in code
- [ ] Input validation implemented
- [ ] Output sanitization implemented
- [ ] RLS policies on all tables
- [ ] Server-side permission checks
- [ ] Audit logging implemented
- [ ] Error messages don't leak info

### Deployment

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Incident response plan documented
- [ ] Security review completed
- [ ] Penetration testing performed

### Ongoing

- [ ] Regular security audits
- [ ] Dependency updates
- [ ] Log review
- [ ] Access review
- [ ] Backup testing
- [ ] Incident drills
- [ ] Security training
- [ ] Compliance review

## Security Headers

**Recommended Headers:**
```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];
```

## Resources

### Tools

- [OWASP ZAP](https://www.zaproxy.org/) - Security testing
- [Snyk](https://snyk.io/) - Dependency scanning
- [SonarQube](https://www.sonarqube.org/) - Code quality
- [Supabase Security](https://supabase.com/docs/guides/platform/going-into-prod#security)

### Documentation

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/going-into-prod#security)

## Contact

**Security Issues:**
- Email: security@fixy.com
- Report vulnerabilities responsibly
- Do not disclose publicly before fix

---

**Remember:** Security is everyone's responsibility. When in doubt, ask!
