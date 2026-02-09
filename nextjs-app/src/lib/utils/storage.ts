// ============================================================================
// STORAGE UTILITIES
// ============================================================================

/**
 * Safe localStorage wrapper with error handling
 */
export const storage = {
  /**
   * Get item from localStorage
   */
  get<T = string>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      try {
        return JSON.parse(item) as T;
      } catch {
        return item as unknown as T;
      }
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error);
      return null;
    }
  },

  /**
   * Set item in localStorage
   */
  set(key: string, value: unknown): void {
    if (typeof window === 'undefined') return;

    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Error writing to localStorage: ${key}`, error);
    }
  },

  /**
   * Remove item from localStorage
   */
  remove(key: string): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage: ${key}`, error);
    }
  },

  /**
   * Clear all localStorage
   */
  clear(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  },

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(key) !== null;
  },

  /**
   * Get all keys
   */
  keys(): string[] {
    if (typeof window === 'undefined') return [];

    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Error getting localStorage keys', error);
      return [];
    }
  },
};

/**
 * Session storage wrapper
 */
export const sessionStorage = {
  get<T = string>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = window.sessionStorage.getItem(key);
      if (!item) return null;

      try {
        return JSON.parse(item) as T;
      } catch {
        return item as unknown as T;
      }
    } catch (error) {
      console.error(`Error reading from sessionStorage: ${key}`, error);
      return null;
    }
  },

  set(key: string, value: any): void {
    if (typeof window === 'undefined') return;

    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      window.sessionStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Error writing to sessionStorage: ${key}`, error);
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;

    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from sessionStorage: ${key}`, error);
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return;

    try {
      window.sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage', error);
    }
  },

  has(key: string): boolean {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem(key) !== null;
  },
};

/**
 * Cookie utilities
 */
export const cookies = {
  get(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }

    return null;
  },

  set(
    name: string,
    value: string,
    options: {
      days?: number;
      path?: string;
      domain?: string;
      secure?: boolean;
      sameSite?: 'Strict' | 'Lax' | 'None';
    } = {}
  ): void {
    if (typeof document === 'undefined') return;

    const { days = 7, path = '/', domain, secure = true, sameSite = 'Lax' } = options;

    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = `; expires=${date.toUTCString()}`;
    }

    const domainStr = domain ? `; domain=${domain}` : '';
    const secureStr = secure ? '; secure' : '';
    const sameSiteStr = `; samesite=${sameSite}`;

    document.cookie = `${name}=${value}${expires}; path=${path}${domainStr}${secureStr}${sameSiteStr}`;
  },

  remove(name: string, path: string = '/'): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
  },

  has(name: string): boolean {
    return this.get(name) !== null;
  },
};
