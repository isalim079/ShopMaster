# ShopMaster — Environment Variables

Copy `.env.example` to `.env` and fill in every required value before starting.

> **Never commit `.env` to version control.** Only `.env.example` (with empty values) is committed.

---

## Application

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | Yes | `development` | `development` \| `production` \| `test` |
| `PORT` | No | `5000` | Port the Express server listens on |
| `API_VERSION` | No | `v1` | API route prefix (`/api/v1`) |
| `APP_NAME` | No | `ShopMaster` | Used in email templates and logs |

---

## Database (PostgreSQL)

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | Full Prisma connection string |

**Format:**
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/shopmaster_db?schema=public"
```

**Examples:**
```bash
# Local development
DATABASE_URL="postgresql://postgres:password@localhost:5432/shopmaster_dev?schema=public"

# Production (connection pooler like PgBouncer recommended)
DATABASE_URL="postgresql://app_user:strongpassword@db.host.com:5432/shopmaster_prod?schema=public&connection_limit=10"
```

---

## Redis

| Variable | Required | Default | Description |
|---|---|---|---|
| `REDIS_URL` | Yes | — | Redis connection URL |

**Format:**
```
REDIS_URL="redis://:PASSWORD@HOST:6379"
```

**Examples:**
```bash
# Local
REDIS_URL="redis://localhost:6379"

# With password
REDIS_URL="redis://:myredispassword@localhost:6379"

# Redis Cloud / production
REDIS_URL="rediss://:password@hostname.redis.cloud:6380"
```

---

## JWT (Authentication)

| Variable | Required | Default | Description |
|---|---|---|---|
| `JWT_ACCESS_SECRET` | Yes | — | Secret for signing access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | — | Secret for signing refresh tokens (min 32 chars, DIFFERENT from access) |
| `JWT_ACCESS_EXPIRY` | No | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRY` | No | `30d` | Refresh token lifetime |

**Generating secure secrets:**
```bash
# Generate a cryptographically secure 64-character secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Email (SMTP / SendGrid)

| Variable | Required | Default | Description |
|---|---|---|---|
| `SMTP_HOST` | Yes | — | SMTP server hostname |
| `SMTP_PORT` | No | `587` | SMTP port (587 for TLS, 465 for SSL) |
| `SMTP_SECURE` | No | `false` | `true` for SSL (port 465) |
| `SMTP_USER` | Yes | — | SMTP username or SendGrid API key username |
| `SMTP_PASS` | Yes | — | SMTP password or SendGrid API key |
| `EMAIL_FROM` | Yes | — | Sender address (e.g. `noreply@shopmaster.app`) |
| `EMAIL_FROM_NAME` | No | `ShopMaster` | Display name in From header |

**SendGrid example:**
```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASS="SG.your_sendgrid_api_key_here"
EMAIL_FROM="noreply@shopmaster.app"
EMAIL_FROM_NAME="ShopMaster"
```

---

## Security

| Variable | Required | Default | Description |
|---|---|---|---|
| `BCRYPT_ROUNDS` | No | `12` | bcrypt salt rounds (never go below 10) |
| `OTP_EXPIRY_MINUTES` | No | `10` | OTP expiry window in minutes |
| `CORS_ALLOWED_ORIGINS` | No | `http://localhost:8081` | Comma-separated allowed origins |
| `RATE_LIMIT_WINDOW_MS` | No | `60000` | Rate limit window in milliseconds |
| `RATE_LIMIT_MAX` | No | `100` | Max requests per window per user |

---

## Logging

| Variable | Required | Default | Description |
|---|---|---|---|
| `LOG_LEVEL` | No | `info` | `error` \| `warn` \| `info` \| `debug` |
| `LOG_FILE_PATH` | No | `logs/app.log` | Log file path |

---

## Full .env.example

```bash
# =========================
# Application
# =========================
NODE_ENV=development
PORT=5000
API_VERSION=v1
APP_NAME=ShopMaster

# =========================
# Database (PostgreSQL)
# =========================
DATABASE_URL="postgresql://postgres:password@localhost:5432/shopmaster_dev?schema=public"

# =========================
# Redis
# =========================
REDIS_URL="redis://localhost:6379"

# =========================
# JWT
# =========================
JWT_ACCESS_SECRET=your_super_secret_access_key_min_32_chars
JWT_REFRESH_SECRET=your_different_super_secret_refresh_key_min_32_chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# =========================
# Email (SMTP)
# =========================
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.your_sendgrid_key
EMAIL_FROM=noreply@shopmaster.app
EMAIL_FROM_NAME=ShopMaster

# =========================
# Security
# =========================
BCRYPT_ROUNDS=12
OTP_EXPIRY_MINUTES=10
CORS_ALLOWED_ORIGINS=http://localhost:8081

# =========================
# Rate Limiting
# =========================
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100

# =========================
# Logging
# =========================
LOG_LEVEL=info
LOG_FILE_PATH=logs/app.log
```

---

## Production Checklist

Before deploying to production:

- [ ] `NODE_ENV=production`
- [ ] `JWT_ACCESS_SECRET` is at least 64 chars, randomly generated
- [ ] `JWT_REFRESH_SECRET` is at least 64 chars, **different** from access secret
- [ ] `DATABASE_URL` points to production DB with a dedicated app user (not superuser)
- [ ] `REDIS_URL` has password set
- [ ] `SMTP_PASS` is a real SendGrid API key
- [ ] `CORS_ALLOWED_ORIGINS` is set to the production mobile app origin
- [ ] `LOG_LEVEL=warn` or `error` (not `debug` in production)
- [ ] `.env` is NOT committed to git (check `.gitignore`)
