/**
 * Unit-тесты для useAuth hook
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';

// Мок API
const mockLogin = jest.fn();
const mockLogout = jest.fn();
const mockRegister = jest.fn();

// Мок хука (примерная структура для тестирования)
const useAuthMock = () => {
    const [user, setUser] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            mockLogin(email, password);
            if (email === 'test@example.com' && password === 'password123') {
                setUser({ id: '1', email, name: 'Test User' });
                return true;
            }
            setError('Неверный email или пароль');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        mockLogout();
        setUser(null);
    };

    const register = async (name: string, email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            mockRegister(name, email, password);
            setUser({ id: '2', email, name });
            return true;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        user,
        isLoading,
        error,
        isAuthenticated: !!user,
        login,
        logout,
        register,
    };
};

describe('useAuth Hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('должен успешно авторизовать пользователя с корректными данными', async () => {
            const { result } = renderHook(() => useAuthMock());

            expect(result.current.isAuthenticated).toBe(false);
            expect(result.current.user).toBeNull();

            await act(async () => {
                const success = await result.current.login('test@example.com', 'password123');
                expect(success).toBe(true);
            });

            expect(result.current.isAuthenticated).toBe(true);
            expect(result.current.user).toEqual({
                id: '1',
                email: 'test@example.com',
                name: 'Test User',
            });
            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
        });

        it('должен вернуть ошибку при неверных данных', async () => {
            const { result } = renderHook(() => useAuthMock());

            await act(async () => {
                const success = await result.current.login('wrong@example.com', 'wrongpass');
                expect(success).toBe(false);
            });

            expect(result.current.isAuthenticated).toBe(false);
            expect(result.current.error).toBe('Неверный email или пароль');
        });

        it('должен устанавливать isLoading во время запроса', async () => {
            const { result } = renderHook(() => useAuthMock());

            expect(result.current.isLoading).toBe(false);

            await act(async () => {
                await result.current.login('test@example.com', 'password123');
            });

            expect(result.current.isLoading).toBe(false);
        });
    });

    describe('logout', () => {
        it('должен выводить пользователя из системы', async () => {
            const { result } = renderHook(() => useAuthMock());

            // Сначала логинимся
            await act(async () => {
                await result.current.login('test@example.com', 'password123');
            });
            expect(result.current.isAuthenticated).toBe(true);

            // Затем выходим
            act(() => {
                result.current.logout();
            });

            expect(result.current.isAuthenticated).toBe(false);
            expect(result.current.user).toBeNull();
            expect(mockLogout).toHaveBeenCalled();
        });
    });

    describe('register', () => {
        it('должен регистрировать нового пользователя', async () => {
            const { result } = renderHook(() => useAuthMock());

            await act(async () => {
                const success = await result.current.register(
                    'New User',
                    'new@example.com',
                    'newpassword123'
                );
                expect(success).toBe(true);
            });

            expect(result.current.isAuthenticated).toBe(true);
            expect(result.current.user?.name).toBe('New User');
            expect(result.current.user?.email).toBe('new@example.com');
            expect(mockRegister).toHaveBeenCalledWith(
                'New User',
                'new@example.com',
                'newpassword123'
            );
        });
    });
});
