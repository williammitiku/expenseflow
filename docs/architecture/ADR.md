# Architecture Decision Records

ADRs will be added when a non-obvious technical choice is made (e.g. unified transactions table vs separate expense/income tables).

## Pending decisions for Phase 1–2

1. **Ledger model** — Prefer unified `transactions` table with `type` enum (documented in schema overview).
2. **Monorepo tooling** — npm/pnpm workspaces vs separate package.json per service (decide during scaffolding).
3. **Sequelize dialect config** — NestJS `@nestjs/sequelize` vs manual init (decide during scaffolding).
