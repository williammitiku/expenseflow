# ExpenseFlow — Module Map & Build Order

Modules are built **sequentially**. Each module must include: implementation, unit tests, integration tests where applicable, and a short module note in `docs/`.

---

## Phase 0 — Foundation

| # | Deliverable | Status |
|---|-------------|--------|
| 0.1 | Monorepo folder structure | ✅ Done |
| 0.2 | Architecture documentation | ✅ Done |
| 0.3 | Root README, `.gitignore`, env templates | ✅ Done |

---

## Phase 1 — Platform Core

| Order | Module | Scope | Status |
|-------|--------|-------|--------|
| 1 | **Project scaffolding** | NestJS, React/Vite, Docker Compose, shared package, env config | ✅ Done |
| 2 | **Database foundation** | Sequelize setup, base model (UUID + soft delete + timestamps), migrations runner | ✅ Done |
| 3 | **Users** | User model, repository, service, CRUD (internal) | ✅ Done |
| 4 | **Auth** | Telegram Login, JWT access/refresh, sessions, guards | ✅ Done |
| — | **Core finance schema + APIs** | Categories, wallets, transactions, budgets, goals, … | ✅ Done |
| 5 | **Health & Observability** | Health checks, request IDs, global filters, Helmet, throttling | ✅ Done (incl. Postgres/Redis checks) |

---

## Phase 2 — Finance Domain

| Order | Module | Scope |
|-------|--------|-------|
| 6 | **Categories & Tags** | Defaults, user custom, seeders |
| 7 | **Wallets** | Types (Cash, Bank, Telebirr, CBE, …), CRUD, balances |
| 8 | **Transactions core** | Unified expense/income model or linked tables, soft delete |
| 9 | **Expenses** | Full CRUD, notes, merchant, location, attachments metadata |
| 10 | **Income** | Salary, bonus, gift, investment, freelance, interest, other |
| 11 | **Recurring** | Schedules, next-run worker job |
| 12 | **Transfers, Splits, Refunds** | Cross-wallet transfer, split parties, refund links |

---

## Phase 3 — Planning & Insights

| Order | Module | Scope |
|-------|--------|-------|
| 13 | **Budgets** | Periods, by category/wallet, threshold alerts (50/75/90/100) |
| 14 | **Goals** | Targets, auto progress from savings rules |
| 15 | **Analytics** | Dashboard aggregates (today/week/month/year, cash flow) |
| 16 | **Reports** | Monthly/weekly/annual/merchant/category/wallet reports |
| 17 | **Export** | CSV, Excel, PDF via worker + S3 |

---

## Phase 4 — AI & Media

| Order | Module | Scope |
|-------|--------|-------|
| 18 | **Uploads** | S3 signed URLs, receipt storage |
| 19 | **AI engine** | Categorization, NLP parse contract, duplicate/anomaly hooks |
| 20 | **OCR** | Receipt extraction pipeline |
| 21 | **Telegram Bot** | Commands, NLP capture, confirmations |
| 22 | **Notifications** | Telegram, email, push, digests |

---

## Phase 5 — Collaboration & Monetization

| Order | Module | Scope |
|-------|--------|-------|
| 23 | **Shared Wallets** | Family/couples/friends, Owner/Admin/Viewer |
| 24 | **Subscriptions** | Free vs Premium entitlements, guards |
| 25 | **Settings** | Preferences, currency, dark mode sync |
| 26 | **Admin Panel** | Users, revenue, flags, tickets, logs, health |
| 27 | **Audit Logs** | Security-sensitive action trail |

---

## Phase 6 — Frontend Completion

| Order | Module | Scope |
|-------|--------|-------|
| 28 | **Auth UI + Telegram Login** | |
| 29 | **Dashboard + Charts** | Pie, bar, line, calendar, heatmap |
| 30 | **Domain UIs** | Expenses, income, wallets, budgets, goals |
| 31 | **Reports & Export UI** | |
| 32 | **Settings, Dark Mode, Subscriptions** | |
| 33 | **Admin UI** | |

---

## Phase 7 — Hardening

| Order | Module | Scope |
|-------|--------|-------|
| 34 | **Security pass** | CSRF, XSS, SQLi review, secrets, rate limits |
| 35 | **Performance** | Indexes, cache, query optimization |
| 36 | **Load & chaos testing** | Scale assumptions for millions of users |
| 37 | **Production deployment docs** | NGINX, Docker, monitoring |

---

## Backend Module Directory Mapping

```
backend/src/modules/
  auth/            → Phase 1
  users/           → Phase 1
  categories/      → Phase 2
  tags/            → Phase 2
  wallets/         → Phase 2
  transactions/    → Phase 2
  expenses/        → Phase 2
  income/          → Phase 2
  recurring/       → Phase 2
  budgets/         → Phase 3
  goals/           → Phase 3
  analytics/       → Phase 3
  reports/         → Phase 3
  export/          → Phase 3
  uploads/         → Phase 4
  ai/              → Phase 4
  ocr/             → Phase 4
  notifications/   → Phase 4
  shared-wallets/  → Phase 5
  subscriptions/   → Phase 5
  settings/        → Phase 5
  admin/           → Phase 5
  audit/           → Phase 5
```

---

## Definition of Done (per module)

- [ ] Models + migrations (if data)
- [ ] Repository + Service + Controller (or worker/bot equivalent)
- [ ] DTOs + validation
- [ ] Guards/permissions applied
- [ ] Unit tests
- [ ] Integration or e2e smoke where critical
- [ ] Swagger docs updated (API modules)
- [ ] No duplicated logic (use `shared/` or `common/`)
