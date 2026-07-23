# Database Foundation

## Stack

- PostgreSQL 16
- Sequelize 6 + `sequelize-typescript`
- `@nestjs/sequelize`
- `sequelize-cli` for migrations & seeders

## Conventions

| Concern | Rule |
|---------|------|
| Primary keys | UUID (`gen_random_uuid()` / Sequelize UUIDV4) |
| Timestamps | `created_at`, `updated_at` (underscored) |
| Soft delete | `deleted_at` + paranoid models |
| Schema changes | Migrations only — `synchronize: false` |
| Data access | Repository pattern (`BaseRepository`) |

## Key files

```
backend/src/database/
  database.module.ts
  sequelize.config.js
  models/base.model.ts
  models/schema-heartbeat.model.ts
  repositories/base.repository.ts
  migrations/
  seeders/
backend/.sequelizerc
```

## Commands

From repo root:

```bash
pnpm --filter @expenseflow/api db:migrate
pnpm --filter @expenseflow/api db:seed
pnpm --filter @expenseflow/api db:migrate:status
pnpm --filter @expenseflow/api db:migrate:undo
```

## First migration

`20260723120000-enable-extensions-and-heartbeat.js`

- Enables `pgcrypto`
- Creates `schema_heartbeats` (UUID + soft delete) as a smoke-test table

Domain tables (users, wallets, transactions, …) arrive in later modules and extend `BaseModel`.
