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
    return localStorage.getItem(config.auth.tokenKey);
  }

  /**
   * Set authentication token to storage
   */
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(config.auth.tokenKey, token);
  }

  /**
   * Remove authentication token from storage
   */
  removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem(config.auth.refreshTokenKey);
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
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
  private async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', headers = {}, body, params } = options;

    const url = this.buildUrl(endpoint, params);
    const token = this.getToken();

    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    // ========================================================================
    // MOCK API IMPLEMENTATION
    // ========================================================================
    // Intercept requests and return mock data if no backend is available

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // console.log(`[Mock API] ${method} ${endpoint}`, body || params);

    try {
      // Auth: Login
      if (endpoint === '/auth/login') {
        const { email } = body as any;
        // Import mock data dynamically to avoid circular dependencies if any
        const { mockUser } = await import('@/lib/api/mock-data');

        return {
          success: true,
          data: {
            user: { ...mockUser, email },
            token: 'mock_jwt_token_12345',
            refreshToken: 'mock_refresh_token_67890'
          } as any,
          message: 'Successfully logged in'
        };
      }

      // Auth: Register
      if (endpoint === '/auth/register') {
        const { email, name } = body as any;
        const { mockUser } = await import('@/lib/api/mock-data');

        return {
          success: true,
          data: {
            user: { ...mockUser, email, name: name || mockUser.name },
            token: 'mock_jwt_token_12345',
            refreshToken: 'mock_refresh_token_67890'
          } as any,
          message: 'Registration successful'
        };
      }

      // User: Get Current
      if (endpoint === '/auth/me' || endpoint === '/users/me') {
        const { mockUser } = await import('@/lib/api/mock-data');
        return {
          success: true,
          data: mockUser as any
        };
      }

      // Logout
      if (endpoint === '/auth/logout') {
        return {
          success: true,
          data: null as any,
          message: 'Logged out successfully'
        };
      }

      // Courses: List
      if (endpoint === '/courses') {
        const { mockCourses } = await import('@/lib/api/mock-data');
        return {
          success: true,
          data: mockCourses as any
        };
      }

      // Courses: Get One
      if (endpoint.startsWith('/courses/')) {
        const { mockCourses } = await import('@/lib/api/mock-data');
        const courseId = endpoint.split('/').pop();
        const course = mockCourses.find(c => c.id === courseId);

        if (course) {
          return {
            success: true,
            data: course as any
          };
        }
      }
    } catch (e) {
      console.warn('[Mock API] Error in mock handler:', e);
    }

    // ========================================================================
    // REAL API FALLBACK
    // ========================================================================

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

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: String(response.status),
            message: data.message || 'Request failed',
            details: data,
          },
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error: any) {
      console.error('API Request Error:', error);

      // If mock didn't catch it and real auth failed, check if it was an auth endpoint
      // and fail gracefully or force success for demo if needed.
      // For now, return error.

      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error.message || 'Network error occurred',
        },
      };
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Upload file
   */
  async upload<T = any>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
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
        data: data.data || data,
        message: data.message,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: error.message || 'Upload failed',
        },
      };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
