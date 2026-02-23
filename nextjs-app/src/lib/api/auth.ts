// ============================================================================
// AUTH API
// ============================================================================

import { apiClient } from '../api-client';
import type {
  User,
  AuthResponse,
  AuthTokens,
  OAuthProvider,
  ApiResponse
} from '@/types';

export const authApi = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/auth/login', { email, password });
  },

  /**
   * Register new user
   */
  async register(data: {
    email: string;
    password: string;
    name: string;
    locale?: string;
  }): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  /**
   * Logout current user
   */
  async logout(): Promise<ApiResponse<void>> {
    const response = await apiClient.post<void>('/auth/logout');
    apiClient.removeToken();
    return response;
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/auth/me');
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    return apiClient.post<AuthTokens>('/auth/refresh', { refreshToken });
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/password-reset/request', { email });
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/password-reset/confirm', {
      token,
      newPassword,
    });
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/verify-email', { token });
  },

  /**
   * Resend email verification
   */
  async resendVerification(): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/verify-email/resend');
  },

  /**
   * OAuth - Get authorization URL
   */
  getOAuthUrl(provider: OAuthProvider, redirectUri: string): string {
    const baseUrl = apiClient['baseUrl'];
    return `${baseUrl}/auth/oauth/${provider}?redirect_uri=${encodeURIComponent(redirectUri)}`;
  },

  /**
   * OAuth - Exchange code for tokens
   */
  async oauthCallback(
    provider: OAuthProvider,
    code: string,
    state?: string,
    redirectUri?: string
  ): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>(`/auth/oauth/${provider}/callback`, {
      code,
      state,
      redirectUri,
    });
  },

  /**
   * Enable 2FA
   */
  async enable2FA(): Promise<ApiResponse<{ secret: string; qrCode: string }>> {
    return apiClient.post<{ secret: string; qrCode: string }>('/auth/2fa/enable');
  },

  /**
   * Verify 2FA code
   */
  async verify2FA(code: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/2fa/verify', { code });
  },

  /**
   * Disable 2FA
   */
  async disable2FA(password: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/2fa/disable', { password });
  },

  /**
   * Change password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },
};
