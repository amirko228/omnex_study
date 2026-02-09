// ============================================================================
// AI API
// ============================================================================

import { apiClient } from '../api-client';
import type {
  AICourseRequest,
  AITranslationRequest,
  AIChat,
  AIChatMessage,
  Course,
  ApiResponse,
  Locale,
} from '@/types';

export const aiApi = {
  /**
   * Generate course with AI
   */
  async generateCourse(request: AICourseRequest): Promise<ApiResponse<Course>> {
    return apiClient.post<Course>('/ai/courses/generate', request);
  },

  /**
   * Translate course content
   */
  async translateContent(request: AITranslationRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/ai/translate', request);
  },

  /**
   * Auto-translate course to all languages
   */
  async autoTranslateCourse(
    courseId: string,
    sourceLanguage: Locale
  ): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/ai/courses/${courseId}/auto-translate`, {
      sourceLanguage,
    });
  },

  /**
   * Create AI chat session
   */
  async createChat(params: {
    courseId?: string;
    lessonId?: string;
    context?: string;
  }): Promise<ApiResponse<AIChat>> {
    return apiClient.post<AIChat>('/ai/chats', params);
  },

  /**
   * Get chat history
   */
  async getChat(chatId: string): Promise<ApiResponse<AIChat>> {
    return apiClient.get<AIChat>(`/ai/chats/${chatId}`);
  },

  /**
   * Get user's chat history
   */
  async getUserChats(): Promise<ApiResponse<AIChat[]>> {
    return apiClient.get<AIChat[]>('/ai/chats');
  },

  /**
   * Send message to AI tutor
   */
  async sendMessage(
    chatId: string,
    message: string
  ): Promise<ApiResponse<AIChatMessage>> {
    return apiClient.post<AIChatMessage>(`/ai/chats/${chatId}/messages`, {
      message,
    });
  },

  /**
   * Get personalized learning path
   */
  async getLearningPath(): Promise<ApiResponse<Course[]>> {
    return apiClient.get<Course[]>('/ai/learning-path');
  },

  /**
   * Adapt course difficulty
   */
  async adaptDifficulty(
    courseId: string,
    performance: number
  ): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/ai/courses/${courseId}/adapt`, { performance });
  },

  /**
   * Get AI-generated quiz questions
   */
  async generateQuizQuestions(params: {
    lessonId: string;
    count: number;
    difficulty?: string;
  }): Promise<ApiResponse<any[]>> {
    return apiClient.post<any[]>('/ai/quiz/generate', params);
  },

  /**
   * Get AI feedback on assignment
   */
  async getAssignmentFeedback(
    assignmentId: string,
    submission: string
  ): Promise<ApiResponse<{ feedback: string; score: number }>> {
    return apiClient.post<{ feedback: string; score: number }>(
      `/ai/assignments/${assignmentId}/feedback`,
      { submission }
    );
  },

  /**
   * Get AI study recommendations
   */
  async getStudyRecommendations(): Promise<
    ApiResponse<{
      suggestedCourses: Course[];
      studySchedule: any[];
      tips: string[];
    }>
  > {
    return apiClient.get('/ai/recommendations');
  },
};
