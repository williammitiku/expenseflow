# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS build
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY shared/package.json ./shared/
COPY telegram-bot/package.json ./telegram-bot/
RUN pnpm install --filter @expenseflow/telegram-bot... --frozen-lockfile || pnpm install --filter @expenseflow/telegram-bot...
COPY shared ./shared
COPY telegram-bot ./telegram-bot
COPY tsconfig.base.json ./
RUN pnpm --filter @expenseflow/shared build && pnpm --filter @expenseflow/telegram-bot build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/shared ./shared
COPY --from=build /app/telegram-bot/dist ./telegram-bot/dist
COPY --from=build /app/telegram-bot/package.json ./telegram-bot/package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/telegram-bot/node_modules ./telegram-bot/node_modules
WORKDIR /app/telegram-bot
CMD ["node", "dist/main.js"]
