'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useAuth() {
    const queryClient = useQueryClient();
    const router = useRouter();

    // Fetch current user
    const { data: user, isLoading: isLoadingUser } = useQuery({
        queryKey: ['auth-user'],
        queryFn: async () => {
            // Don't fetch if no token
            if (typeof window !== 'undefined' && !localStorage.getItem('auth_token')) {
                return null;
            }
            const response = await authApi.getCurrentUser();
            if (!response.success) {
                throw new Error(response.error?.message);
            }
            return response.data;
        },
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: async ({ email, password }: import('@/types').LoginCredentials) => {
            const response = await authApi.login(email, password || '');
            if (!response.success) {
                throw new Error(response.error?.message || 'Login failed');
            }
            return response.data;
        },
        onSuccess: (data) => {
            if (data?.token) {
                apiClient.setToken(data.token);
                if (data.refreshToken && typeof window !== 'undefined') {
                    localStorage.setItem('refresh_token', data.refreshToken);
                }
                queryClient.invalidateQueries({ queryKey: ['auth-user'] });
                toast.success('Успешный вход');
                router.push('/dashboard');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // Register mutation
    const registerMutation = useMutation({
        mutationFn: async (data: import('@/types').RegisterDTO) => {
            // Strip fields not accepted by backend DTO
            const { email, password, name, locale } = data as import('@/types').RegisterDTO & { confirmPassword?: string };
            const response = await authApi.register({ email, password, name, locale });
            if (!response.success) {
                throw new Error(response.error?.message || 'Registration failed');
            }
            return response.data;
        },
        onSuccess: (data) => {
            if (data?.token) {
                apiClient.setToken(data.token);
                if (data.refreshToken && typeof window !== 'undefined') {
                    localStorage.setItem('refresh_token', data.refreshToken);
                }
                queryClient.invalidateQueries({ queryKey: ['auth-user'] });
                toast.success('Аккаунт создан');
                router.push('/dashboard');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const logout = () => {
        apiClient.removeToken();
        queryClient.setQueryData(['auth-user'], null);
        router.push('/login');
        toast.info('Logged out');
    };

    return {
        user,
        isAuthenticated: !!user,
        isLoading: isLoadingUser,
        login: loginMutation.mutate,
        isLoggingIn: loginMutation.isPending,
        register: registerMutation.mutate,
        isRegistering: registerMutation.isPending,
        logout,
    };
}
