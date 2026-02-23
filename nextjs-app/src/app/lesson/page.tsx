'use client';

import { useAppContext } from '../providers';
import { LessonPage as LessonPageComponent } from '@/components/pages/lesson-page';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LessonPage() {
    const { dict, selectedCourse, selectedFormat, setSelectedFormat, isAuthenticated, isLoading } = useAppContext();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (!dict || isLoading || !isAuthenticated) {
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
        <LessonPageComponent
            dict={dict}
            selectedCourse={selectedCourse}
            selectedFormat={selectedFormat}
            setSelectedFormat={setSelectedFormat}
            setCurrentPage={handleNavigate}
        />
    );
}
