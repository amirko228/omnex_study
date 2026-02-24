'use client';

import { useAppContext } from '../providers';
import { RegisterPage as RegisterPageComponent } from '@/components/auth/register-page';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { RegisterDTO } from '@/types';

export default function Register() {
    const { dict, register, isAuthenticated, isLoading } = useAppContext();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) router.push('/dashboard');
    }, [isAuthenticated, router]);

    if (!dict) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

    const handleRegister = (data: RegisterDTO & { confirmPassword: string }) => {
        const { name, email, password } = data;
        register({ name, email, password });
    };

    const handleNavigate = (page: string) => {
        router.push(`/${page}`);
    };

    return (
        <RegisterPageComponent
            dict={dict}
            onSubmit={handleRegister}
            setCurrentPage={handleNavigate}
            isLoading={isLoading}
        />
    );
}
