# ExpenseFlow — Database Schema Overview

> Logical design. Physical Sequelize models and migrations are created in Phase 1–2 modules — not all at once.

## Conventions

- Primary key: `UUID` (`id`)
- Timestamps: `createdAt`, `updatedAt`
- Soft delete: `deletedAt` (paranoid)
- Money: store `amount` as `DECIMAL(18, 2)` + `currency` (`CHAR(3)` ISO)
- All tenant data filtered by `userId` or wallet membership

## Core Entities

### users
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| telegramId | BIGINT UNIQUE NULL | |
| username | STRING NULL | |
| firstName | STRING | |
| lastName | STRING NULL | |
| email | STRING UNIQUE NULL | |
| avatarUrl | STRING NULL | |
| role | ENUM | user, admin |
| preferredCurrency | CHAR(3) | default ETB |
| timezone | STRING | |
| settings | JSONB | preferences, dark mode, notify channels |
| deletedAt | DATE NULL | |

### sessions
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| userId | UUID FK | |
| refreshTokenHash | STRING | |
| userAgent | STRING NULL | |
| ip | STRING NULL | |
| expiresAt | DATE | |
| revokedAt | DATE NULL | |

### categories
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| userId | UUID NULL FK | null = system default |
| name | STRING | |
| type | ENUM | expense, income, both |
| icon | STRING NULL | |
| color | STRING NULL | |
| parentId | UUID NULL | hierarchy |
| isSystem | BOOLEAN | |

### tags
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| userId | UUID FK | |
| name | STRING | |

### wallets
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| userId | UUID FK | owner |
| name | STRING | |
| type | ENUM | cash, bank, telebirr, cbe, dashen, visa, mastercard, crypto, other |
| currency | CHAR(3) | |
| balance | DECIMAL | maintained or computed |
| isShared | BOOLEAN | |
| deletedAt | DATE NULL | |

### wallet_members (shared wallets)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| walletId | UUID FK | |
| userId | UUID FK | |
| role | ENUM | owner, admin, viewer |

### transactions
Unified ledger for expenses, income, transfers, refunds.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| userId | UUID FK | creator |
| walletId | UUID FK | |
| categoryId | UUID NULL FK | |
| type | ENUM | expense, income, transfer, refund |
| amount | DECIMAL | always positive; direction via type |
| currency | CHAR(3) | |
| merchant | STRING NULL | |
| note | TEXT NULL | |
| location | STRING NULL | |
| receiptImageKey | STRING NULL | S3 key |
| occurredAt | DATE | business date |
| transferWalletId | UUID NULL | for transfers |
| parentTransactionId | UUID NULL | refunds / splits parent |
| isRecurring | BOOLEAN | |
| recurringRuleId | UUID NULL | |
| metadata | JSONB | AI confidence, OCR ref, etc. |
| deletedAt | DATE NULL | |

### transaction_tags
M2M: `transactionId`, `tagId`

### split_shares
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| transactionId | UUID FK | |
| label | STRING | person/name |
| amount | DECIMAL | |
| settled | BOOLEAN | |

### recurring_rules
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| userId | UUID FK | |
| template | JSONB | amount, category, wallet, note |
| frequency | ENUM | daily, weekly, monthly, yearly |
| nextRunAt | DATE | |
| active | BOOLEAN | |

### budgets
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| userId | UUID FK | |
| name | STRING | |
| period | ENUM | weekly, monthly, yearly |
| amount | DECIMAL | |
| currency | CHAR(3) | |
| categoryId | UUID NULL | |
| walletId | UUID NULL | |
| alertThresholds | JSONB | [50,75,90,100] |
| startDate | DATE | |

### goals
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| userId | UUID FK | |
| name | STRING | Car, Vacation, … |
| targetAmount | DECIMAL | |
| currentAmount | DECIMAL | |
| currency | CHAR(3) | |
| deadline | DATE NULL | |
| walletId | UUID NULL | linked savings wallet |

### receipts / ocr_results
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| userId | UUID FK | |
| s3Key | STRING | |
| status | ENUM | pending, done, failed |
| extracted | JSONB | merchant, date, items, tax, total |
| suggestedCategoryId | UUID NULL | |
| transactionId | UUID NULL | after confirm |

### notifications
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| userId | UUID FK | |
| channel | ENUM | telegram, email, push, in_app |
| type | STRING | budget_alert, digest, … |
| payload | JSONB | |
| status | ENUM | pending, sent, failed |
| sentAt | DATE NULL | |

### subscriptions
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| userId | UUID FK UNIQUE | |
| plan | ENUM | free, premium |
| status | ENUM | active, canceled, past_due |
| currentPeriodEnd | DATE NULL | |
| providerRef | STRING NULL | |

### feature_flags
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| key | STRING UNIQUE | |
| enabled | BOOLEAN | |
| rules | JSONB | targeting |

### support_tickets
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| userId | UUID FK | |
| subject | STRING | |
| status | ENUM | open, pending, closed |
| body | TEXT | |

### audit_logs
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| actorUserId | UUID NULL | |
| action | STRING | |
| resource | STRING | |
| resourceId | UUID NULL | |
| ip | STRING NULL | |
| meta | JSONB | |
| createdAt | DATE | no soft delete |

### export_jobs
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| userId | UUID FK | |
| format | ENUM | csv, xlsx, pdf |
| status | ENUM | pending, ready, failed |
| s3Key | STRING NULL | |
| params | JSONB | date range, filters |

## Key Indexes (planned)

```
transactions (user_id, occurred_at DESC) WHERE deleted_at IS NULL
transactions (wallet_id, occurred_at DESC) WHERE deleted_at IS NULL
transactions (user_id, category_id, occurred_at) WHERE deleted_at IS NULL
transactions (user_id, type, occurred_at) WHERE deleted_at IS NULL
sessions (user_id), (refresh_token_hash)
wallets (user_id) WHERE deleted_at IS NULL
wallet_members (wallet_id, user_id) UNIQUE
budgets (user_id)
goals (user_id)
users (telegram_id) UNIQUE WHERE telegram_id IS NOT NULL
```

## ER Relationship Summary

```
User 1──* Wallet 1──* Transaction *──* Tag
User 1──* Category
User 1──* Budget
User 1──* Goal
User 1──1 Subscription
Wallet 1──* WalletMember *──1 User
Transaction 0──1 RecurringRule
Transaction 0──* SplitShare
User 1──* Notification
User 1──* AuditLog
```
