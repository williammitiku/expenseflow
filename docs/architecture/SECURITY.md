# ExpenseFlow — Security Architecture

## Principles

- Least privilege for services and DB roles
- Defense in depth (edge → app → data)
- Never trust client input
- Secrets only via environment / secret manager — never in git
- Audit sensitive actions

## Edge (NGINX)

- TLS termination
- Request size limits
- Basic rate limiting / connection limits
- Security headers forwarded/enforced

## Application

| Control | Implementation |
|---------|----------------|
| Helmet | HTTP security headers |
| Rate limiting | Global + stricter auth endpoints (Redis-backed) |
| CSRF | For cookie-based flows; Bearer JWT APIs are CSRF-resistant by design |
| XSS | Output encoding on frontend; sanitize rich text if ever introduced |
| SQL Injection | Sequelize parameterized queries only — no raw string concatenation |
| Validation | DTOs + class-validator whitelist |
| CORS | Explicit allowed origins |
| Auth | JWT access (short TTL) + rotating refresh tokens |
| Telegram Login | Verify `hash` with bot token per Telegram docs |
| Subscriptions | Feature guards on Premium-only routes |
| Shared wallets | Role-based permission guards |

## Sessions

- Refresh tokens stored hashed
- Session revocation list / DB session rows
- Logout invalidates session
- Optional device metadata for admin/support

## Secrets

- `.env` local only; `.env.example` committed without values
- Production: Docker secrets / cloud secret manager
- Encrypt sensitive fields at rest where required (e.g. tokens)

## Audit Logs

Record at minimum:

- Login / logout / refresh / failed auth
- Subscription changes
- Admin actions
- Permission changes on shared wallets
- Export of personal data

## Soft Delete & Privacy

- Soft delete user-facing records
- Hard-delete / anonymization path for GDPR-style requests (future admin tooling)

## Bot Security

- Webhook secret validation
- Per-user rate limits
- Service-to-service auth between bot and API
- Never expose admin endpoints to bot token alone
