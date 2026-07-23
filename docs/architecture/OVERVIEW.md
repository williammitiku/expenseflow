# ExpenseFlow — Architecture Overview

**ExpenseFlow** is an AI-powered Personal Finance Platform designed to scale to millions of users. Users capture expenses in under 3 seconds via Telegram, and manage their finances through a responsive web dashboard.

---

## System Components

| Component | Path | Responsibility |
|-----------|------|----------------|
| **REST API** | `backend/` | NestJS application — auth, domain logic, persistence, Swagger |
| **Web Dashboard** | `frontend/` | React + Vite SPA — analytics, CRUD, settings, admin |
| **Telegram Bot** | `telegram-bot/` | Fast expense capture via natural language |
| **Background Worker** | `worker/` | BullMQ processors — AI, OCR, exports, notifications, reports |
| **Shared Library** | `shared/` | Types, enums, DTOs, validators, constants |
| **NGINX** | `nginx/` | Reverse proxy, TLS termination, static assets, rate limits |
| **Infrastructure** | `infrastructure/` | Docker, monitoring, deployment configs |
| **Deploy guide** | `docs/guides/DEPLOY.md` | Neon + Vercel + Railway (free-tier) |

---

## High-Level Architecture

```
                         ┌─────────────────┐
                         │     Clients     │
                         │ Telegram │ Web  │
                         └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │      NGINX      │
                         │  TLS / Proxy    │
                         └────────┬────────┘
              ┌───────────────────┼───────────────────┐
              │                   │                   │
     ┌────────▼────────┐ ┌────────▼────────┐ ┌────────▼────────┐
     │  Telegram Bot   │ │   NestJS API    │ │  React Frontend │
     │  (Node.js)      │ │   (REST + JWT)  │ │  (Vite SPA)     │
     └────────┬────────┘ └────────┬────────┘ └─────────────────┘
              │                   │
              │          ┌────────┼────────┐
              │          │        │        │
              │   ┌──────▼──┐ ┌───▼───┐ ┌──▼──────┐
              │   │PostgreSQL│ │ Redis │ │  S3     │
              │   │          │ │+BullMQ│ │ Storage │
              │   └─────────┘ └───┬───┘ └─────────┘
              │                   │
              │          ┌────────▼────────┐
              └──────────►  Worker Pool    │
                         │  BullMQ Jobs    │
                         │  AI / OCR /     │
                         │  Notify / Export│
                         └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │  OpenAI API     │
                         │  Email / Push   │
                         └─────────────────┘
```

---

## Design Principles

1. **SOLID** — Single responsibility modules; depend on abstractions (repositories, interfaces).
2. **Repository Pattern** — Data access isolated from business logic.
3. **Service Layer** — Domain rules live in services; controllers stay thin.
4. **Event-Driven Jobs** — Heavy work (AI, OCR, exports, digests) runs asynchronously via BullMQ.
5. **Shared Contracts** — `shared/` is the single source of truth for types and enums across services.
6. **API Versioning** — All public endpoints under `/api/v1`.
7. **Soft Deletes** — All user-facing entities use `deletedAt` (paranoid mode).
8. **UUID Primary Keys** — Globally unique identifiers for all entities.
9. **Horizontal Scalability** — Stateless API and worker processes; session state in Redis.

---

## Latency Targets

| Flow | Target |
|------|--------|
| Telegram expense capture (happy path) | < 3 seconds end-to-end |
| Dashboard initial load (cached aggregates) | < 2 seconds |
| API p95 (CRUD, authenticated) | < 200 ms |
| AI categorization (async job) | < 5 seconds typical |

---

## Build Order

Modules are implemented **one at a time**. Do not start the next module until the current one is complete (code, tests, docs).

See [MODULE_MAP.md](./MODULE_MAP.md) for the ordered build plan.
