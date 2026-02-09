// ============================================================================
// CONFIGURATION
// ============================================================================

export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    timeout: 30000,
    retries: 3,
  },

  // Authentication
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    tokenExpiry: 3600, // 1 hour
    refreshTokenExpiry: 604800, // 7 days
  },

  // OAuth Providers
  oauth: {
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || '',
    },
    vk: {
      clientId: process.env.NEXT_PUBLIC_VK_CLIENT_ID || '',
      redirectUri: process.env.NEXT_PUBLIC_VK_REDIRECT_URI || '',
    },
    yandex: {
      clientId: process.env.NEXT_PUBLIC_YANDEX_CLIENT_ID || '',
      redirectUri: process.env.NEXT_PUBLIC_YANDEX_REDIRECT_URI || '',
    },
  },

  // Payment Providers
  payment: {
    stripe: {
      publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '',
      currency: 'usd',
    },
    cloudpayments: {
      publicId: process.env.NEXT_PUBLIC_CLOUDPAYMENTS_PUBLIC_ID || '',
      currency: 'rub',
    },
    yoomoney: {
      shopId: process.env.NEXT_PUBLIC_YOOMONEY_SHOP_ID || '',
      currency: 'rub',
    },
  },

  // Subscription Tiers Pricing
  pricing: {
    free: {
      price: 0,
      features: ['3 курса в месяц', 'Базовые функции AI', 'Email поддержка'],
      limits: {
        coursesPerMonth: 3,
        aiChatsPerDay: 5,
      },
    },
    basic: {
      price: 9.99,
      priceRub: 990,
      features: [
        '10 курсов в месяц',
        'Расширенные функции AI',
        'Email и чат поддержка',
        'Сертификаты',
      ],
      limits: {
        coursesPerMonth: 10,
        aiChatsPerDay: 20,
      },
    },
    pro: {
      price: 29.99,
      priceRub: 2990,
      features: [
        'Неограниченные курсы',
        'Полный доступ к AI',
        'Приоритетная поддержка',
        'Сертификаты',
        'Персональный AI-наставник',
      ],
      limits: {
        coursesPerMonth: -1, // unlimited
        aiChatsPerDay: -1, // unlimited
      },
    },
    enterprise: {
      price: 99.99,
      priceRub: 9990,
      features: [
        'Все из Pro',
        'Корпоративные функции',
        'Dedicated AI',
        'API доступ',
        'White-label',
        'SLA',
      ],
      limits: {
        coursesPerMonth: -1,
        aiChatsPerDay: -1,
      },
    },
  },

  // AI Configuration
  ai: {
    apiUrl: process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:3002/ai',
    model: 'gpt-4',
    maxTokens: 4000,
    temperature: 0.7,
    supportedLanguages: ['ru', 'en', 'de', 'es', 'fr'],
  },

  // Rate Limiting
  rateLimit: {
    window: 60000, // 1 minute
    maxRequests: 60,
  },

  // Security
  security: {
    enableCSRF: true,
    enable2FA: true,
    sessionTimeout: 1800000, // 30 minutes
    maxLoginAttempts: 5,
    lockoutDuration: 900000, // 15 minutes
  },

  // Notifications
  notifications: {
    pushVapidKey: process.env.NEXT_PUBLIC_VAPID_KEY || '',
    emailFrom: 'noreply@ailearning.com',
    inAppRetention: 30, // days
  },

  // Features Flags
  features: {
    oauth: true,
    twoFactor: true,
    aiCourseGeneration: true,
    aiTranslation: true,
    aiTutor: true,
    payments: true,
    subscriptions: true,
    reviews: true,
    notifications: true,
    analytics: true,
  },

  // Localization
  locales: ['ru', 'en', 'de', 'es', 'fr'] as const,
  defaultLocale: 'ru' as const,

  // Course Settings
  courses: {
    maxTitleLength: 100,
    maxDescriptionLength: 500,
    maxContentLength: 50000,
    supportedFormats: ['text', 'quiz', 'chat', 'assignment'],
    difficulties: ['beginner', 'intermediate', 'advanced'],
  },

  // Storage
  storage: {
    maxUploadSize: 10485760, // 10MB
    allowedFileTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
    ],
  },
} as const;

export type Config = typeof config;