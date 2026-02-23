import { config } from '../config';

/**
 * Декод JWT токена для получения userId
 */
export function getUserIdFromToken(): string | null {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem(config.auth.tokenKey) || sessionStorage.getItem(config.auth.tokenKey);
    if (!token) return null;

    try {
        // JWT токен состоит из 3 частей: header.payload.signature
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        // Декодируем payload (вторая часть)
        const payload = JSON.parse(atob(parts[1]));

        // Возвращаем userId (обычно хранится как 'sub' или 'userId' в payload)
        return payload.sub || payload.userId || payload.id || null;
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
}
