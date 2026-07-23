# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
RUN pnpm install --filter @expenseflow/api... --frozen-lockfile || pnpm install --filter @expenseflow/api...

FROM base AS build
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY shared ./shared
COPY backend ./backend
COPY tsconfig.base.json ./
RUN pnpm --filter @expenseflow/shared build && pnpm --filter @expenseflow/api build

FROM node:20-alpine AS runner
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=build /app/shared ./shared
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/package.json ./backend/package.json
COPY --from=build /app/backend/.sequelizerc ./backend/.sequelizerc
COPY --from=build /app/backend/src/database ./backend/src/database
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/node_modules ./backend/node_modules
WORKDIR /app/backend
EXPOSE 3000
CMD ["sh", "-c", "pnpm exec sequelize-cli db:migrate && node dist/main.js"]