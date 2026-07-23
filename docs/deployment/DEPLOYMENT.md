# ExpenseFlow — Deployment Architecture

## Local Development (Docker Compose)

Planned services:

| Service | Image / Build | Ports |
|---------|---------------|-------|
| `nginx` | nginx | 80 → app |
| `frontend` | Vite build / dev | internal |
| `api` | NestJS | 3000 |
| `worker` | BullMQ workers | — |
| `bot` | Telegram bot | — |
| `postgres` | postgres:16 | 5432 |
| `redis` | redis:7 | 6379 |
| `minio` | minio (S3) | 9000, 9001 |

Compose files will live at repo root (`docker-compose.yml`) and `infrastructure/docker/`.

## NGINX Responsibilities

- Reverse proxy `/api` → `api:3000`
- Serve frontend static assets (production)
- Proxy Telegram webhook path if needed
- TLS in staging/production
- Gzip / static caching headers

Config path: `nginx/conf.d/`

## Environment Strategy

| File | Purpose |
|------|---------|
| `.env.example` | Documented keys, empty values |
| `.env` | Local secrets (gitignored) |
| Compose `env_file` | Wire services |

Required variable groups:

- `DATABASE_URL` / Postgres credentials
- `REDIS_URL`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `OPENAI_API_KEY`
- `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`
- `APP_URL`, `CORS_ORIGINS`

## Production Checklist (later phase)

- [ ] Managed Postgres with backups
- [ ] Managed Redis
- [ ] S3 bucket + lifecycle rules
- [ ] Multi-replica API + worker
- [ ] Bot webhook HTTPS endpoint
- [ ] Secrets manager
- [ ] Health checks + uptime monitoring
- [ ] Log aggregation
- [ ] CI/CD (`.github/workflows`)

## Process Model

```
NGINX
  ├─ static frontend
  └─ /api/v1/*  → API replicas
API publishes jobs → Redis/BullMQ
Worker replicas consume jobs
Bot → Telegram API + API
```
