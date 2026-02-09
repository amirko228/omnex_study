'use client';

import { useAppContext } from '../providers';
import { FormatSelection } from '@/components/course/format-selection';
import { useRouter } from 'next/navigation';
import type { CourseFormat } from '@/types';

export default function FormatSelectionPage() {
    const { dict, selectedCourse, setSelectedFormat } = useAppContext();
    const router = useRouter();

    if (!dict) {
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
