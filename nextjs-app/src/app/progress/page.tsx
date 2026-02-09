'use client';

import { useAppContext } from '../providers';
import { ProgressPage as ProgressPageComponent } from '@/components/pages/progress-page';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProgressPage() {
    const { dict, isAuthenticated, locale, setSelectedCourse } = useAppContext();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!dict || !isAuthenticated) {
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
        <ProgressPageComponent
            dict={dict}
            locale={locale}
            onNavigate={handleNavigate}
            setSelectedCourse={setSelectedCourse}
        />
    );
}
