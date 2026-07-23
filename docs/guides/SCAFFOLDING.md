# Scaffolding guide — Phase 1.1

## Prerequisites

- Node.js 20+
- pnpm 9+ (`corepack enable`)
- Docker + Docker Compose (for infra)

## Install

```bash
cp .env.example .env   # if needed
pnpm install
pnpm build:shared
```

## Run locally (recommended for development)

```bash
# Infrastructure only (Postgres, Redis, MinIO)
docker compose up -d postgres redis minio minio-init

# App processes
pnpm dev:api
pnpm dev:web
pnpm dev:worker
pnpm dev:bot   # requires TELEGRAM_BOT_TOKEN
```

- API: http://localhost:3000/api/v1/health  
- Swagger: http://localhost:3000/api/docs  
- Web: http://localhost:5173  

## Full stack via Docker

```bash
docker compose --profile full up -d --build
```

NGINX gateway: http://localhost:8080

## Packages

| Package | Name |
|---------|------|
| shared | `@expenseflow/shared` |
| backend | `@expenseflow/api` |
| frontend | `@expenseflow/web` |
| telegram-bot | `@expenseflow/telegram-bot` |
| worker | `@expenseflow/worker` |
