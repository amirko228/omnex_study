// ============================================================================
// CORE TYPES
// ============================================================================

export type Locale = 'ru' | 'en' | 'de' | 'es' | 'fr';

export type UserRole = 'user';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type PaymentProvider = 'stripe' | 'cloudpayments' | 'yoomoney';

export type NotificationChannel = 'email' | 'push' | 'in-app';

export type NotificationType = 'course_update' | 'payment' | 'reminder' | 'marketing';

export type OAuthProvider = 'google' | 'vk' | 'yandex';

export type CourseFormat = 'text' | 'quiz' | 'chat' | 'assignment';

export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type LessonType = 'text' | 'quiz' | 'assignment' | 'chat';

// ============================================================================
// USER TYPES
// ============================================================================


export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  progress: number;
  maxProgress: number;
}

export interface StudyScheduleItem {
  id: string;
  date: Date;
  activity: string;
  duration: number;
  completed: boolean;
  courseId?: string;
  lessonId?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  locale: Locale;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
  subscription?: 'free' | 'pro' | 'enterprise';
  plan?: 'free' | 'pro' | 'enterprise'; // Alias for subscription
  purchasedCourses?: string[];
}

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  phone?: string;
  country?: string;
  timezone?: string;
  learningGoals?: string[];
  interests?: string[];
  rating: number;
  completedCourses: number;
  totalPoints: number;
  level: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  locale?: Locale;
}

// ============================================================================
// COURSE TYPES
// ============================================================================

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  coverImage?: string;
  thumbnail?: string; // Alias for coverImage
  difficulty: CourseDifficulty;
  level?: CourseDifficulty; // Alias for difficulty
  duration: number; // in minutes or hours
  lessonsCount: number;
  modulesCount: number;
  category: string;
  tags: string[];
  rating: number;
  reviewsCount: number;
  enrolledCount: number;
  studentsCount?: number; // Alias for enrolledCount
  isPublished: boolean;
  isFeatured: boolean;
  isAIGenerated: boolean;
  language: Locale;
  availableLanguages: Locale[];
  authorId: string;
  author?: User;
  instructor?: string; // For mock data
  price: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  modules?: CourseModule[];
  formats?: CourseFormat[];
  isEnrolled?: boolean;
  progress?: number;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  duration: number;
  lessonsCount: number;
  lessons?: Lesson[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  content: string;
  type: LessonType;
  format: CourseFormat;
  order: number;
  duration: number;
  isCompleted?: boolean;
  quiz?: Quiz;
  assignment?: Assignment;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;
  attempts: number;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  type: 'single' | 'multiple' | 'text' | 'true-false';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

export interface Assignment {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  instructions: string;
  submissionFormat: 'text' | 'file' | 'code' | 'url';
  maxScore: number;
  deadline?: Date;
}

// ============================================================================
// PROGRESS TYPES
// ============================================================================

export interface CourseProgress {
  id: string;
  userId: string;
  courseId: string;
  course?: Course;
  progress: number; // 0-100
  completedLessons: number;
  totalLessons: number;
  startedAt: Date;
  lastAccessedAt: Date;
  completedAt?: Date;
  currentModuleId?: string;
  currentLessonId?: string;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  lesson?: Lesson;
  isCompleted: boolean;
  score?: number;
  timeSpent: number;
  attempts: number;
  startedAt: Date;
  completedAt?: Date;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  quiz?: Quiz;
  score: number;
  totalScore: number;
  passed: boolean;
  answers: QuizAnswer[];
  startedAt: Date;
  completedAt: Date;
  timeSpent: number;
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  points: number;
}

// ============================================================================
// REVIEW & RATING TYPES
// ============================================================================

export interface CourseReview {
  id: string;
  courseId: string;
  userId: string;
  user?: User;
  rating: number;
  title?: string;
  comment: string;
  isApproved: boolean;
  helpfulCount: number;
  reportCount: number;
  aiResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewReport {
  id: string;
  reviewId: string;
  userId: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Date;
}

// ============================================================================
// PAYMENT & BILLING TYPES
// ============================================================================

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  providerId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromoCode {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses?: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  paymentId?: string;
  type: 'payment' | 'refund' | 'promo';
  amount: number;
  currency: string;
  description: string;
  createdAt: Date;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface NotificationPreferences {
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  courseUpdates: boolean;
  payments: boolean;
  reminders: boolean;
  marketing: boolean;
}

// ============================================================================
// AI TYPES
// ============================================================================

export interface AIChat {
  id: string;
  userId: string;
  courseId?: string;
  lessonId?: string;
  messages: AIChatMessage[];
  context?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIChatMessage {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AICourseRequest {
  userId: string;
  topic: string;
  description?: string;
  difficulty: CourseDifficulty;
  duration?: number;
  language: Locale;
  preferences?: {
    includeQuizzes: boolean;
    includeAssignments: boolean;
    modulesCount?: number;
  };
}

export interface AITranslationRequest {
  contentId: string;
  contentType: 'course' | 'module' | 'lesson';
  sourceLanguage: Locale;
  targetLanguage: Locale;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, unknown>;
}

// ============================================================================
// WEBHOOK TYPES
// ============================================================================

export interface WebhookEvent {
  id: string;
  type: string;
  provider: PaymentProvider;
  data: unknown;
  verified: boolean;
  processed: boolean;
  createdAt: Date;
}