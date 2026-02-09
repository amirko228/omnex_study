'use client';

import { useAppContext } from '../providers';
import { CoursesCatalog } from '@/components/pages/courses-catalog';
import { mockCourses } from '@/lib/api/mock-data';
import { useRouter } from 'next/navigation';

export default function CatalogPage() {
    const { dict, purchasedCourses, purchaseCourse, setSelectedCourse } = useAppContext();
    const router = useRouter();

    if (!dict) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    const handleViewCourse = (course: typeof mockCourses[0]) => {
        setSelectedCourse(course);
        router.push('/course-detail');
    };

    return (
        <CoursesCatalog
            courses={mockCourses}
            purchasedCourses={purchasedCourses}
            onPurchaseCourse={purchaseCourse}
            onViewCourse={handleViewCourse}
            dict={dict}
        />
    );
}
