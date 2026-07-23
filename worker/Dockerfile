# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS build
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY shared/package.json ./shared/
COPY worker/package.json ./worker/
RUN pnpm install --filter @expenseflow/worker... --frozen-lockfile || pnpm install --filter @expenseflow/worker...
COPY shared ./shared
COPY worker ./worker
COPY tsconfig.base.json ./
RUN pnpm --filter @expenseflow/shared build && pnpm --filter @expenseflow/worker build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/shared ./shared
COPY --from=build /app/worker/dist ./worker/dist
COPY --from=build /app/worker/package.json ./worker/package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/worker/node_modules ./worker/node_modules
WORKDIR /app/worker
CMD ["node", "dist/main.js"]
