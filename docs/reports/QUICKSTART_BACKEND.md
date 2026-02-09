# 🚀 БЫСТРЫЙ СТАРТ - Интеграция Backend

## ⚡ Минимальная настройка (5 минут)

### Шаг 1: Создать .env.local файл

```bash
# Создайте файл .env.local в корне проекта
touch .env.local
```

```bash
# Минимальная конфигурация для разработки
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_AI_API_URL=http://localhost:3002/api/ai

# OpenAI API (для AI функций)
OPENAI_API_KEY=sk-your-openai-key-here

# Stripe (для тестовых платежей)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_your-test-key
STRIPE_SECRET_KEY=sk_test_your-test-key
```

---

## 🎯 ВАРИАНТЫ ИНТЕГРАЦИИ

### Вариант 1: Mock режим (БЕЗ backend) ✅ ТЕКУЩИЙ

**Что работает:**
- ✅ Все UI компоненты
- ✅ Mock данные
- ✅ Симуляция AI (mock responses)
- ✅ Локальное хранилище (localStorage)
- ✅ Все языки и переводы

**Ничего делать не нужно - проект уже работает!**

```bash
npm run dev
# Открыть http://localhost:3000
```

---

### Вариант 2: С реальным AI (только OpenAI)

**1. Получить OpenAI API ключ:**
- Зарегистрироваться на https://platform.openai.com
- Создать API key
- Добавить баланс ($5-10 для тестов)

**2. Обновить `/lib/ai/ai-service.ts`:**

```typescript
// Заменить mock функции на реальные вызовы
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async generateCourse(request: CourseGenerationRequest) {
  const prompt = this.buildCourseGenerationPrompt(request);
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are an expert course creator.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 4000
  });
  
  return JSON.parse(completion.choices[0].message.content);
}
```

**3. Установить зависимость:**
```bash
npm install openai
```

---

### Вариант 3: С полным Backend (Node.js + PostgreSQL)

#### 3.1. Backend на Express (простой)

**Создать папку `backend/`:**

```bash
mkdir backend
cd backend
npm init -y
npm install express cors dotenv pg bcrypt jsonwebtoken
npm install -D @types/express @types/node typescript ts-node
```

**backend/index.ts:**

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  // TODO: Проверить в БД
  res.json({
    success: true,
    data: {
      user: { id: '1', email, name: 'Test User' },
      token: 'jwt-token-here'
    }
  });
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  // TODO: Создать пользователя в БД
  res.json({
    success: true,
    data: {
      user: { id: '1', email, name },
      token: 'jwt-token-here'
    }
  });
});

// Courses endpoints
app.get('/api/courses', async (req, res) => {
  // TODO: Получить из БД
  res.json({
    success: true,
    data: []
  });
});

app.post('/api/courses', async (req, res) => {
  const course = req.body;
  // TODO: Сохранить в БД
  res.json({
    success: true,
    data: course
  });
});

// Payments endpoints
app.post('/api/payments/create', async (req, res) => {
  const { amount, currency } = req.body;
  // TODO: Создать платеж через Stripe
  res.json({
    success: true,
    data: {
      clientSecret: 'pi_test_secret',
      paymentId: 'pi_123'
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend запущен на http://localhost:${PORT}`);
});
```

**Запустить:**
```bash
npx ts-node index.ts
```

#### 3.2. Backend на NestJS (продвинутый)

**Установить NestJS CLI:**
```bash
npm i -g @nestjs/cli
nest new backend
cd backend
```

**Установить зависимости:**
```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @prisma/client prisma
npm install bcrypt stripe
```

**Сгенерировать модули:**
```bash
nest g module auth
nest g module users
nest g module courses
nest g module payments
nest g service auth
nest g controller auth
```

**Инициализировать Prisma:**
```bash
npx prisma init
```

**prisma/schema.prisma:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  avatar    String?
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  courses   Course[]
  payments  Payment[]
}

model Course {
  id          String   @id @default(uuid())
  title       String
  description String
  price       Float
  level       String
  language    String
  duration    Int
  coverImage  String?
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  
  modules     Module[]
  reviews     Review[]
}

model Module {
  id          String   @id @default(uuid())
  title       String
  description String
  order       Int
  
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id])
  
  lessons     Lesson[]
}

model Lesson {
  id        String   @id @default(uuid())
  title     String
  content   String
  format    String
  duration  Int
  order     Int
  
  moduleId  String
  module    Module   @relation(fields: [moduleId], references: [id])
}

model Payment {
  id            String   @id @default(uuid())
  amount        Float
  currency      String
  status        String
  provider      String
  paymentId     String?
  createdAt     DateTime @default(now())
  
  userId        String
  user          User     @relation(fields: [userId], references: [id])
}

model Review {
  id        String   @id @default(uuid())
  rating    Int
  comment   String
  createdAt DateTime @default(now())
  
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id])
}
```

**Применить миграции:**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

**Запустить:**
```bash
npm run start:dev
```

---

### Вариант 4: Использовать Supabase (БЕЗ своего backend)

**1. Создать проект на supabase.com**

**2. Получить credentials:**
```
Project URL: https://your-project.supabase.co
API Key: your-anon-key
```

**3. Установить Supabase client:**
```bash
npm install @supabase/supabase-js
```

**4. Создать `/lib/supabase.ts`:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

**5. Обновить API client для использования Supabase:**
```typescript
// Вместо apiClient.post('/auth/login')
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

**6. SQL Schema в Supabase Dashboard:**
```sql
-- Выполнить в SQL Editor
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  level TEXT,
  language TEXT,
  author_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- И т.д.
```

---

## 🔑 Получение API ключей

### OpenAI
1. https://platform.openai.com/signup
2. API Keys → Create new secret key
3. Добавить баланс ($5-10)

### Stripe (тестовый режим)
1. https://dashboard.stripe.com/register
2. Developers → API keys
3. Скопировать Publishable key и Secret key

### Supabase
1. https://supabase.com/dashboard
2. New Project
3. Settings → API → Copy URL and anon key

---

## ✅ Проверка интеграции

**Тест 1: API доступен**
```bash
curl http://localhost:3001/api/health
# Должно вернуть: {"status": "ok"}
```

**Тест 2: Auth работает**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'
```

**Тест 3: AI генерация работает**
```typescript
// В DevTools Console
const result = await aiService.generateCourse({
  topic: 'JavaScript',
  level: 'beginner',
  duration: 10,
  language: 'ru'
});
console.log(result);
```

---

## 🆘 Проблемы и решения

### CORS ошибка
```typescript
// backend/index.ts
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Токены не сохраняются
```typescript
// Проверить в DevTools → Application → Local Storage
// Должны быть ключи: auth_token, refresh_token
```

### AI не отвечает
```bash
# Проверить API key
echo $OPENAI_API_KEY

# Проверить баланс
# https://platform.openai.com/account/usage
```

---

## 📚 Дополнительные ресурсы

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Supabase Documentation](https://supabase.com/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)

---

## 🎉 Готово!

Теперь проект интегрирован с backend и готов к разработке функционала!

**Следующие шаги:**
1. Реализовать реальные endpoint'ы
2. Подключить платежную систему
3. Добавить email уведомления
4. Настроить мониторинг
5. Подготовить к production deployment

**Нужна помощь?** Свяжитесь с командой разработки! 🚀
