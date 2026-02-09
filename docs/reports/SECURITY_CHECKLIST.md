# 🔐 OMNEX STUDY - Чеклист безопасности

**Статус:** ⚠️ БАЗОВАЯ ЗАЩИТА ЕСТЬ - Требуются улучшения для production

---

## ✅ ЧТО УЖЕ РЕАЛИЗОВАНО

### 1. Аутентификация и авторизация
- ✅ JWT токены (access + refresh)
- ✅ Автоматическое добавление Authorization header
- ✅ Logout с очисткой токенов
- ✅ OAuth провайдеры готовы (Google, VK, Yandex)

### 2. Валидация данных
- ✅ Email валидация (regex)
- ✅ Пароль: минимум 8 символов, буквы, цифры, спецсимволы
- ✅ Оценка силы пароля (score 0-4)
- ✅ Телефон валидация
- ✅ URL валидация
- ✅ Карты (basic Luhn check)
- ✅ CVV валидация
- ✅ Expiry date валидация
- ✅ XSS защита (sanitize функция)
- ✅ Файлы (размер, тип, расширение)

### 3. Rate Limiting
- ✅ Защита от перебора (60 запросов в минуту)
- ✅ Локальный rate limiter
- ✅ Таймауты для API запросов (30 сек)

### 4. API Security
- ✅ Централизованный API client
- ✅ Error handling
- ✅ Retry механизм (3 попытки)
- ✅ Timeout protection

### 5. Безопасность данных
- ✅ Конфигурация для CSRF
- ✅ Конфигурация для 2FA
- ✅ Session timeout (30 минут)
- ✅ Max login attempts (5)
- ✅ Lockout duration (15 минут)

---

## ⚠️ ЧТО НУЖНО ДОБАВИТЬ ДЛЯ PRODUCTION

### 🔴 КРИТИЧНО (сделать ДО запуска)

#### 1. Токены в httpOnly cookies (ВЫСОКИЙ ПРИОРИТЕТ)

**Текущая проблема:**
```typescript
// ❌ НЕБЕЗОПАСНО - токены в localStorage доступны JavaScript
localStorage.setItem('auth_token', token);
```

**Решение:**
```typescript
// ✅ БЕЗОПАСНО - Backend устанавливает httpOnly cookie
// Backend (Express/NestJS):
res.cookie('auth_token', token, {
  httpOnly: true,      // Недоступен для JavaScript
  secure: true,        // Только HTTPS
  sameSite: 'strict',  // Защита от CSRF
  maxAge: 3600000,     // 1 час
  path: '/'
});

// Frontend: токен автоматически отправляется в cookies
// Убрать из apiClient:
// if (token) {
//   requestHeaders['Authorization'] = `Bearer ${token}`;
// }
```

**Изменения в коде:**
```typescript
// /lib/api-client.ts - УДАЛИТЬ
private getToken(): string | null {
  return localStorage.getItem(config.auth.tokenKey);
}

// Cookies отправляются автоматически
fetch(url, {
  credentials: 'include' // ← Добавить это
});
```

#### 2. HTTPS обязательно

**Установить SSL сертификат:**
```bash
# Бесплатный SSL от Let's Encrypt
sudo apt-get install certbot
sudo certbot --nginx -d omnexstudy.com -d www.omnexstudy.com
```

**Nginx config:**
```nginx
server {
  listen 443 ssl http2;
  server_name omnexstudy.com www.omnexstudy.com;
  
  ssl_certificate /etc/letsencrypt/live/omnexstudy.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/omnexstudy.com/privkey.pem;
  
  # Современные SSL протоколы
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;
  
  # HSTS
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}

# Редирект HTTP → HTTPS
server {
  listen 80;
  server_name omnexstudy.com www.omnexstudy.com;
  return 301 https://$server_name$request_uri;
}
```

#### 3. CSRF защита

**Backend middleware:**
```typescript
// npm install csurf cookie-parser
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

app.use(cookieParser());
app.use(csrf({ cookie: true }));

// Endpoint для получения токена
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

**Frontend:**
```typescript
// /lib/api-client.ts
private async getCsrfToken(): Promise<string> {
  const response = await fetch(`${this.baseUrl}/csrf-token`, {
    credentials: 'include'
  });
  const data = await response.json();
  return data.csrfToken;
}

// Добавить в каждый POST/PUT/DELETE запрос
private async request(endpoint: string, options: ApiRequestOptions) {
  const headers = { ...options.headers };
  
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method)) {
    headers['X-CSRF-Token'] = await this.getCsrfToken();
  }
  
  // ... rest of code
}
```

#### 4. Content Security Policy (CSP)

**Next.js config:**
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.omnexstudy.com https://ai.omnexstudy.com",
              "frame-src https://js.stripe.com",
            ].join('; ')
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()'
          }
        ]
      }
    ];
  }
};
```

#### 5. CORS правильная настройка

