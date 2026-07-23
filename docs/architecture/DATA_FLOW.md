# ExpenseFlow — Data Flow

## 1. Telegram Quick Expense (Happy Path)

```
User: "Coffee 250"
        │
        ▼
┌───────────────────┐
│ Telegram Bot      │
│ Resolve user by   │
│ telegramId        │
└─────────┬─────────┘
          │ enqueue or call AI parse
          ▼
┌───────────────────┐
│ AI NLP Parser     │
│ type=expense      │
│ amount=250        │
│ currency=ETB      │
│ merchant=Coffee   │
│ category=?        │
│ confidence=0.92   │
└─────────┬─────────┘
          │ confidence ≥ threshold
          ▼
┌───────────────────┐
│ POST /api/v1/     │
│ expenses          │
│ (service auth)    │
└─────────┬─────────┘
          │
          ├─► PostgreSQL (transaction row)
          ├─► Redis invalidate dashboard cache
          └─► BullMQ: ai.enrich (optional refine)
          │
          ▼
     Bot replies: "✅ Saved Coffee — 250 ETB"
```

## 2. Uncertain Parse (Confirmation)

```
User: "Paid something 18000"
        │
        ▼
AI confidence < threshold
        │
        ▼
Bot sends inline keyboard:
  [Confirm] [Edit amount] [Edit category] [Cancel]
        │
User taps Confirm
        │
        ▼
Save expense → ack
```

## 3. Web Dashboard Load

```
Browser
  │ GET /api/v1/analytics/dashboard?period=month
  ▼
API JWT Guard
  │
  ├─ Cache hit (Redis) → return aggregates (<50ms)
  │
  └─ Cache miss
       │ Sequelize aggregate queries (indexed)
       │ Store Redis TTL (e.g. 60s)
       └─ Return payload
            │
            ▼
React Query cache → charts render
```

## 4. Receipt OCR

```
User uploads receipt (web or bot)
  │
  ▼
Uploads module → S3 object key
  │
  ▼
Enqueue ocr.scan { receiptId, s3Key, userId }
  │
  ▼
Worker: OCR + AI extract
  merchant, date, items, tax, total, suggestedCategory
  │
  ▼
Persist OCR result; notify user
User confirms → create expense
```

## 5. Budget Threshold Alert

```
Expense saved
  │
  ▼
Service updates budget spent
  │
  ▼
Crossed 50% / 75% / 90% / 100%?
  │ yes
  ▼
Enqueue notifications.budget_alert
  │
  ▼
Worker sends Telegram + Email + Push (per user prefs)
```

## 6. Export Report

```
User: Export monthly PDF
  │
  ▼
API creates ExportJob (pending)
Enqueue exports.pdf
  │
  ▼
Worker generates file → S3
Update job (ready) + signed URL
  │
  ▼
Notify user (in-app / Telegram)
```

## 7. Auth Token Refresh

```
Access token expired
  │
  ▼
POST /api/v1/auth/refresh { refreshToken }
  │
  ▼
Validate session in Redis/DB
Rotate refresh token
Issue new access + refresh
Revoke old refresh
```

## 8. Shared Wallet Write

```
Member posts expense on family wallet
  │
  ▼
WalletPermissionGuard
  role ∈ { Owner, Admin } for writes
  Viewer → 403
  │
  ▼
Save transaction (walletId + createdByUserId)
Invalidate caches for all members
```
