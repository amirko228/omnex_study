// ============================================================================
// API CLIENT
// ============================================================================

import { config } from './config';
import type { ApiResponse, ApiRequestOptions } from '@/types';

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.timeout = config.api.timeout;
  }

  /**
   * Get authentication token from storage
   */
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(config.auth.tokenKey) || sessionStorage.getItem(config.auth.tokenKey);
  }

  /**
   * Set authentication token to storage
   */
  setToken(token: string, remember: boolean = true): void {
    if (typeof window === 'undefined') return;

    if (remember) {
      localStorage.setItem(config.auth.tokenKey, token);
      sessionStorage.removeItem(config.auth.tokenKey); // Ensure it's not in session
    } else {
      sessionStorage.setItem(config.auth.tokenKey, token);
      localStorage.removeItem(config.auth.tokenKey); // Ensure it's not in local
    }
  }

  /**
   * Remove authentication token from storage
   */
  removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem(config.auth.refreshTokenKey);
    sessionStorage.removeItem(config.auth.tokenKey);
    sessionStorage.removeItem(config.auth.refreshTokenKey);
  }

  /**
   * Build URL with query parameters
   */
  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined | null>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    endpoint: string,
    options: ApiRequestOptions & { _retry?: boolean } = {}
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', headers = {}, body, params, _retry = false } = options;

    const url = this.buildUrl(endpoint, params);
    const token = this.getToken();

    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized - Try to refresh token
      if (response.status === 401 && !_retry && typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem(config.auth.refreshTokenKey) ||
          sessionStorage.getItem(config.auth.refreshTokenKey);

        if (refreshToken) {
          try {
            // Call refresh endpoint directly to avoid recursion
            const refreshRes = await fetch(`${this.baseUrl}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              const newToken = refreshData.data?.token || refreshData.token;
              const newRefreshToken = refreshData.data?.refreshToken || refreshData.refreshToken;

              if (newToken) {
                // Save new tokens
                const remember = !!localStorage.getItem(config.auth.tokenKey);
                this.setToken(newToken, remember);
                if (newRefreshToken) {
                  const storage = remember ? localStorage : sessionStorage;
                  storage.setItem(config.auth.refreshTokenKey, newRefreshToken);
                }

                // Retry original request with new token
                return this.request<T>(endpoint, { ...options, _retry: true });
              }
            }
          } catch {
            // silently ignored
          }
        }

        // If refresh failed or no refresh token, logout 
        // But DON'T logout if it's a password change or account deletion request returning 401 (likely wrong current password)
        const isSensitiveAction = endpoint.includes('/auth/change-password') ||
          (endpoint.includes('/users/me') && method === 'DELETE');

        if (!isSensitiveAction) {
          this.removeToken();
          // Dispath custom event to notify UI to re-login if needed
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.error?.code || String(response.status),
            message: data.error?.message || data.message || 'Request failed',
            details: data.error?.details || data,
          },
        };
      }

      return {
        success: true,
        data: (data.data || data) as T,
        message: data.message,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';

      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: errorMessage,
        },
      };
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined | null>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', body });
  }

  /**
   * Upload file
   */
  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const token = this.getToken();
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: String(response.status),
            message: data.message || 'Upload failed',
            details: data,
          },
        };
      }

      return {
        success: true,
        data: (data.data || data) as T,
        message: data.message,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      return {
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: errorMessage,
        },
      };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
