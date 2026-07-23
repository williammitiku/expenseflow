# Auth Module

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/telegram` | public | Telegram Login Widget verify + session |
| POST | `/api/v1/auth/dev-login` | public (non-prod) | Demo login for local development |
| POST | `/api/v1/auth/refresh` | public | Rotate refresh token |
| POST | `/api/v1/auth/logout` | public | Revoke refresh session |
| GET | `/api/v1/auth/me` | Bearer JWT | Current user |

## Tokens

- **Access JWT** — short-lived (`JWT_ACCESS_TTL`, default `15m`), includes `sub`, `role`, `sessionId`
- **Refresh token** — opaque, stored as SHA-256 hash in `sessions`, rotated on refresh

## Protecting APIs

Domain routes use `JwtOrApiKeyGuard`:

1. `Authorization: Bearer <accessToken>` → scopes data to JWT user
2. or `x-internal-api-key` → service-to-service; pass `userId` explicitly

## Local login

```bash
curl -s -X POST http://localhost:3000/api/v1/auth/dev-login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@expenseflow.local"}'
```

Web: http://localhost:5173/login
