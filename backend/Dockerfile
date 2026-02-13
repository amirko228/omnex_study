# ============================================================================
# PRODUCTION DOCKERFILE — Многоэтапная сборка NestJS
# Оптимизирован для размера и безопасности
# ============================================================================

# --- Этап 1: Установка зависимостей ---
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm ci --only=production && \
    npx prisma generate

# --- Этап 2: Сборка TypeScript ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm ci

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src/

RUN npx prisma generate && \
    npm run build

# --- Этап 3: Production образ ---
FROM node:20-alpine AS runner
WORKDIR /app

# Безопасность: не запускаем от root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Копируем только необходимое
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

# Переключаемся на непривилегированного пользователя
USER nestjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/v1/health || exit 1

EXPOSE 4000

# Запуск с миграциями
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