**Backend:**
```typescript
// Express/NestJS
app.use(cors({
  origin: [
    'https://omnexstudy.com',
    'https://www.omnexstudy.com',
    // Для разработки:
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 600 // 10 минут
}));
```

#### 6. Шифрование персональных данных

**Backend:**
```typescript
import crypto from 'crypto';

class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  
  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }
  
  decrypt(encryptedData: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// Использование
const encryptionService = new EncryptionService();

// При сохранении в БД
user.email = encryptionService.encrypt(email);
user.phone = encryptionService.encrypt(phone);

// При чтении
const email = encryptionService.decrypt(user.email);
```

**Что шифровать:**
- Email (опционально, но рекомендуется для GDPR)
- Телефон
- Адрес
- Любые ПД

#### 7. Хеширование паролей

**Backend:**
```typescript
import bcrypt from 'bcrypt';

// При регистрации
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);
await db.user.create({ password: hashedPassword });

// При входе
const user = await db.user.findOne({ email });
const isValid = await bcrypt.compare(password, user.password);
```

#### 8. SQL Injection защита

**Использовать ORM (Prisma):**
```typescript
// ✅ БЕЗОПАСНО
const user = await prisma.user.findUnique({
  where: { email: email }
});

// ❌ НЕБЕЗОПАСНО
const user = await db.query(`SELECT * FROM users WHERE email = '${email}'`);
```

**Или Prepared Statements:**
```typescript
// PostgreSQL
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);
```

#### 9. Защита от XSS

**Уже есть в `/lib/utils/validation.ts`:**
```typescript
validation.sanitize(userInput)
```

**Использовать везде где пользовательский контент:**
```typescript
// Перед сохранением в БД
const sanitizedBio = validation.sanitize(bio);
await db.user.update({ bio: sanitizedBio });

// Или в React компонентах
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(content) // npm install dompurify
}} />
```

#### 10. Rate Limiting на Backend

**Express:**
```typescript
import rateLimit from 'express-rate-limit';

// Общий лимит
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // 100 запросов
  message: 'Too many requests, please try again later.'
});

app.use('/api/', limiter);

// Строгий лимит для auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // только 5 попыток входа
  skipSuccessfulRequests: true
});

app.use('/api/auth/login', authLimiter);
```

---

### 🟡 ВАЖНО (первая неделя production)

#### 11. 2FA (Two-Factor Authentication)

**Backend:**
```bash
npm install speakeasy qrcode
```

```typescript
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// Setup 2FA
app.post('/api/auth/2fa/setup', async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: `OMNEX STUDY (${user.email})`
  });
  
  // Сохранить secret в БД
  await db.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secret.base32 }
  });
  
  // Сгенерировать QR код
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
  
  res.json({ qrCode: qrCodeUrl, secret: secret.base32 });
});

// Verify 2FA
app.post('/api/auth/2fa/verify', async (req, res) => {
  const { token } = req.body;
  
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: token,
    window: 2
  });
  
  res.json({ verified });
});
```

**Frontend компонент:**
```typescript
// /components/auth/two-factor-setup.tsx
import { QRCodeSVG } from 'qrcode.react';

export function TwoFactorSetup() {
  const [qrCode, setQrCode] = useState('');
  
  const setupTwoFactor = async () => {
    const response = await apiClient.post('/auth/2fa/setup');
    setQrCode(response.data.qrCode);
  };
  
  return (
    <div>
      <h2>Enable Two-Factor Authentication</h2>
      <p>Scan this QR code with Google Authenticator</p>
      {qrCode && <img src={qrCode} alt="QR Code" />}
    </div>
  );
}
```

#### 12. Email верификация

**Backend:**
```typescript
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// При регистрации
const verificationToken = crypto.randomBytes(32).toString('hex');
await db.user.create({
  email,
  verificationToken,
  isVerified: false
});

// Отправить email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

await transporter.sendMail({
  to: email,
  subject: 'Verify your email',
  html: `<a href="https://omnexstudy.com/verify/${verificationToken}">Verify Email</a>`
});

// Endpoint для верификации
app.get('/api/auth/verify/:token', async (req, res) => {
  const user = await db.user.findFirst({
    where: { verificationToken: req.params.token }
  });
  
  if (!user) {
    return res.status(400).json({ error: 'Invalid token' });
  }
  
  await db.user.update({
    where: { id: user.id },
    data: { isVerified: true, verificationToken: null }
  });
  
  res.redirect('https://omnexstudy.com/dashboard');
});
```

#### 13. Логирование безопасности

**Winston logger:**
```typescript
import winston from 'winston';

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'security.log' })
  ]
});

// Логировать все попытки входа
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  securityLogger.info('Login attempt', {
    email,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date()
  });
  
  // ... authentication logic
  
  if (success) {
    securityLogger.info('Login successful', { email, ip: req.ip });
  } else {
    securityLogger.warn('Login failed', { email, ip: req.ip, reason: 'Invalid credentials' });
  }
});
```

