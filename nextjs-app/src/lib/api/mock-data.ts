// Mock data for development (replace with real API calls)

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'moderator' | 'admin';
  subscription?: 'free' | 'pro' | 'enterprise';
  purchasedCourses: string[]; // IDs of purchased courses
  createdAt: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  rating: number;
  studentsCount: number;
  lessonsCount: number;
  duration: number; // hours
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  price: number; // Price in USD
  formats?: ('text' | 'quiz' | 'chat' | 'assignment')[]; // Course content formats
  isEnrolled?: boolean;
  progress?: number; // 0-100
  modules: Module[];
};

export type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export type Lesson = {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  duration: number; // minutes
  completed?: boolean;
  content?: string;
  quiz?: Quiz;
};

export type Quiz = {
  questions: QuizQuestion[];
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export type Invoice = {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  plan: string;
};

// Mock current user
export const mockUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  role: 'user',
  subscription: 'free',
  purchasedCourses: ['1', '2'], // Already purchased first two courses
  createdAt: '2024-01-15',
};

// Mock courses
export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Machine Learning',
    description: 'Learn the fundamentals of machine learning with hands-on projects and real-world examples.',
    instructor: 'AI Learning Assistant',
    thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
    rating: 4.8,
    studentsCount: 12453,
    lessonsCount: 24,
    duration: 12,
    level: 'beginner',
    category: 'AI & Machine Learning',
    price: 29,
    isEnrolled: true,
    progress: 35,
    modules: [
      {
        id: 'm1',
        title: 'Getting Started',
        lessons: [
          { id: 'l1', title: 'What is Machine Learning?', type: 'video', duration: 15, completed: true },
          { id: 'l2', title: 'Setting Up Your Environment', type: 'text', duration: 20, completed: true },
          { id: 'l3', title: 'Your First ML Model', type: 'video', duration: 25, completed: false },
        ],
      },
      {
        id: 'm2',
        title: 'Core Concepts',
        lessons: [
          { id: 'l4', title: 'Supervised Learning', type: 'text', duration: 30 },
          { id: 'l5', title: 'Unsupervised Learning', type: 'video', duration: 28 },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Web Development Bootcamp',
    description: 'Build modern web applications with React, Next.js, and TypeScript.',
    instructor: 'AI Learning Assistant',
    thumbnail: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800&q=80',
    rating: 4.9,
    studentsCount: 23156,
    lessonsCount: 48,
    duration: 24,
    level: 'intermediate',
    category: 'Web Development',
    price: 49,
    isEnrolled: true,
    progress: 60,
    modules: [
      {
        id: 'm1',
        title: 'React Fundamentals',
        lessons: [
          { id: 'l1', title: 'Components & Props', type: 'video', duration: 20, completed: true },
          { id: 'l2', title: 'State Management', type: 'text', duration: 25, completed: true },
        ],
      },
    ],
  },
  {
    id: '3',
    title: 'Data Science with Python',
    description: 'Master data analysis, visualization, and statistical modeling with Python.',
    instructor: 'AI Learning Assistant',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    rating: 4.7,
    studentsCount: 18934,
    lessonsCount: 36,
    duration: 18,
    level: 'advanced',
    category: 'Data Science',
    price: 59,
    modules: [
      {
        id: 'm1',
        title: 'Python for Data Science',
        lessons: [
          { id: 'l1', title: 'NumPy Basics', type: 'video', duration: 15 },
          { id: 'l2', title: 'Pandas for Data Analysis', type: 'text', duration: 30 },
        ],
      },
    ],
  },
  {
    id: '4',
    title: 'UI/UX Design Principles',
    description: 'Create beautiful and user-friendly interfaces with modern design principles.',
    instructor: 'AI Learning Assistant',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    rating: 4.6,
    studentsCount: 9876,
    lessonsCount: 20,
    duration: 10,
    level: 'beginner',
    category: 'Design',
    price: 39,
    modules: [],
  },
];

// Mock chat messages
export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hello! I\'m your AI learning assistant. How can I help you today?',
    timestamp: new Date().toISOString(),
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
  {
    id: 'inv-002',
    date: '2023-12-15',
    amount: 19,
    status: 'paid',
    plan: 'Pro Monthly',
  },
  {
    id: 'inv-003',
    date: '2023-11-15',
    amount: 19,
    status: 'paid',
    plan: 'Pro Monthly',
  },
];

// Mock admin data
export const mockAdminUsers: User[] = [
  mockUser,
  {
    id: '2',
    name: 'Sarah Smith',
    email: 'sarah@example.com',
    role: 'user',
    purchasedCourses: [],
    createdAt: '2024-01-20',
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike@example.com',
    role: 'admin',
    purchasedCourses: ['3'],
    createdAt: '2024-01-10',
  },
];

export type SystemLog = {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
};

export const mockSystemLogs: SystemLog[] = [
  {
    id: '1',
    type: 'info',
    message: 'User logged in successfully',
    timestamp: '2024-01-30 10:15:23',
  },
  {
    id: '2',
    type: 'warning',
    message: 'Payment retry attempted',
    timestamp: '2024-01-30 09:45:12',
  },
  {
    id: '3',
    type: 'error',
    message: 'API rate limit exceeded',
    timestamp: '2024-01-30 08:30:45',
  },
];