'use client';

import { ThemeProvider } from "@/lib/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "@/lib/react-query-provider";
import { useState, useEffect, useCallback, createContext, useContext, useMemo, type ReactNode } from 'react';
import { getDictionary, type Dictionary } from '@/lib/i18n/dictionaries';
import { mockCourses } from '@/lib/api/mock-data';
import type { Locale } from '@/lib/i18n/config';
import type { CourseFormat, User, LoginCredentials, RegisterDTO } from '@/types';
import { useAuth } from '@/lib/hooks/useAuth';
import { paymentsApi } from '@/lib/api/payments';

type AppContextType = {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null | undefined;
    login: (data: LoginCredentials) => void;
    register: (data: RegisterDTO) => void;
    logout: () => void;
    refetchUser: () => void;
    locale: Locale;
    setLocale: (locale: Locale) => void;
    dict: Dictionary | null;
    purchasedCourses: string[];
    purchaseCourse: (courseId: string) => void;
    subscription: 'free' | 'pro' | 'enterprise';
    subscribe: (planId: 'free' | 'pro' | 'enterprise') => Promise<void>;
    selectedFormat: CourseFormat;
    setSelectedFormat: (format: CourseFormat) => void;
    selectedCourse: typeof mockCourses[0];
    setSelectedCourse: (course: typeof mockCourses[0]) => void;
};

const AppContext = createContext<AppContextType | null>(null);

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within AppProvider');
    }
    return context;
}

function getStoredLocale(): Locale {
    if (typeof window !== 'undefined') {
        return (localStorage.getItem('omnex-locale') as Locale) || 'ru';
    }
    return 'ru';
}

function getStoredPurchased(): string[] {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('omnex-purchased');
        if (saved) return JSON.parse(saved);
    }
    return [];
}

function getStoredSubscription(): 'free' | 'pro' | 'enterprise' {
    if (typeof window !== 'undefined') {
        return (localStorage.getItem('omnex-subscription') as 'free' | 'pro' | 'enterprise') || 'free';
    }
    return 'free';
}

function AppStateProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, user, login, register, logout, isLoading, refetch } = useAuth();

    const [locale, setLocale] = useState<Locale>(getStoredLocale);
    const [dict, setDict] = useState<Dictionary | null>(null);
    const [localPurchasedCourses, setLocalPurchasedCourses] = useState<string[]>(getStoredPurchased);
    const [selectedFormat, setSelectedFormat] = useState<CourseFormat>('text');
    const [selectedCourse, setSelectedCourse] = useState(mockCourses[0]);
    const [localSubscription, setLocalSubscription] = useState<'free' | 'pro' | 'enterprise'>(getStoredSubscription);

    const purchasedCourses = useMemo(() => {
        if (localPurchasedCourses.length > 0) return localPurchasedCourses;
        return user?.purchasedCourses ?? [];
    }, [localPurchasedCourses, user?.purchasedCourses]);

    const subscription = useMemo(() => {
        return user?.subscription ?? localSubscription;
    }, [user?.subscription, localSubscription]);

    useEffect(() => {
        getDictionary(locale).then(setDict);
        if (typeof window !== 'undefined') {
            localStorage.setItem('omnex-locale', locale);
        }
    }, [locale]);

    const purchaseCourse = useCallback(async (courseId: string) => {
        try {
            await paymentsApi.createPayment({
                amount: 0,
                currency: 'USD',
                provider: 'stripe' as never,
                metadata: { courseId },
            });
        } catch {
            // Billing API unavailable, saving locally
        }
        setLocalPurchasedCourses(prev => {
            const newPurchased = [...prev, courseId];
            if (typeof window !== 'undefined') {
                localStorage.setItem('omnex-purchased', JSON.stringify(newPurchased));
            }
            return newPurchased;
        });
    }, []);

    const subscribe = useCallback(async (planId: 'free' | 'pro' | 'enterprise') => {
        try {
            await paymentsApi.createPayment({
                amount: planId === 'pro' ? 29.99 : planId === 'enterprise' ? 99.99 : 0,
                currency: 'USD',
                provider: 'stripe' as never,
                description: `Subscription ${planId}`,
                metadata: { plan: planId },
            });
        } catch {
            // Billing API unavailable, saving locally
        }
        setLocalSubscription(planId);
        if (typeof window !== 'undefined') {
            localStorage.setItem('omnex-subscription', planId);
        }
    }, []);

    const value: AppContextType = useMemo(() => ({
        isAuthenticated,
        isLoading,
        user,
        login,
        register: (data: RegisterDTO) => { register(data); },
        logout,
        refetchUser: refetch,
        locale,
        setLocale,
        dict,
        purchasedCourses,
        purchaseCourse,
        subscription,
        subscribe,
        selectedFormat,
        setSelectedFormat,
        selectedCourse,
        setSelectedCourse,
    }), [isAuthenticated, isLoading, user, login, register, logout, refetch, locale, dict, purchasedCourses, purchaseCourse, selectedFormat, selectedCourse, subscription, subscribe]);

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ReactQueryProvider>
            <ThemeProvider defaultTheme="system" storageKey="omnex-theme">
                <AppStateProvider>
                    {children}
                    <Toaster position="top-center" richColors />
                </AppStateProvider>
            </ThemeProvider>
        </ReactQueryProvider>
    );
}
