# ShopMaster — Deployment Guide

> Production stack: Ubuntu 22.04 · Docker · Nginx · PM2 · PostgreSQL 15 · Redis 7

---

## Table of Contents

1. [Infrastructure Overview](#infrastructure-overview)
2. [Docker Setup](#docker-setup)
3. [Nginx Configuration](#nginx-configuration)
4. [PM2 Process Manager](#pm2-process-manager)
5. [SSL Certificate (Let's Encrypt)](#ssl-certificate-lets-encrypt)
6. [CI/CD Pipeline (GitHub Actions)](#cicd-pipeline-github-actions)
7. [Health Checks & Monitoring](#health-checks--monitoring)
8. [Deployment Checklist](#deployment-checklist)
9. [Rollback Strategy](#rollback-strategy)

---

## Infrastructure Overview

```
Internet
   │
   ▼
[Nginx :443]  ← SSL termination, gzip, rate limiting
   │
   ├── /api/v1/* → [Node.js cluster :5000] (PM2 — N workers)
   └── /         → serve Nginx 200 health page
   │
[PostgreSQL :5432]
[Redis :6379]
[SendGrid SMTP]
```

**Minimum server specs (single VPS):**
- 2 CPU cores, 2 GB RAM, 20 GB SSD
- Ubuntu 22.04 LTS

---

## Docker Setup

### Dockerfile

```dockerfile
# server/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma

RUN npm run build
RUN npx prisma generate

# ────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

EXPOSE 5000
CMD ["node", "dist/app.js"]
```

### docker-compose.yml

```yaml
version: '3.9'

services:
  server:
    build: .
    restart: always
    env_file: .env
    ports:
      - "5000:5000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_DB: shopmaster_prod
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

volumes:
  pgdata:
  redisdata:
```

### Deploy with Docker

```bash
# 1. Copy .env to server
scp .env user@server:/app/.env

# 2. Build and start
docker-compose up -d --build

# 3. Run migrations
docker-compose exec server npx prisma migrate deploy

# 4. Check logs
docker-compose logs -f server
```

---

## Nginx Configuration

```nginx
# /etc/nginx/sites-available/shopmaster
upstream shopmaster_api {
    least_conn;                         # load balance: least connections
    server 127.0.0.1:5000;
    server 127.0.0.1:5001;             # optional second PM2 instance
    keepalive 32;
}

# HTTP → HTTPS redirect
server {
    listen 80;
    server_name api.shopmaster.app;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.shopmaster.app;

    # SSL (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/api.shopmaster.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.shopmaster.app/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";

    # Gzip
    gzip on;
    gzip_types application/json;
    gzip_min_length 1024;

    # Global rate limit: 200 req/min per IP
    limit_req_zone $binary_remote_addr zone=api_global:10m rate=200r/m;
    limit_req zone=api_global burst=50 nodelay;

    # Request size limit
    client_max_body_size 5m;

    # Proxy to Node.js
    location /api/ {
        proxy_pass http://shopmaster_api;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 5s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Health check (no auth required)
    location /health {
        proxy_pass http://shopmaster_api;
        access_log off;
    }
}
```

---

## PM2 Process Manager

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'shopmaster-api',
      script: 'dist/app.js',
      instances: 'max',          // use all available CPU cores
      exec_mode: 'cluster',      // cluster mode for load balancing
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      // Restart policy
      max_memory_restart: '512M',
      min_uptime: '10s',
      max_restarts: 10,
      // Logging
      out_file: 'logs/out.log',
      error_file: 'logs/error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
```

```bash
# Start in production
pm2 start ecosystem.config.js --env production

# Save process list (survives server restart)
pm2 save

# Set PM2 to start on boot
pm2 startup

# Monitor
pm2 monit

# Zero-downtime reload
pm2 reload shopmaster-api
```

---

## SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Issue certificate
sudo certbot --nginx -d api.shopmaster.app

# Auto-renewal (Certbot installs a cron job, but verify it)
sudo certbot renew --dry-run
```

---

## CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /app/shopMaster/server
            git pull origin main
            npm ci --only=production
            npm run build
            npx prisma migrate deploy
            pm2 reload shopmaster-api
```

---

## Health Checks & Monitoring

### Health Endpoint

`GET /health` returns:

```json
{
  "status": "ok",
  "uptime": 3600,
  "database": "connected",
  "redis": "connected",
  "timestamp": "2025-01-15T10:00:00Z"
}
```

### Monitoring Stack (optional but recommended)

- **Uptime Robot** — free external uptime monitoring (ping `/health` every 5 min)
- **PM2 Plus** — PM2's built-in monitoring dashboard
- **Papertrail / Logtail** — centralised log management

---

## Deployment Checklist

Before deploying:

- [ ] All tests passing (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] `.env` production values are set
- [ ] Database migrations reviewed (`prisma migrate status`)
- [ ] No `console.log` debug statements in production code
- [ ] `npm audit` shows no high/critical vulnerabilities

After deploying:

- [ ] `GET /health` returns `{"status":"ok"}`
- [ ] Login flow tested on staging mobile app
- [ ] Check PM2 logs for errors (`pm2 logs`)
- [ ] Verify Nginx is passing requests (`nginx -t && sudo nginx -s reload`)

---

## Rollback Strategy

```bash
# Option 1: Git rollback (if code is broken)
git revert HEAD
git push origin main
# CI/CD will redeploy automatically

# Option 2: PM2 rollback (immediate)
pm2 stop shopmaster-api
# restore previous dist/ from backup
pm2 start shopmaster-api

# Option 3: Database rollback (if migration caused issues)
# Prisma does NOT auto-rollback — restore from backup
pg_restore -U app_user -d shopmaster_prod backup.dump
```

**Always backup the database before running migrations in production:**
```bash
pg_dump -U app_user shopmaster_prod > backup_$(date +%Y%m%d_%H%M%S).dump
```
