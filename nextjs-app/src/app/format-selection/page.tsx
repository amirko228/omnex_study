'use client';

import { useAppContext } from '../providers';
import { FormatSelection } from '@/components/course/format-selection';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { CourseFormat } from '@/types';

export default function FormatSelectionPage() {
    const { dict, selectedCourse, setSelectedFormat, isAuthenticated, isLoading } = useAppContext();
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

    const handleSelectFormat = (format: CourseFormat) => {
        setSelectedFormat(format);
        router.push('/lesson');
    };

    const handleBack = () => {
        router.push('/course-detail');
    };

    return (
        <FormatSelection
            dict={dict}
            courseTitle={selectedCourse.title}
            onSelectFormat={handleSelectFormat}
            onBack={handleBack}
        />
    );
}
