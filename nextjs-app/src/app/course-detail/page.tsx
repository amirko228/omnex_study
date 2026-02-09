'use client';

import { useAppContext } from '../providers';
import { CourseDetailPage as CourseDetailPageComponent } from '@/components/pages/course-detail-page';
import { useRouter } from 'next/navigation';

export default function CourseDetailPage() {
    const { dict, selectedCourse } = useAppContext();
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
        <CourseDetailPageComponent
            dict={dict}
            selectedCourse={selectedCourse}
            setCurrentPage={handleNavigate}
        />
    );
}
