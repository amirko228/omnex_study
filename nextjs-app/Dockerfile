# ============================================================================
# PRODUCTION DOCKERFILE — Multi-stage Next.js build
# Оптимизирован для standalone output (минимальный образ)
# ============================================================================

# --- Этап 1: Установка зависимостей ---
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# --- Этап 2: Сборка Next.js ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (NEXT_PUBLIC_* нужны при сборке)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_VK_CLIENT_ID
ARG NEXT_PUBLIC_YANDEX_CLIENT_ID

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID}
ENV NEXT_PUBLIC_VK_CLIENT_ID=${NEXT_PUBLIC_VK_CLIENT_ID}
ENV NEXT_PUBLIC_YANDEX_CLIENT_ID=${NEXT_PUBLIC_YANDEX_CLIENT_ID}

RUN npm run build

# --- Этап 3: Production образ ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Безопасность: не запускаем от root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Копируем standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
