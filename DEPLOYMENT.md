# 🚀 Omnex Study — Деплой и миграция

## Пререквизиты

- **Docker** >= 24.0 и **Docker Compose** >= 2.0
- Домен с DNS записью, указывающей на сервер
- SSL сертификат (Let's Encrypt или свой)
- Минимум 2 GB RAM, 20 GB диска

---

## Быстрый деплой (5 минут)

### 1. Клонируйте репозиторий на сервер

```bash
git clone <repo-url> /opt/omnex-study
cd /opt/omnex-study
```

### 2. Создайте `.env.production`

```bash
cp .env.production.example .env.production
nano .env.production
```

Заполните **обязательные** поля:

| Переменная | Что указать |
|---|---|
| `DOMAIN` | Ваш домен (без https://) |
| `FRONTEND_URL` | `https://ваш-домен.com` |
| `NEXT_PUBLIC_API_URL` | `https://ваш-домен.com/api/v1` |
| `NEXT_PUBLIC_APP_URL` | `https://ваш-домен.com` |
| `POSTGRES_PASSWORD` | Сложный пароль для БД |
| `REDIS_PASSWORD` | Сложный пароль для Redis |
| `JWT_SECRET` | Случайная строка 64+ символов |
| `JWT_REFRESH_SECRET` | Другая случайная строка 64+ символов |

> [!TIP]
> Генерация ключей: `openssl rand -hex 32`

### 3. Настройте SSL

```bash
mkdir -p ssl

# Вариант 1: Let's Encrypt (бесплатно)
apt install certbot
certbot certonly --standalone -d ваш-домен.com
cp /etc/letsencrypt/live/ваш-домен.com/fullchain.pem ssl/
cp /etc/letsencrypt/live/ваш-домен.com/privkey.pem ssl/

# Вариант 2: Свои сертификаты
cp /path/to/fullchain.pem ssl/
cp /path/to/privkey.pem ssl/
```

### 4. Запустите

```bash
chmod +x deploy.sh
./deploy.sh
```

Или без скрипта:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

---

## 🔄 Миграция на другой домен

**Нужно изменить только `.env.production`** — код менять НЕ нужно.

### Шаг 1: Обновите `.env.production`

Замените все URL на новый домен:

```bash
DOMAIN=newdomain.com
FRONTEND_URL=https://newdomain.com
NEXT_PUBLIC_API_URL=https://newdomain.com/api/v1
NEXT_PUBLIC_APP_URL=https://newdomain.com
GOOGLE_CALLBACK_URL=https://newdomain.com/auth/callback?provider=google
VK_CALLBACK_URL=https://newdomain.com/auth/callback?provider=vk
YANDEX_CALLBACK_URL=https://newdomain.com/auth/callback?provider=yandex
```

### Шаг 2: Обновите OAuth у провайдеров

| Провайдер | Консоль | Что менять |
|---|---|---|
| Google | [console.cloud.google.com](https://console.cloud.google.com/apis/credentials) | Redirect URI |
| VK | [dev.vk.com](https://dev.vk.com/) | Redirect URL |
| Yandex | [oauth.yandex.ru](https://oauth.yandex.ru/) | Callback URL |

### Шаг 3: Обновите SSL

```bash
certbot certonly --standalone -d newdomain.com
cp /etc/letsencrypt/live/newdomain.com/fullchain.pem ssl/
cp /etc/letsencrypt/live/newdomain.com/privkey.pem ssl/
```

### Шаг 4: Перезапустите

```bash
./deploy.sh --build
```

---

## 🔄 Миграция на другой сервер

### 1. На старом сервере — бэкап данных

```bash
# Бэкап PostgreSQL
docker exec omnex-postgres pg_dump -U omnex_user omnex_db > backup.sql

# Скопируйте на новый сервер
scp backup.sql .env.production ssl/ user@new-server:/opt/omnex-study/
```

### 2. На новом сервере

```bash
git clone <repo-url> /opt/omnex-study
cd /opt/omnex-study

# Скопируйте .env.production и ssl/ с бэкапа

# Запустите инфраструктуру
./deploy.sh

# Восстановите БД
cat backup.sql | docker exec -i omnex-postgres psql -U omnex_user omnex_db
```

### 3. Обновите DNS

Укажите A-запись домена на IP нового сервера.

---

## Полезные команды

```bash
# Логи всех сервисов
docker compose -f docker-compose.prod.yml logs -f

# Логи конкретного сервиса
docker compose -f docker-compose.prod.yml logs -f backend

# Перезапуск
docker compose -f docker-compose.prod.yml --env-file .env.production restart

# Остановка
./deploy.sh --down

# Обновление кода
git pull
./deploy.sh --build

# Миграции БД (вручную)
docker exec omnex-backend npx prisma migrate deploy

# Prisma Studio (отладка БД)
docker exec -it omnex-backend npx prisma studio
```

---

## Структура production файлов

```
project/
├── docker-compose.prod.yml    # Full-stack compose
├── .env.production.example    # Шаблон переменных
├── .env.production            # Ваши переменные (не в git!)
├── deploy.sh                  # Скрипт деплоя
├── ssl/                       # SSL сертификаты (не в git!)
│   ├── fullchain.pem
│   └── privkey.pem
├── backend/
│   ├── Dockerfile
│   └── docker/nginx/          # Nginx конфигурация
└── nextjs-app/
    └── Dockerfile
```
