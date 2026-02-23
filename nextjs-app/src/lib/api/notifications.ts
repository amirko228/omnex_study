// ============================================================================
// NOTIFICATIONS API
// ============================================================================

import { apiClient } from '../api-client';
import type {
  Notification,
  NotificationPreferences,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

export const notificationsApi = {
  /**
   * Get all notifications
   */
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<Notification>>> {
    return apiClient.get<PaginatedResponse<Notification>>('/notifications', params);
  },

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return apiClient.get<{ count: number }>('/notifications/unread/count');
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<ApiResponse<void>> {
    return apiClient.patch<void>(`/notifications/${notificationId}/read`);
  },

  /**
   * Mark all as read
   */
  async markAllAsRead(): Promise<ApiResponse<void>> {
    return apiClient.patch<void>('/notifications/read-all');
  },

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/notifications/${notificationId}`);
  },

  /**
   * Delete all notifications
   */
  async deleteAll(): Promise<ApiResponse<void>> {
    return apiClient.delete<void>('/notifications/all');
  },

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    return apiClient.get<NotificationPreferences>('/notifications/preferences');
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<ApiResponse<NotificationPreferences>> {
    return apiClient.patch<NotificationPreferences>(
      '/notifications/preferences',
      preferences
    );
  },

  /**
   * Subscribe to push notifications
   */
  async subscribePush(subscription: PushSubscription): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/notifications/push/subscribe', {
      subscription: subscription.toJSON(),
    });
  },

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribePush(): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/notifications/push/unsubscribe');
  },

  /**
   * Test notification
   */
  async sendTestNotification(): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/notifications/test');
  },

  /**
   * Отправить email в поддержку (Help Center)
   */
  async sendSupportEmail(data: {
    subject: string;
    message: string;
  }): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.post<{ success: boolean; message: string }>(
      '/notifications/support',
      data
    );
  },
};
