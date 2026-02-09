'use client';

import { useAppContext } from '../providers';
import { LessonPage as LessonPageComponent } from '@/components/pages/lesson-page';
import { useRouter } from 'next/navigation';

export default function LessonPage() {
    const { dict, selectedCourse, selectedFormat, setSelectedFormat } = useAppContext();
    const router = useRouter();

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
        <LessonPageComponent
            dict={dict}
            selectedCourse={selectedCourse}
            selectedFormat={selectedFormat}
            setSelectedFormat={setSelectedFormat}
            setCurrentPage={handleNavigate}
        />
    );
}