**Что логировать:**
- ✅ Попытки входа (успешные и неуспешные)
- ✅ Изменения пароля
- ✅ Изменения email
- ✅ Платежи
- ✅ Доступ к чувствительным данным
- ✅ API ошибки
- ✅ Rate limit violations
- ✅ Подозрительную активность

#### 14. Мониторинг ошибок (Sentry)

```bash
npm install @sentry/nextjs @sentry/node
```

**Frontend (Next.js):**
```typescript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV
});
```

**Backend:**
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0
});

// Express error handler
app.use(Sentry.Handlers.errorHandler());
```

#### 15. Бэкап базы данных

**Автоматический бэкап PostgreSQL:**
```bash
# Crontab (каждый день в 2:00)
0 2 * * * pg_dump omnex_study | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz

# Удалять старые бэкапы (старше 30 дней)
0 3 * * * find /backups -name "db_*.sql.gz" -mtime +30 -delete
```

**S3 бэкап (рекомендуется):**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
pg_dump omnex_study | gzip > /tmp/backup_$DATE.sql.gz
aws s3 cp /tmp/backup_$DATE.sql.gz s3://omnex-backups/db/
rm /tmp/backup_$DATE.sql.gz
```

---

### 🟢 ЖЕЛАТЕЛЬНО (в течение месяца)

#### 16. Web Application Firewall (WAF)

**Cloudflare (рекомендуется):**
- Включить Cloudflare
- Security → WAF → Enable Managed Rules
- Bot Fight Mode
- DDoS Protection

**Или ModSecurity (open source):**
```bash
sudo apt-get install libapache2-mod-security2
```

#### 17. IP Whitelisting для админки

```typescript
// Backend middleware
const adminIpWhitelist = ['123.45.67.89', '98.76.54.32'];

const requireAdminIp = (req, res, next) => {
  const clientIp = req.ip;
  
  if (!adminIpWhitelist.includes(clientIp)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  next();
};

app.use('/api/admin', requireAdminIp);
```

#### 18. Аудит зависимостей

```bash
# Проверить уязвимости
npm audit

# Автоматическое исправление
npm audit fix

# Или использовать Snyk
npm install -g snyk
snyk test
snyk monitor
```

#### 19. Security Headers

**Helmet.js (Express):**
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true
  }
}));
```

#### 20. Penetration Testing

**Инструменты:**
- OWASP ZAP
- Burp Suite
- Nikto
- SQLMap

**Регулярно проверять:**
- SQL Injection
- XSS
- CSRF
- Authentication bypass
- Session hijacking
- API vulnerabilities

---

## 📋 ФИНАЛЬНЫЙ ЧЕКЛИСТ

### Перед Production запуском:

- [ ] ✅ Токены в httpOnly cookies
- [ ] ✅ HTTPS установлен и работает
- [ ] ✅ CSRF защита включена
- [ ] ✅ CSP headers настроены
- [ ] ✅ CORS правильно сконфигурирован
- [ ] ✅ Пароли хешируются (bcrypt)
- [ ] ✅ Персональные данные шифруются
- [ ] ✅ SQL Injection защита (ORM/Prepared Statements)
- [ ] ✅ XSS санитизация работает
- [ ] ✅ Rate limiting на backend
- [ ] ✅ 2FA доступна для пользователей
- [ ] ✅ Email верификация работает
- [ ] ✅ Логирование настроено (Winston)
- [ ] ✅ Мониторинг ошибок (Sentry)
- [ ] ✅ Бэкапы БД автоматические
- [ ] ✅ WAF включен (Cloudflare)
- [ ] ✅ Security headers (Helmet)
- [ ] ✅ Аудит зависимостей пройден
- [ ] ✅ Penetration testing выполнен

---

## 🎯 ИТОГОВАЯ ОЦЕНКА

| Категория | Текущий статус | Production статус |
|-----------|----------------|-------------------|
| Аутентификация | 70% | Нужны httpOnly cookies |
| Шифрование | 60% | Нужно шифровать ПД |
| HTTPS/SSL | 0% | Обязательно для production |
| CSRF | 50% | Конфиг есть, нужна реализация |
| XSS | 80% | Санитизация есть, нужен CSP |
| SQL Injection | 90% | ORM готов |
| Rate Limiting | 70% | Есть на frontend, нужен backend |
| 2FA | 40% | Конфиг есть, нужна реализация |
| Логирование | 30% | Нужно добавить |
| Мониторинг | 0% | Нужен Sentry |
| Бэкапы | 0% | Обязательно настроить |

**Общая оценка безопасности:** 55% → 95% после внедрения рекомендаций

---

## 📞 КОНТАКТЫ

Для аудита безопасности или консультации:
- security@omnexstudy.com
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)

---

**Важно:** Безопасность - это процесс, а не одноразовое действие. Регулярно обновляйте зависимости, проводите аудиты и следите за новыми угрозами.

🔒 **OMNEX STUDY - Безопасность прежде всего!**
