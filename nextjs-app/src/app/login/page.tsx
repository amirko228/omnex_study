'use client';

import { useAppContext } from '../providers';
import { LoginPage as LoginPageComponent } from '@/components/auth/login-page';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
    const { dict, isAuthenticated, login } = useAppContext();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    if (!dict) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    const handleNavigate = (page: string) => {
        router.push(`/${page}`);
    };

    return (
        <LoginPageComponent
            dict={dict}
            setCurrentPage={handleNavigate}
        />
    );
}
