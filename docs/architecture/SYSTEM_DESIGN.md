# ExpenseFlow — System Design

## 1. Backend (NestJS)

### Layered Structure

```
Controller  →  validates input (DTO + ValidationPipe)
     ↓
Service     →  business rules, orchestration
     ↓
Repository  →  Sequelize queries (no business logic)
     ↓
Model       →  table mapping, associations
```

### Cross-Cutting Concerns (`backend/src/common/`)

| Concern | Implementation |
|---------|----------------|
| Auth | JWT Guard, Telegram Login Guard, Refresh Token rotation |
| Authorization | Roles Guard, Subscription Guard, Wallet Permission Guard |
| Validation | Global `ValidationPipe` (whitelist, transform, forbidNonWhitelisted) |
| Errors | Global Exception Filter → consistent `{ statusCode, message, error, requestId }` |
| Logging | Request ID interceptor + structured logger |
| Security | Helmet, rate limiting (Throttler), CSRF for cookie flows |
| Pagination | Shared `PaginationDto` + meta response helper |

### Module Layout (per domain)

```
modules/<name>/
  <name>.module.ts
  <name>.controller.ts
  <name>.service.ts
  dto/
  interfaces/
  <name>.controller.spec.ts
  <name>.service.spec.ts
```

Repositories live under `database/repositories/` and are injected into services.

### API Conventions

- Base path: `/api/v1`
- Auth header: `Authorization: Bearer <accessToken>`
- Pagination: `?page=1&limit=20`
- Filtering: query params (e.g. `walletId`, `categoryId`, `from`, `to`)
- Sorting: `?sortBy=createdAt&sortOrder=DESC`
- Search: `?q=coffee`
- Soft-deleted records excluded by default; admin may include with explicit flag

### Authentication Flow

```
1. User opens Telegram Login Widget (web) OR /start on bot
2. Telegram provides auth payload (hash-verified)
3. API upserts User + creates Session
4. Issues accessToken (short-lived) + refreshToken (httpOnly / stored hashed)
5. Subsequent requests use JWT Guard
6. Refresh rotates tokens; revoked sessions rejected
```

---

## 2. Frontend (React + Vite)

### Structure

- **`features/`** — Domain feature folders (auth, expenses, dashboard, …)
- **`components/`** — Shared UI, charts, forms, layout
- **`services/`** — Axios API clients
- **`stores/`** — Zustand (auth session, UI theme, preferences)
- **`hooks/`** — React Query wrappers and shared hooks

### Data Fetching

- **React Query** for server state (caching, stale-while-revalidate)
- **Zustand** for client UI state only (theme, sidebar, draft forms)
- Dashboard aggregates use dedicated endpoints with Redis-backed caching on the API

### Routing

- Public: Login
- Protected: Dashboard, Expenses, Income, Wallets, Budgets, Goals, Reports, Settings
- Admin: Users, Subscriptions, Revenue, Feature Flags, Tickets, Health

---

## 3. Telegram Bot

### Responsibilities

1. Parse natural language expense/income messages
2. Confirm when confidence is low
3. Persist via internal API (service-to-service JWT or shared secret)
4. Surface reports, budgets, goals, wallets via slash commands

### Message Pipeline

```
User message
  → Middleware (auth / rate limit / user resolve)
  → NLP / AI parser (OpenAI) → structured TransactionDraft
  → Confidence check
       high → save + ack
       low  → inline keyboard confirm / edit
  → Optional: enqueue AI enrichment job (category refine, duplicate check)
```

### Commands

`/start` `/help` `/settings` `/report` `/budget` `/goals` `/wallets` `/export` `/categories`

---

## 4. Worker (BullMQ)

### Queues

| Queue | Jobs |
|-------|------|
| `ai` | Categorize, predict, insights, anomaly, duplicate, recurring detect, NLP |
| `ocr` | Receipt scan, itemize, suggest category |
| `notifications` | Telegram, email, push, digests, budget/goal alerts |
| `exports` | CSV, Excel, PDF generation → S3 → notify |
| `reports` | Scheduled weekly/monthly/annual report generation |
| `billing` | Subscription renewals, entitlement sync |

### Worker Design

- Idempotent processors (jobId = entity + action + version)
- Retries with exponential backoff
- Dead-letter / failed job inspection
- Horizontal scale by adding worker replicas

---

## 5. Shared Package

Published/consumed as workspace package `@expenseflow/shared`:

- Enums: `TransactionType`, `WalletType`, `BudgetPeriod`, `SubscriptionPlan`, `Role`
- DTOs / Zod or class-validator schemas where shared
- Constants: currencies, default categories, budget thresholds (50/75/90/100)
- Utility helpers: money formatting, date ranges

---

## 6. Data Stores

| Store | Use |
|-------|-----|
| **PostgreSQL** | Source of truth — users, wallets, transactions, budgets, goals, subscriptions |
| **Redis** | Sessions, rate limits, cache (dashboard aggregates), BullMQ |
| **S3-compatible** | Receipts, exports, avatars |

---

## 7. External Integrations

| Service | Purpose |
|---------|---------|
| Telegram Bot API | Messaging, login widget verification |
| OpenAI API | NLP parse, categorization, insights, OCR assist |
| SMTP / Email provider | Email notifications |
| Web Push (VAPID) | Browser notifications |
| S3 | Object storage |

---

## 8. Deployment Topology (Docker Compose → Production)

**Local / staging (Compose):**

- `postgres`, `redis`, `api`, `worker`, `bot`, `frontend`, `nginx`, `minio` (S3)

**Production scale-out:**

- API: N replicas behind NGINX/ALB
- Worker: M replicas per queue priority
- Bot: 1–N (webhook mode preferred at scale)
- Managed Postgres + Redis + S3
- Optional read replicas for reports/analytics
