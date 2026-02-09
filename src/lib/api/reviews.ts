// ============================================================================
// REVIEWS API
// ============================================================================

import { apiClient } from '../api-client';
import type {
  CourseReview,
  ReviewReport,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

export const reviewsApi = {
  /**
   * Get course reviews
   */
  async getCourseReviews(
    courseId: string,
    params?: {
      page?: number;
      limit?: number;
      sort?: 'newest' | 'helpful' | 'rating';
    }
  ): Promise<ApiResponse<PaginatedResponse<CourseReview>>> {
    return apiClient.get<PaginatedResponse<CourseReview>>(
      `/courses/${courseId}/reviews`,
      params
    );
  },

  /**
   * Get my review for a course
   */
  async getMyReview(courseId: string): Promise<ApiResponse<CourseReview>> {
    return apiClient.get<CourseReview>(`/courses/${courseId}/reviews/mine`);
  },

  /**
   * Create course review
   */
  async createReview(
    courseId: string,
    data: {
      rating: number;
      title?: string;
      comment: string;
    }
  ): Promise<ApiResponse<CourseReview>> {
    return apiClient.post<CourseReview>(`/courses/${courseId}/reviews`, data);
  },

  /**
   * Update review
   */
  async updateReview(
    reviewId: string,
    data: {
      rating?: number;
      title?: string;
      comment?: string;
    }
  ): Promise<ApiResponse<CourseReview>> {
    return apiClient.patch<CourseReview>(`/reviews/${reviewId}`, data);
  },

  /**
   * Delete review
   */
  async deleteReview(reviewId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/reviews/${reviewId}`);
  },

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/reviews/${reviewId}/helpful`);
  },

  /**
   * Remove helpful mark
   */
  async removeHelpful(reviewId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/reviews/${reviewId}/helpful`);
  },

  /**
   * Report review
   */
  async reportReview(
    reviewId: string,
    data: {
      reason: string;
      description?: string;
    }
  ): Promise<ApiResponse<ReviewReport>> {
    return apiClient.post<ReviewReport>(`/reviews/${reviewId}/report`, data);
  },

  /**
   * Get AI response for review (if available)
   */
  async getAIResponse(reviewId: string): Promise<ApiResponse<{ response: string }>> {
    return apiClient.get<{ response: string }>(`/reviews/${reviewId}/ai-response`);
  },

  /**
   * Request AI response for review
   */
  async requestAIResponse(reviewId: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/reviews/${reviewId}/ai-response/generate`);
  },
};
