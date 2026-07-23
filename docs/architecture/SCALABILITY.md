# ExpenseFlow — Scalability Strategy

Target: **millions of users**, sub-3s Telegram capture, sub-2s dashboard.

## Stateless Services

- API and workers hold no local session state
- Scale horizontally behind load balancer / NGINX
- Bot prefers **webhook** mode over long polling at scale

## Database

- UUID PKs
- Composite / partial indexes for common filters:
  - `(userId, createdAt DESC)` on transactions
  - `(walletId, createdAt DESC)`
  - `(userId, categoryId, createdAt)`
  - Budget and goal lookups by `userId`
- Soft-delete indexes respect `deletedAt IS NULL`
- Partition large tables by time (transactions) when volume warrants
- Read replicas for analytics/reports
- Connection pooling (PgBouncer or Sequelize pool tuning)

## Caching

- Redis cache for dashboard aggregates (short TTL + invalidate on write)
- Cache user settings / entitlement flags
- Avoid caching highly volatile per-transaction lists without careful keys

## Queues

- Separate BullMQ queues by workload class
- Priority for user-facing notifications vs batch reports
- Worker autoscaling based on queue depth
- Idempotent jobs to survive retries

## Storage

- Receipts and exports in S3 (not DB)
- Signed URLs for upload/download
- Lifecycle policies for old exports

## AI Cost & Latency

- Fast-path rules engine before calling OpenAI (regex/amount heuristics)
- Cache merchant → category mappings per user and globally
- Batch non-urgent insights
- Circuit breaker / fallback when OpenAI is slow

## Multi-Tenancy

- All queries scoped by `userId` (or wallet membership)
- Admin routes isolated with role checks
- Feature flags for gradual rollouts

## Observability (planned)

- Structured logs with `requestId`
- Metrics: latency, error rate, queue lag, DB pool
- Health endpoints for API, worker, bot, Redis, Postgres
- Alerting on budget-critical failures (notification queue backlog)

## Capacity Sketch (illustrative)

| Layer | Scale lever |
|-------|-------------|
| API | Add replicas; tune pool size |
| Worker | Add consumers per queue |
| Postgres | Vertical → replicas → partition |
| Redis | Cluster / managed |
| Bot | Webhook + multiple instances with sticky considerations via Telegram |
