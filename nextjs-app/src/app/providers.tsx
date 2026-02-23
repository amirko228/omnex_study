'use client';

import { ThemeProvider } from "@/lib/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "@/lib/react-query-provider";
import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { getDictionary, type Dictionary } from '@/lib/i18n/dictionaries';
import { mockCourses } from '@/lib/api/mock-data';
import type { Locale } from '@/lib/i18n/config';
import type { CourseFormat, User, LoginCredentials, RegisterDTO } from '@/types';
import { useAuth } from '@/lib/hooks/useAuth';
import { paymentsApi } from '@/lib/api/payments';

// App Context
type AppContextType = {
    // Auth
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null | undefined;
    login: (data: LoginCredentials) => void;
    register: (data: RegisterDTO) => void;
    logout: () => void;
    refetchUser: () => void;
    // Locale
    locale: Locale;
    setLocale: (locale: Locale) => void;
    dict: Dictionary | null;
    // Courses
    purchasedCourses: string[];
    purchaseCourse: (courseId: string) => void;
    // Subscription
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

function AppStateProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, user, login, register, logout, isLoading, refetch } = useAuth();

    const [locale, setLocale] = useState<Locale>('ru');
    const [dict, setDict] = useState<Dictionary | null>(null);
    const [purchasedCourses, setPurchasedCourses] = useState<string[]>([]);
    const [selectedFormat, setSelectedFormat] = useState<CourseFormat>('text');
    const [selectedCourse, setSelectedCourse] = useState(mockCourses[0]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedLocale = localStorage.getItem('omnex-locale') as Locale;
            if (savedLocale) {
                setLocale(savedLocale);
            }
            const savedPurchased = localStorage.getItem('omnex-purchased');
            if (savedPurchased) {
                setPurchasedCourses(JSON.parse(savedPurchased));
            } else if (user?.purchasedCourses) {
                // Если нет сохраненных, берем из профиля пользователя (mock data)
                setPurchasedCourses(user.purchasedCourses);
            }
        }
    }, [user]);

    useEffect(() => {
        getDictionary(locale).then(setDict);
        if (typeof window !== 'undefined') {
            localStorage.setItem('omnex-locale', locale);
        }
    }, [locale]);

    const [subscription, setSubscription] = useState<'free' | 'pro' | 'enterprise'>('free');

    const purchaseCourse = async (courseId: string) => {
        try {
            await paymentsApi.createPayment({
                amount: 0,
                currency: 'USD',
                provider: 'stripe' as any,
                metadata: { courseId },
            });
        } catch (err) {
            console.warn('Billing API unavailable, saving locally:', err);
        }
        const newPurchased = [...purchasedCourses, courseId];
        setPurchasedCourses(newPurchased);
        if (typeof window !== 'undefined') {
            localStorage.setItem('omnex-purchased', JSON.stringify(newPurchased));
        }
    };

    const subscribe = async (planId: 'free' | 'pro' | 'enterprise') => {
        try {
            // Вызываем реальный API подписки
            await paymentsApi.createPayment({
                amount: planId === 'pro' ? 29.99 : planId === 'enterprise' ? 99.99 : 0,
                currency: 'USD',
                provider: 'stripe' as any,
                description: `Подписка ${planId}`,
                metadata: { plan: planId },
            });
        } catch (err) {
            console.warn('Billing API unavailable, saving locally:', err);
        }
        setSubscription(planId);
        if (typeof window !== 'undefined') {
            localStorage.setItem('omnex-subscription', planId);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedSubscription = localStorage.getItem('omnex-subscription') as 'free' | 'pro' | 'enterprise';
            if (savedSubscription) {
                setSubscription(savedSubscription);
            } else if (user?.subscription) {
                setSubscription(user.subscription);
            }
        }
    }, [user]);

    const value: AppContextType = {
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
    };

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
