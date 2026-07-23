# Core Finance Schema

Migration: `20260723160000-core-finance-schema.js`

## Tables created

| Table | Purpose |
|-------|---------|
| `sessions` | Auth refresh sessions (Auth module next) |
| `categories` | Expense/income categories (+ system seed) |
| `tags` | User tags |
| `wallets` | Cash/bank/Telebirr/… wallets |
| `wallet_members` | Shared wallet roles |
| `recurring_rules` | Recurring transaction templates |
| `transactions` | Unified ledger (expense/income/transfer/refund) |
| `transaction_tags` | M2M tags |
| `split_shares` | Split bills |
| `budgets` | Category/wallet budgets |
| `goals` | Savings goals |
| `receipts` | OCR receipt records |
| `notifications` | Outbound notifications |
| `subscriptions` | Free/Premium entitlements |
| `export_jobs` | CSV/Excel/PDF jobs |
| `feature_flags` | Admin flags |
| `support_tickets` | Support |
| `audit_logs` | Security audit trail |

## REST APIs (v1, `x-internal-api-key`)

All list/get/update/delete are scoped with `userId` until JWT Auth.

| Method | Path |
|--------|------|
| CRUD | `/api/v1/categories` |
| CRUD | `/api/v1/tags` |
| CRUD | `/api/v1/wallets` |
| CRUD | `/api/v1/transactions` (updates wallet balance) |
| CRUD | `/api/v1/budgets` |
| CRUD | `/api/v1/goals` |
| CRUD | `/api/v1/recurring` |
| CRUD | `/api/v1/notifications` |
| CRUD | `/api/v1/subscriptions` |
| CRUD | `/api/v1/users` |

Swagger: http://localhost:3000/api/docs
