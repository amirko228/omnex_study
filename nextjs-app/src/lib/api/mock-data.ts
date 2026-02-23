// Mock data for development (replace with real API calls)
import {
  User,
  Course,
  AIChatMessage as ChatMessage
} from '@/types';

// Additional types for mock data that are not in core types yet
export type Invoice = {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  plan: string;
};

export type SystemLog = {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
};

// Mock current user
export const mockUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  role: 'user',
  locale: 'en',
  emailVerified: true,
  twoFactorEnabled: false,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date(),
  subscription: 'free',
  plan: 'free',
  purchasedCourses: ['7b9bf5dd-a7f2-479b-a0ef-6e2eac64933b'],
};

// Mock courses
export const mockCourses: Course[] = [
  {
    // REAL DB COURSE ID — не менять! Это реальный UUID из базы данных (курс "Основы Веб-Разработки")
    id: '7b9bf5dd-a7f2-479b-a0ef-6e2eac64933b',
    title: 'Основы Веб-Разработки: HTML, CSS, JavaScript',
    description: 'Полный курс для начинающих по веб-разработке. Вы изучите HTML5, CSS3, JavaScript ES6+ и создадите свой первый веб-сайт. Курс включает практические задания, квизы и проект.',
    instructor: 'Omnex Instructor',
    thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
    coverImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
    rating: 4.8,
    reviewsCount: 0,
    enrolledCount: 1,
    studentsCount: 1,
    lessonsCount: 5,
    modulesCount: 3,
    duration: 20,
    difficulty: 'beginner',
    level: 'beginner',
    category: 'Программирование',
    tags: ['html', 'css', 'javascript', 'web', 'frontend'],
    price: 0,
    currency: 'RUB',
    isEnrolled: true,
    progress: 0,
    isPublished: true,
    isFeatured: true,
    isAIGenerated: false,
    language: 'ru',
    availableLanguages: ['ru', 'en'],
    authorId: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    formats: ['text', 'quiz'],
    modules: [
      {
        id: 'm1',
        courseId: '7b9bf5dd-a7f2-479b-a0ef-6e2eac64933b',
        title: 'Модуль 1: Введение в HTML',
        order: 1,
        duration: 55,
        lessonsCount: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [
          {
            id: 'l1',
            moduleId: 'm1',
            title: 'Что такое HTML?',
            type: 'text',
            format: 'text',
            duration: 30,
            content: 'HTML (HyperText Markup Language) — язык разметки для создания веб-страниц.',
            order: 1,
            isCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'l2',
            moduleId: 'm1',
            title: 'Структура HTML-документа',
            type: 'text',
            format: 'text',
            duration: 25,
            content: 'Каждый HTML-документ состоит из DOCTYPE, html, head и body.',
            order: 2,
            isCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
        ],
      },
      {
        id: 'm2',
        courseId: '7b9bf5dd-a7f2-479b-a0ef-6e2eac64933b',
        title: 'Модуль 2: Стилизация с CSS',
        order: 2,
        duration: 75,
        lessonsCount: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [
          {
            id: 'l3',
            moduleId: 'm2',
            title: 'Введение в CSS',
            type: 'text',
            format: 'text',
            duration: 30,
            content: 'CSS — язык стилей для оформления HTML.',
            order: 1,
            isCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'l4',
            moduleId: 'm2',
            title: 'Flexbox и Grid',
            type: 'text',
            format: 'text',
            duration: 45,
            content: 'Flexbox и CSS Grid — современные инструменты вёрстки.',
            order: 2,
            isCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
        ],
      },
      {
        id: 'm3',
        courseId: '7b9bf5dd-a7f2-479b-a0ef-6e2eac64933b',
        title: 'Модуль 3: JavaScript для начинающих',
        order: 3,
        duration: 40,
        lessonsCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [
          {
            id: 'l5',
            moduleId: 'm3',
            title: 'Основы JavaScript',
            type: 'text',
            format: 'text',
            duration: 40,
            content: 'JavaScript — язык программирования для веб-страниц.',
            order: 1,
            isCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
        ],
      },
    ],
  },
];


// Mock chat messages
export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    chatId: 'chat1',
    role: 'assistant',
    content: 'Hello! I\'m your AI learning assistant. How can I help you today?',
    timestamp: new Date(),
  },
];

// Mock invoices
export const mockInvoices: Invoice[] = [
  {
    id: 'inv-001',
    date: '2024-01-15',
    amount: 19,
    status: 'paid',
    plan: 'Pro Monthly',
  },
];

// Mock admin data
export const mockAdminUsers: User[] = [
  mockUser,
];

export const mockSystemLogs: SystemLog[] = [];