'use client';

import { useAppContext } from '../providers';
import { CoursesPage as CoursesPageComponent } from '@/components/pages/courses-page';
import { useRouter } from 'next/navigation';

export default function CoursesPage() {
    const { dict, locale, purchasedCourses, setSelectedCourse } = useAppContext();
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
        <CoursesPageComponent
            dict={dict}
            locale={locale}
            purchasedCourses={purchasedCourses}
            setCurrentPage={handleNavigate}
            setSelectedCourse={setSelectedCourse}
        />
    );
}
