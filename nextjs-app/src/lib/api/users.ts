// ============================================================================
// USERS API
// ============================================================================

import { apiClient } from '../api-client';
import type { User, UserProfile, ApiResponse } from '@/types';

export const usersApi = {
  /**
   * Get user profile
   */
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<UserProfile>('/users/me');
  },

  /**
   * Update profile
   */
  async updateProfile(data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return apiClient.patch<UserProfile>('/users/me', data);
  },

  /**
   * Update user settings
   */
  async updateSettings(data: {
    locale?: string;
    timezone?: string;
  }): Promise<ApiResponse<User>> {
    return apiClient.patch<User>('/users/me/settings', data);
  },

  /**
   * Upload avatar
   */
  async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    return apiClient.upload<{ avatarUrl: string }>('/users/me/avatar', file);
  },

  /**
   * Delete avatar
   */
  async deleteAvatar(): Promise<ApiResponse<void>> {
    return apiClient.delete<void>('/users/me/avatar');
  },

  /**
   * Get user statistics
   */
  async getStatistics(): Promise<
    ApiResponse<{
      coursesCompleted: number;
      lessonsCompleted: number;
      totalTimeSpent: number;
      averageScore: number;
      streak: number;
      achievements: import('@/types').Achievement[];
    }>
  > {
    return apiClient.get('/users/me/statistics');
  },

  /**
   * Get user achievements
   */
  async getAchievements(): Promise<ApiResponse<import('@/types').Achievement[]>> {
    return apiClient.get('/users/me/achievements');
  },

  /**
   * Get user leaderboard position
   */
  async getLeaderboardPosition(): Promise<
    ApiResponse<{
      position: number;
      totalUsers: number;
      points: number;
    }>
  > {
    return apiClient.get('/users/me/leaderboard');
  },

  /**
   * Delete account
   */
  async deleteAccount(password: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>('/users/me');
  },

  /**
   * Export user data
   */
  async exportData(): Promise<ApiResponse<Blob>> {
    return apiClient.get('/users/me/export');
  },
};

