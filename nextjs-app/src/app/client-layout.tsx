'use client';

import { useAppContext } from './providers';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/Footer';
import { useRouter, usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

export function ClientLayout({ children }: { children: ReactNode }) {
    const {
        dict,
        locale,
        setLocale,
        user,
        logout
    } = useAppContext();
    const router = useRouter();
    const pathname = usePathname();

    if (!dict) {
        return (
            <div className="flex h-screen items-center justify-center bg-background text-primary">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
                Загрузка платформы...
            </div>
        );
    }

    const currentPage = pathname.substring(1) || 'landing';

    const handleNavigate = (page: string) => {
        if (page === '' || page === 'landing') {
            router.push('/');
        } else {
            router.push(`/${page}`);
        }
    };

    const handleLogout = () => {
        logout();
        toast.success(dict?.toasts?.logout_success || 'Вы вышли из аккаунта');
        router.push('/');
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar
                dict={dict}
                locale={locale}
                setLocale={setLocale}
                currentPage={currentPage}
                setCurrentPage={handleNavigate}
                user={user}
                onLogout={handleLogout}
            />
            <main className="flex-1">
                {children}
            </main>
            <Footer
                dict={dict}
                onNavigate={handleNavigate}
            />
        </div>
    );
}
