import { useLocalStorage } from './useLocalStorage';
import { mockUser } from '@/lib/api/mock-data';
import { useCourseProgress } from './useCourseProgress';

export function useCourses() {
    const [purchasedCourses, setPurchasedCourses] = useLocalStorage<string[]>(
        'ai-learning-purchased-courses',
        mockUser.purchasedCourses ?? []
    );

    const [selectedFormat, setSelectedFormat] = useLocalStorage<
        'text' | 'quiz' | 'chat' | 'assignment' | null
    >('ai-learning-selected-format', null);

    const courseProgress = useCourseProgress();

    const purchaseCourse = (courseId: string) => {
        if (!purchasedCourses.includes(courseId)) {
            setPurchasedCourses((prev) => [...prev, courseId]);
            courseProgress.enrollCourse(courseId);
        }
    };

    const hasPurchasedCourse = (courseId: string): boolean => {
        return purchasedCourses.includes(courseId);
    };

    return {
        purchasedCourses,
        purchaseCourse,
        hasPurchasedCourse,
        selectedFormat,
        setSelectedFormat,
    };
}
