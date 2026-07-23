# ExpenseFlow

AI-powered Personal Finance Platform — Telegram Bot, Web Dashboard, REST API, Workers, and AI categorization.

Capture an expense in under **3 seconds**. Dashboard loads under **2 seconds**. Built to scale to millions of users.

---

## Architecture

Start here:

| Document | Description |
|----------|-------------|
| [Architecture Overview](docs/architecture/OVERVIEW.md) | Components, principles, latency targets |
| [System Design](docs/architecture/SYSTEM_DESIGN.md) | Backend layers, bot, worker, frontend |
| [Module Map & Build Order](docs/architecture/MODULE_MAP.md) | Sequential implementation plan |
| [Data Flow](docs/architecture/DATA_FLOW.md) | Key request/job pipelines |
| [Security](docs/architecture/SECURITY.md) | Auth, hardening, audit |
| [Scalability](docs/architecture/SCALABILITY.md) | Horizontal scale strategy |
| [Folder Structure](docs/architecture/FOLDER_STRUCTURE.md) | Monorepo layout |
| [Database Schema](docs/database/SCHEMA_OVERVIEW.md) | Logical ER design |
| [Deployment](docs/deployment/DEPLOYMENT.md) | Docker / NGINX topology |

---

## Repository Layout

```
backend/         NestJS REST API + Sequelize
frontend/        React + Vite + Tailwind dashboard
telegram-bot/    Natural-language expense capture
worker/          BullMQ jobs (AI, OCR, export, notify)
shared/          Shared types, enums, constants
docs/            Architecture & guides
nginx/           Reverse proxy
infrastructure/  Docker & monitoring
```

---

## Tech Stack

**Backend:** NestJS · Sequelize · PostgreSQL · Redis · BullMQ · JWT · Telegram Auth · OpenAI · S3 · Swagger · Docker  

**Frontend:** React · Vite · TypeScript · TailwindCSS · React Router · React Query · Zustand · React Hook Form · Recharts · Axios  

**Edge:** NGINX · Docker Compose  

---

## Current Status

**Phase 1.2 — Database foundation** ✅

- [x] Sequelize + Postgres (UUID base model, soft deletes, migrations)
- [x] Health checks for Postgres + Redis
- [x] Frontend AppShell, Dashboard stub, Health UI
- [ ] Users module — **next**

Postgres host port is **5433** (avoids clash with local Postgres on 5432).

```bash
pnpm db:migrate
pnpm db:seed
pnpm dev:api
pnpm dev:web
```

See [Database Foundation](docs/database/FOUNDATION.md).

---

## Development Principles

- SOLID, Repository Pattern, Service Layer, DTOs
- Validation pipes, guards, exception filters
- UUID primary keys, soft deletes, API versioning
- No duplicated domain logic — prefer `shared/` and `common/`
- Unit + integration tests per module

---

## License

Proprietary — All rights reserved.
