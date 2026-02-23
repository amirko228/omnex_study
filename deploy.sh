#!/bin/bash
# ============================================================================
# Omnex Study — Скрипт деплоя
# Использование: ./deploy.sh [--build] [--down]
# ============================================================================

set -e

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

echo -e "${BLUE}🚀 Omnex Study — Деплой${NC}"
echo "================================================"

# --- Проверяем наличие .env.production ---
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Файл $ENV_FILE не найден!${NC}"
    echo -e "${YELLOW}Скопируйте шаблон: cp .env.production.example .env.production${NC}"
    echo -e "${YELLOW}И заполните все переменные.${NC}"
    exit 1
fi

# --- Загружаем переменные ---
source "$ENV_FILE"

# --- Проверяем обязательные переменные ---
REQUIRED_VARS=(
    "DOMAIN"
    "FRONTEND_URL"
    "POSTGRES_PASSWORD"
    "REDIS_PASSWORD"
    "JWT_SECRET"
    "JWT_REFRESH_SECRET"
)

MISSING=0
for var in "${REQUIRED_VARS[@]}"; do
    val=$(eval echo \$$var)
    if [ -z "$val" ] || [[ "$val" == *"CHANGE_ME"* ]]; then
        echo -e "${RED}❌ Переменная $var не задана или содержит CHANGE_ME${NC}"
        MISSING=1
    fi
done

if [ "$MISSING" -eq 1 ]; then
    echo -e "${RED}Заполните все обязательные переменные в $ENV_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Конфигурация проверена${NC}"
echo -e "   Домен: ${BLUE}${DOMAIN}${NC}"
echo -e "   Frontend: ${BLUE}${FRONTEND_URL}${NC}"

# --- Проверяем SSL сертификаты ---
if [ ! -d "ssl" ] || [ ! -f "ssl/fullchain.pem" ]; then
    echo -e "${YELLOW}⚠️  SSL сертификаты не найдены в ./ssl/${NC}"
    echo -e "${YELLOW}   Создайте папку ssl/ и поместите туда fullchain.pem и privkey.pem${NC}"
    echo -e "${YELLOW}   Или используйте Let's Encrypt (см. DEPLOYMENT.md)${NC}"
    echo ""
    read -p "Продолжить без SSL? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# --- Обработка флагов ---
if [ "$1" == "--down" ]; then
    echo -e "${YELLOW}⏹️  Останавливаем сервисы...${NC}"
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down
    echo -e "${GREEN}✅ Сервисы остановлены${NC}"
    exit 0
fi

# --- Деплой ---
echo -e "${BLUE}🔨 Собираем и запускаем сервисы...${NC}"

BUILD_FLAG=""
if [ "$1" == "--build" ] || [ "$1" == "" ]; then
    BUILD_FLAG="--build"
fi

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d $BUILD_FLAG

echo ""
echo -e "${GREEN}✅ Деплой завершён!${NC}"
echo "================================================"
echo -e "🌐 Сайт:     ${BLUE}https://${DOMAIN}${NC}"
echo -e "🔧 API:      ${BLUE}https://${DOMAIN}/api/v1${NC}"
echo ""
echo -e "📋 Логи:     docker compose -f $COMPOSE_FILE logs -f"
echo -e "⏹️  Стоп:     ./deploy.sh --down"
echo "================================================"
