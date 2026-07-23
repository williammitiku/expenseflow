# Deploy ExpenseFlow (Neon + Vercel + Railway)

Free-tier friendly layout:

| Piece | Platform | Notes |
|-------|----------|--------|
| Postgres | [Neon](https://neon.tech) | Free serverless Postgres |
| Redis | [Upstash](https://upstash.com) | Free Redis (health checks + future queues) |
| Web app | [Vercel](https://vercel.com) | Vite SPA |
| API | [Railway](https://railway.app) | NestJS container |
| Telegram bot | Railway | Long-polling worker (second service) |

Local Docker Postgres/Redis are fine for development; production uses Neon + Upstash.

---

## 1. Neon (database)

1. Create a project at https://console.neon.tech
2. Copy the **connection string** (pooled is fine for the API):
   `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`
3. Set it as `DATABASE_URL` on Railway (API service).

Migrations run automatically when the API container starts (`sequelize-cli db:migrate`).

To migrate from your laptop against Neon:

```bash
export DATABASE_URL='postgresql://...neon.tech/neondb?sslmode=require'
pnpm db:migrate
```

---

## 2. Upstash (Redis)

1. Create a Redis database at https://console.upstash.com
2. Copy the **Redis URL** (`rediss://...`)
3. Set `REDIS_URL` on the Railway API service

The API health endpoint reports Redis status. Core CRUD works without Redis today; keep it wired so health and future workers stay green.

---

## 3. Railway — API

1. New project → **Deploy from GitHub** (this repo)
2. Add a service, set:
   - **Root Directory**: leave empty / monorepo root
   - Config uses root `railway.toml` → `backend/Dockerfile`
   - Or set Dockerfile path manually to `backend/Dockerfile`
3. Generate a public HTTPS domain for the service
4. Set variables (see checklist below)
5. Deploy — watch logs for migrate + `ExpenseFlow API listening`

Health check path: `/api/v1/health`

---

## 4. Railway — Telegram bot

1. In the **same** Railway project, add a second service
2. **Dockerfile path**: `telegram-bot/Dockerfile`
3. Set bot env vars (same `INTERNAL_API_KEY`, `API_BASE_URL` pointing at the API public URL)
4. Deploy — bot uses **long polling** (no webhook URL required on free tier)

`API_BASE_URL` example: `https://your-api.up.railway.app/api/v1`

---

## 5. Vercel — frontend

1. Import the GitHub repo in Vercel
2. **Root Directory**: `frontend`
3. Framework: Vite (auto via `vercel.json`)
4. Environment variables:

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://your-api.up.railway.app/api/v1` |
| `VITE_TELEGRAM_BOT_USERNAME` | your bot username (no `@`) |

Do **not** set `VITE_INTERNAL_API_KEY` in production — the dashboard should use Telegram login / JWT only. The internal key is for the bot and server-to-server calls.

5. Deploy, then copy the Vercel URL (e.g. `https://expenseflow.vercel.app`)

---

## 6. Wire CORS, app URL, BotFather

On the **API** Railway service:

```text
CORS_ORIGINS=https://expenseflow.vercel.app
APP_URL=https://expenseflow.vercel.app
```

In [@BotFather](https://t.me/BotFather):

- `/setdomain` → your Vercel host (`expenseflow.vercel.app`) for the Login Widget
- Keep the same bot token as `TELEGRAM_BOT_TOKEN`

On the **bot** service:

```text
APP_URL=https://expenseflow.vercel.app
API_BASE_URL=https://your-api.up.railway.app/api/v1
```

---

## Environment checklist

### API (Railway)

```bash
NODE_ENV=production
DATABASE_URL=postgresql://...@....neon.tech/neondb?sslmode=require
REDIS_URL=rediss://default:...@....upstash.io:6379
JWT_ACCESS_SECRET=...   # long random
JWT_REFRESH_SECRET=...  # long random
INTERNAL_API_KEY=...    # same value on bot
TELEGRAM_BOT_TOKEN=...
TELEGRAM_BOT_USERNAME=...
CORS_ORIGINS=https://your-app.vercel.app
APP_URL=https://your-app.vercel.app
DEFAULT_CURRENCY=ETB
DEFAULT_TIMEZONE=Africa/Addis_Ababa
```

Railway sets `PORT` automatically; the API reads `PORT`.

### Bot (Railway)

```bash
NODE_ENV=production
TELEGRAM_BOT_TOKEN=...
TELEGRAM_BOT_USERNAME=...
API_BASE_URL=https://your-api.up.railway.app/api/v1
INTERNAL_API_KEY=...    # must match API
APP_URL=https://your-app.vercel.app
```

### Web (Vercel)

```bash
VITE_API_URL=https://your-api.up.railway.app/api/v1
VITE_TELEGRAM_BOT_USERNAME=your_bot_username
```

---

## Local development with Neon (optional)

You can keep Docker Redis and point only Postgres at Neon:

```bash
# .env
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require
# leave REDIS_HOST=localhost for Docker Redis
```

Or keep full local Docker (`POSTGRES_*` on port 5433) as before — `DATABASE_URL` overrides discrete `POSTGRES_*` when set.

---

## Free-tier caveats

- **Railway**: trial/credits; sleep/idle policies change over time — check current pricing
- **Neon**: free project may suspend after inactivity; first request can be slow (cold start)
- **Upstash**: free command limits — fine for health + light use
- **Vercel**: hobby plan is enough for the SPA
- Worker (`worker/`) is not required for MVP deploy; add later when you need queues/OCR

---

## Verify

1. `GET https://your-api.up.railway.app/api/v1/health` → postgres + redis `up`
2. Open the Vercel site → Telegram login works
3. Message the bot → expense saves and shows on the dashboard
