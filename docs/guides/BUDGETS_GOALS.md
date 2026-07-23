# Budgets & Goals

## Budgets
- Periods: `weekly` | `monthly` | `yearly`
- Optional filters: `categoryId`, `walletId`
- Alert thresholds default `[50, 75, 90, 100]`
- List/get responses include live progress:
  - `spent`, `remaining`, `percentUsed`, `status` (`ok` | `warning` | `critical` | `exceeded`)
  - `periodFrom` / `periodTo` for the active window

### API
- `POST /api/v1/budgets`
- `GET /api/v1/budgets`
- `GET /api/v1/budgets/:id`
- `PATCH /api/v1/budgets/:id`
- `DELETE /api/v1/budgets/:id`

Spent is the sum of **expense** transactions in the current period (respecting category/wallet filters).

## Goals
- Target vs current amount with `percentComplete`, `remaining`, `isComplete`, `daysLeft`
- `POST /api/v1/goals/:id/contribute` — adds savings; optional `walletId` debits the wallet and records an expense titled `Goal: …`

### API
- `POST /api/v1/goals`
- `GET /api/v1/goals`
- `POST /api/v1/goals/:id/contribute`
- `PATCH` / `DELETE` as usual

## UI
- **Finance** page: create wallets, transactions, budgets, goals; contribute to goals; progress bars
- **Dashboard**: month net, balances, budget/goal widgets

## Telegram
- Menu buttons **Budgets** / **Goals**
- Commands `/budgets` `/goals`
