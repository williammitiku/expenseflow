# Telegram bot setup

Bot: [@expense_flow_manage_bot](https://t.me/expense_flow_manage_bot)

## Configure (local)

Root `.env` (gitignored):

```
TELEGRAM_BOT_TOKEN=<from BotFather>
TELEGRAM_BOT_USERNAME=expense_flow_manage_bot
```

Frontend `.env`:

```
VITE_TELEGRAM_BOT_USERNAME=expense_flow_manage_bot
```

**Never put the bot token in frontend env or commit it.**

## BotFather checklist

1. `/setdomain` → set the domain that serves the web app (for Login Widget)
2. For local Login Widget testing, use HTTPS tunnel (e.g. ngrok) and set that domain
3. Open the bot once and tap **Start**

## Run

```bash
# API + web
pnpm dev

# Bot (separate terminal)
pnpm dev:bot
```

## Security

If a bot token was shared in chat or committed, revoke it with BotFather (`/revoke`) and create a new token immediately.
