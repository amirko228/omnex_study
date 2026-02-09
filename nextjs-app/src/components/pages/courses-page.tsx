'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Search } from 'lucide-react';
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/page-transition';
import { CourseCard } from '@/components/course/course-card';
import { DictionaryFallback } from '@/components/ui/dictionary-fallback';
import { mockCourses } from '@/lib/api/mock-data';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';

import type { Course } from '@/types';

interface CoursesPageProps {
    dict: Dictionary;
    locale: Locale;
    purchasedCourses: string[];
    setCurrentPage: (page: string) => void;
    setSelectedCourse: (course: Course) => void;
}

export const CoursesPage = ({ dict, locale, purchasedCourses, setCurrentPage, setSelectedCourse }: CoursesPageProps) => {
    // Null-safety проверка словаря
    if (!dict?.courses) {
        return <DictionaryFallback />;
    }

    const purchasedCoursesData = mockCourses.filter(course =>
        purchasedCourses.includes(course.id)
    );

    return (
        <PageTransition>
            <div className="container mx-auto px-4 py-10">
                <FadeIn>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{dict.courses.my_courses_title}</h1>
                            <p className="text-muted-foreground">{dict.courses.my_courses_subtitle}</p>
                        </div>
                        <Button onClick={() => setCurrentPage('catalog')} className="h-11">
                            <Search className="mr-2 h-4 w-4" />
                            {dict.courses.buy_new_courses}
                        </Button>
                    </div>
                </FadeIn>

                {purchasedCoursesData.length === 0 ? (
                    <FadeIn>
                        <Card className="border-2 border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12 md:py-20 px-4">
                                <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-muted flex items-center justify-center mb-4 md:mb-6">
                                    <BookOpen className="h-7 w-7 md:h-8 md:w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold mb-2 text-center px-4">{dict.courses.no_courses_title}</h3>
                                <p className="text-sm md:text-base text-muted-foreground mb-6 text-center max-w-md px-4">
                                    {dict.courses.no_courses_description}
                                </p>
                                <Button
                                    onClick={() => setCurrentPage('catalog')}
                                    className="whitespace-normal h-auto py-3 px-6 text-sm md:text-base"
                                >
                                    <span className="truncate">{dict.courses.go_to_catalog}</span>
                                </Button>
                            </CardContent>
                        </Card>
                    </FadeIn>
                ) : (
                    <StaggerContainer>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {purchasedCoursesData.map((course) => (
                                <StaggerItem key={course.id}>
                                    <CourseCard
                                        course={course}
                                        dict={dict}
                                        locale={locale}
                                        onClick={() => {
                                            setSelectedCourse(course);
                                            setCurrentPage('course-detail');
                                        }}
                                    />
                                </StaggerItem>
                            ))}
                        </div>
                    </StaggerContainer>
                )}
            </div>
        </PageTransition>
    );
};
