# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS build
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/
RUN pnpm install --filter @expenseflow/web... --frozen-lockfile || pnpm install --filter @expenseflow/web...
COPY shared ./shared
COPY frontend ./frontend
COPY tsconfig.base.json ./
RUN pnpm --filter @expenseflow/shared build && pnpm --filter @expenseflow/web build

FROM nginx:1.27-alpine AS runner
COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
