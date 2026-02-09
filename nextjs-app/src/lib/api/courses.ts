// ============================================================================
// COURSES API
// ============================================================================

import { apiClient } from '../api-client';
import type {
  Course,
  CourseModule,
  Lesson,
  Quiz,
  QuizAttempt,
  CourseProgress,
  PaginatedResponse,
  ApiResponse,
  CourseDifficulty,
  Locale,
} from '@/types';

export const coursesApi = {
  /**
   * Get all courses with filters
   */
  async getCourses(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    difficulty?: CourseDifficulty;
    language?: Locale;
    sort?: 'popular' | 'newest' | 'rating';
  }): Promise<ApiResponse<PaginatedResponse<Course>>> {
    return apiClient.get<PaginatedResponse<Course>>('/courses', params);
  },

  /**
   * Get single course by ID
   */
  async getCourse(id: string): Promise<ApiResponse<Course>> {
    return apiClient.get<Course>(`/courses/${id}`);
  },

  /**
   * Get course modules
   */
  async getCourseModules(courseId: string): Promise<ApiResponse<CourseModule[]>> {
    return apiClient.get<CourseModule[]>(`/courses/${courseId}/modules`);
  },

  /**
   * Get module lessons
   */
  async getModuleLessons(moduleId: string): Promise<ApiResponse<Lesson[]>> {
    return apiClient.get<Lesson[]>(`/modules/${moduleId}/lessons`);
  },

  /**
   * Get single lesson
   */
  async getLesson(lessonId: string): Promise<ApiResponse<Lesson>> {
    return apiClient.get<Lesson>(`/lessons/${lessonId}`);
  },

  /**
   * Get lesson quiz
   */
  async getLessonQuiz(lessonId: string): Promise<ApiResponse<Quiz>> {
    return apiClient.get<Quiz>(`/lessons/${lessonId}/quiz`);
  },

  /**
   * Submit quiz attempt
   */
  async submitQuizAttempt(
    quizId: string,
    answers: Record<string, any>
  ): Promise<ApiResponse<QuizAttempt>> {
    return apiClient.post<QuizAttempt>(`/quizzes/${quizId}/attempts`, { answers });
  },

  /**
   * Get my enrolled courses
   */
  async getEnrolledCourses(): Promise<ApiResponse<Course[]>> {
    return apiClient.get<Course[]>('/courses/enrolled');
  },

  /**
   * Enroll in course
   */
  async enrollCourse(courseId: string): Promise<ApiResponse<CourseProgress>> {
    return apiClient.post<CourseProgress>(`/courses/${courseId}/enroll`);
  },

  /**
   * Get course progress
   */
  async getCourseProgress(courseId: string): Promise<ApiResponse<CourseProgress>> {
    return apiClient.get<CourseProgress>(`/courses/${courseId}/progress`);
  },

  /**
   * Mark lesson as completed
   */
  async completeLesson(lessonId: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/lessons/${lessonId}/complete`);
  },

  /**
   * Get featured courses
   */
  async getFeaturedCourses(): Promise<ApiResponse<Course[]>> {
    return apiClient.get<Course[]>('/courses/featured');
  },

  /**
   * Get popular courses
   */
  async getPopularCourses(limit?: number): Promise<ApiResponse<Course[]>> {
    return apiClient.get<Course[]>('/courses/popular', { limit });
  },

  /**
   * Get recommended courses
   */
  async getRecommendedCourses(): Promise<ApiResponse<Course[]>> {
    return apiClient.get<Course[]>('/courses/recommended');
  },

  /**
   * Search courses
   */
  async searchCourses(query: string): Promise<ApiResponse<Course[]>> {
    return apiClient.get<Course[]>('/courses/search', { q: query });
  },
};
