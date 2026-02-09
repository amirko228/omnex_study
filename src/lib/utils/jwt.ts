// ============================================================================
// JWT UTILITIES
// ============================================================================

import { config } from '../config';

export const jwtUtils = {
  /**
   * Decode JWT token (without verification - client-side only)
   */
  decode(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  },

  /**
   * Check if token is expired
   */
  isExpired(token: string): boolean {
    const decoded = this.decode(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  },

  /**
   * Get token expiry time
   */
  getExpiry(token: string): Date | null {
    const decoded = this.decode(token);
    if (!decoded || !decoded.exp) return null;

    return new Date(decoded.exp * 1000);
  },

  /**
   * Get time until expiry in seconds
   */
  getTimeUntilExpiry(token: string): number {
    const decoded = this.decode(token);
    if (!decoded || !decoded.exp) return 0;

    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, decoded.exp - currentTime);
  },

  /**
   * Check if token needs refresh (less than 5 minutes until expiry)
   */
  needsRefresh(token: string): boolean {
    const timeUntilExpiry = this.getTimeUntilExpiry(token);
    return timeUntilExpiry < 300; // 5 minutes
  },

  /**
   * Store token in localStorage
   */
  store(token: string, refreshToken?: string): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(config.auth.tokenKey, token);
    if (refreshToken) {
      localStorage.setItem(config.auth.refreshTokenKey, refreshToken);
    }
  },

  /**
   * Get token from localStorage
   */
  get(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(config.auth.tokenKey);
  },

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(config.auth.refreshTokenKey);
  },

  /**
   * Remove tokens from localStorage
   */
  remove(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem(config.auth.refreshTokenKey);
  },
};
