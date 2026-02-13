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
  purchasedCourses: ['1', '2'], // Already purchased first two courses
};

// Mock courses
export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Machine Learning',
    description: 'Learn the fundamentals of machine learning with hands-on projects and real-world examples.',
    instructor: 'AI Learning Assistant',
    thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
    coverImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
    rating: 4.8,
    reviewsCount: 120,
    enrolledCount: 12453,
    studentsCount: 12453,
    lessonsCount: 24,
    modulesCount: 2,
    duration: 12, // hours (Note: type says minutes, but UI might display as is. Let's assume hours for now or convert)
    difficulty: 'beginner',
    level: 'beginner',
    category: 'AI & Machine Learning',
    tags: ['AI', 'ML', 'Python'],
    price: 29,
    currency: 'USD',
    isEnrolled: true,
    progress: 35,
    isPublished: true,
    isFeatured: true,
    isAIGenerated: true,
    language: 'en',
    availableLanguages: ['en', 'ru'],
    authorId: 'ai',
    createdAt: new Date(),
    updatedAt: new Date(),
    formats: ['text', 'quiz'],
    modules: [
      {
        id: 'm1',
        courseId: '1',
        title: 'Getting Started',
        order: 1,
        duration: 60,
        lessonsCount: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [
          {
            id: 'l1',
            moduleId: 'm1',
            title: 'What is Machine Learning?',
            type: 'text',
            format: 'text', // fallback
            duration: 15,
            content: 'Machine learning is a branch of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.',
            order: 1,
            isCompleted: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'l2',
            moduleId: 'm1',
            title: 'Setting Up Your Environment',
            type: 'text',
            format: 'text',
            duration: 20,
            content: 'Text content',
            order: 2,
            isCompleted: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'l3',
            moduleId: 'm1',
            title: 'Your First ML Model',
            type: 'text',
            format: 'text',
            duration: 25,
            content: 'Learn how to build your first machine learning model using Python and scikit-learn library with practical examples.',
            order: 3,
            isCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
        ],
      },
      {
        id: 'm2',
        courseId: '1',
        title: 'Core Concepts',
        order: 2,
        duration: 58,
        lessonsCount: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessons: [
          {
            id: 'l4',
            moduleId: 'm2',
            title: 'Supervised Learning',
            type: 'text',
            format: 'text',
            duration: 30,
            content: 'Content',
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'l5',
            moduleId: 'm2',
            title: 'Unsupervised Learning',
            type: 'text',
            format: 'text',
            duration: 28,
            content: 'Content',
            order: 2,
            createdAt: new Date(),
            updatedAt: new Date()
          },
        ],
      },
    ],
  },
  // Add other courses similarly or simplify for brevity if mostly unused
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