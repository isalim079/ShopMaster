# ShopMaster — Security Guide

---

## Table of Contents

1. [Authentication Strategy](#authentication-strategy)
2. [Password Security](#password-security)
3. [JWT Strategy](#jwt-strategy)
4. [Email Verification](#email-verification)
5. [Input Validation & Sanitization](#input-validation--sanitization)
6. [Rate Limiting](#rate-limiting)
7. [HTTP Security Headers](#http-security-headers)
8. [CORS Policy](#cors-policy)
9. [SQL Injection Prevention](#sql-injection-prevention)
10. [Sensitive Data Protection](#sensitive-data-protection)
11. [Vulnerability Checklist](#vulnerability-checklist)

---

## Authentication Strategy

ShopMaster uses a **dual-token JWT strategy**:

| Token | Lifespan | Storage | Purpose |
|---|---|---|---|
| **Access Token** | 15 minutes | Mobile memory (not disk) | Authorise every API request |
| **Refresh Token** | 30 days | Secure HTTP-only cookie OR secure mobile storage | Get a new access token |

### Flow

```
1. Login → server issues accessToken (15min) + refreshToken (30d)
2. Client sends accessToken in Authorization header on every request
3. When accessToken expires → client sends refreshToken to /auth/refresh-token
4. Server verifies refreshToken from DB, issues new accessToken
5. On logout → server blacklists the accessToken in Redis (TTL: 15min)
6. On logout → server revokes refreshToken in DB
```

### Token Blacklist (Redis)

When a user logs out or changes password:
- Current accessToken is stored in Redis with `BLACKLIST:<token>` key
- TTL = remaining token lifetime
- `authGuard` middleware checks Redis before trusting any JWT

---

## Password Security

- **Hashing**: bcrypt with **12 salt rounds** (good balance: ~300ms/hash on modern hardware)
- **Never stored**: Plain text passwords never touch logs, responses, or DB
- **Never logged**: Password fields are stripped before any logging middleware runs
- **Strength rules** (enforced by Zod):
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 number
  - At least 1 special character (`!@#$%^&*`)
- **Password change** requires providing the current password

```typescript
// utils/password.util.ts — password helper
export const hashPassword = (plain: string) => bcrypt.hash(plain, 12);
export const comparePassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);
```

---

## JWT Strategy

```typescript
// config/jwt.config.ts
export const JWT_CONFIG = {
  accessSecret: process.env.JWT_ACCESS_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,  // different secret!
  accessExpiry: '15m',
  refreshExpiry: '30d',
  algorithm: 'HS256',
};
```

**Key rules:**
- Access & refresh tokens use **different secrets** — compromise of one does not affect the other
- JWT payload contains only: `{ sub: userId, email, iat, exp }` — no sensitive data
- JWT is verified in the `authGuard` middleware — any tampering causes immediate `401`
- Tokens are **never stored** in the DB — only refresh token hashes are stored

---

## Email Verification

- On register, a 6-digit OTP is generated and emailed
- OTP is stored hashed in `otp_tokens` table
- OTP expires in **10 minutes**
- Max **3 resend attempts** per hour (rate-limited)
- After use, `used_at` is stamped — prevents OTP reuse
- Unverified accounts **cannot login**

---

## Input Validation & Sanitization

### Validation (Zod)

Every request body, query string, and URL param is validated with a Zod schema **before** reaching the controller. Invalid requests return `422` with specific field errors.

```typescript
// Example: transaction validation schema
export const createTransactionSchema = z.object({
  body: z.object({
    type: z.enum(['BUY', 'SELL']),
    productId: z.string().uuid('Invalid product ID'),
    quantity: z.number().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Price must be positive'),
    note: z.string().max(255).optional(),
  }),
});
```

### Sanitization (XSS Prevention)

- All string inputs are stripped of HTML tags using `xss` library
- Applied in a global `sanitize` middleware **before** route handlers
- Prevents stored XSS attacks in name, description, and note fields

---

## Rate Limiting

Redis-backed sliding window rate limiter (using `rate-limiter-flexible`):

| Endpoint Group | Limit | Window |
|---|---|---|
| `/auth/login` | 5 requests | 15 minutes (per IP) |
| `/auth/register` | 3 requests | 1 hour (per IP) |
| `/auth/resend-otp` | 3 requests | 1 hour (per email) |
| `/auth/forgot-password` | 3 requests | 1 hour (per email) |
| All other endpoints | 100 requests | 1 minute (per user) |
| Global (Nginx) | 200 requests | 1 minute (per IP) |

**Why Redis?** Rate limits are shared across all Node processes (PM2 cluster).

---

## HTTP Security Headers

Applied via `helmet` middleware:

```typescript
app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
}));
```

| Header | Value | Purpose |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `Strict-Transport-Security` | `max-age=31536000` | Forces HTTPS |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS filter |
| `Content-Security-Policy` | strict | Prevents script injection |
| `X-Powered-By` | removed by Nginx | Hides server identity |

---

## CORS Policy

```typescript
// config/cors.config.ts
const allowedOrigins = [
  'https://shopmaster.app',
  process.env.NODE_ENV === 'development' ? 'http://localhost:8081' : null,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,  // preflight cache 24h
}));
```

---

## SQL Injection Prevention

- **Prisma ORM** uses parameterised queries by default — user input is never interpolated into SQL
- Raw queries (if any) use `prisma.$queryRaw` with Prisma's `Prisma.sql` tagged template (auto-escapes)
- No string concatenation for SQL construction anywhere in the codebase

---

## Sensitive Data Protection

| Data | Handling |
|---|---|
| Passwords | bcrypt hashed — never logged or returned in responses |
| JWT secrets | Only in environment variables — never in code |
| DB credentials | Only in environment variables — never in code |
| OTPs | Stored hashed — plain OTP only in the email |
| User emails | Partially masked in logs (`mi***@example.com`) |
| API responses | Password hash, `is_active`, internal IDs stripped |

### Response Sanitization

The `sendSuccess` helper uses a **user serializer** that removes:
- `passwordHash`
- `isActive`
- Internal Prisma metadata

---

## Vulnerability Checklist

| Vulnerability | Mitigation |
|---|---|
| SQL Injection | Prisma parameterised queries |
| XSS | Input sanitization + CSP headers |
| CSRF | JWT (not cookies) for auth — CSRF N/A for mobile |
| Brute Force | Rate limiting on auth endpoints |
| Password Sniffing | HTTPS only (enforced by HSTS) |
| Token Theft | Short-lived access tokens (15min) |
| Session Fixation | New tokens issued on login — old ones blacklisted |
| Mass Assignment | Zod schema whitelist — unknown fields stripped |
| Broken Object Level Auth | Every query scoped to `userId` from JWT |
| Sensitive Data Exposure | Response serializers strip internal fields |
| Dependency Vulnerabilities | `npm audit` in CI pipeline |
| Clickjacking | `X-Frame-Options: DENY` |
