// ============================================================================
// OAUTH UTILITIES
// ============================================================================

import { config } from '../config';
import type { OAuthProvider } from '@/types';

export const oauthUtils = {
  /**
   * Get OAuth authorization URL for Google
   */
  getGoogleAuthUrl(redirectUri: string, state?: string): string {
    const params = new URLSearchParams({
      client_id: config.oauth.google.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      ...(state && { state }),
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  },

  /**
   * Get OAuth authorization URL for VK
   */
  getVKAuthUrl(redirectUri: string, state?: string): string {
    const params = new URLSearchParams({
      client_id: config.oauth.vk.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'email',
      display: 'page',
      ...(state && { state }),
    });

    return `https://oauth.vk.com/authorize?${params.toString()}`;
  },

  /**
   * Get OAuth authorization URL for Yandex
   */
  getYandexAuthUrl(redirectUri: string, state?: string): string {
    const params = new URLSearchParams({
      client_id: config.oauth.yandex.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      ...(state && { state }),
    });

    return `https://oauth.yandex.ru/authorize?${params.toString()}`;
  },

  /**
   * Get OAuth URL by provider
   */
  getAuthUrl(provider: OAuthProvider, redirectUri: string, state?: string): string {
    switch (provider) {
      case 'google':
        return this.getGoogleAuthUrl(redirectUri, state);
      case 'vk':
        return this.getVKAuthUrl(redirectUri, state);
      case 'yandex':
        return this.getYandexAuthUrl(redirectUri, state);
      default:
        throw new Error(`Unknown OAuth provider: ${provider}`);
    }
  },

  /**
   * Generate random state for OAuth
   */
  generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  },

  /**
   * Store OAuth state in sessionStorage
   */
  storeState(state: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem('oauth_state', state);
  },

  /**
   * Get stored OAuth state
   */
  getStoredState(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('oauth_state');
  },

  /**
   * Verify OAuth state
   */
  verifyState(state: string): boolean {
    const storedState = this.getStoredState();
    return storedState === state;
  },

  /**
   * Clear OAuth state
   */
  clearState(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem('oauth_state');
  },

  /**
   * Parse OAuth callback URL
   */
  parseCallback(url: string): { code?: string; state?: string; error?: string } {
    const params = new URLSearchParams(new URL(url).search);
    return {
      code: params.get('code') || undefined,
      state: params.get('state') || undefined,
      error: params.get('error') || undefined,
    };
  },

  /**
   * Initiate OAuth flow
   */
  initiateOAuth(provider: OAuthProvider, redirectUri: string): void {
    const state = this.generateState();
    this.storeState(state);

    const authUrl = this.getAuthUrl(provider, redirectUri, state);
    window.location.href = authUrl;
  },
};