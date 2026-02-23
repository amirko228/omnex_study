'use client';

import { useAppContext } from '../providers';
import { CourseDetailPage as CourseDetailPageComponent } from '@/components/pages/course-detail-page';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CourseDetailPage() {
    const { dict, selectedCourse, isAuthenticated, isLoading } = useAppContext();
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
        <CourseDetailPageComponent
            dict={dict}
            selectedCourse={selectedCourse}
            setCurrentPage={handleNavigate}
        />
    );
}
