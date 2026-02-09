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
        mutationFn: async ({ email, password }: any) => {
            const response = await authApi.login(email, password);
            if (!response.success) {
                throw new Error(response.error?.message || 'Login failed');
            }
            return response.data;
        },
        onSuccess: (data) => {
            if (data?.token) {
                apiClient.setToken(data.token);
                queryClient.invalidateQueries({ queryKey: ['auth-user'] });
                toast.success('Successfully logged in');
                router.push('/dashboard');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // Register mutation
    const registerMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await authApi.register(data);
            if (!response.success) {
                throw new Error(response.error?.message || 'Registration failed');
            }
            return response.data;
        },
        onSuccess: (data) => {
            if (data?.token) {
                apiClient.setToken(data.token);
                queryClient.invalidateQueries({ queryKey: ['auth-user'] });
                toast.success('Account created successfully');
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
