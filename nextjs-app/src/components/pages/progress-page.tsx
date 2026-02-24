'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/page-transition';
import { CourseCard } from '@/components/course/course-card';
import { Zap, Clock } from 'lucide-react';
import { mockCourses } from '@/lib/api/mock-data';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Course } from '@/types';

interface ProgressPageProps {
    dict: Dictionary;
    locale: string;
    onNavigate: (page: string) => void;
    setSelectedCourse: (course: Course) => void;
}

export function ProgressPage({ dict, locale, onNavigate, setSelectedCourse }: ProgressPageProps) {
    // Filter only purchased courses
    const enrolledCourses = mockCourses.filter(c => c.isEnrolled);

    return (
        <PageTransition>
            <div className="container mx-auto px-4 py-10">
                <FadeIn>
                    <h1 className="text-3xl font-bold mb-10">{dict.progress.title}</h1>
                </FadeIn>

                <StaggerContainer>
                    <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                        <StaggerItem>
                            <Card className="border-none shadow-sm ring-1 ring-border">
                                <CardHeader>
                                    <CardTitle className="text-xl">{dict.progress.overall}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4 flex items-end gap-2">
                                        <div className="text-5xl font-bold text-primary tracking-tighter">67%</div>
                                        <div className="text-muted-foreground pb-1">completion</div>
                                    </div>
                                    <Progress value={67} className="h-3 mb-4" />
                                    <p className="text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                                        Great job! You&apos;ve completed 2 courses this month. Keep up the momentum!
                                    </p>
                                </CardContent>
                            </Card>
                        </StaggerItem>

                        <StaggerItem>
                            <Card className="border-none shadow-sm ring-1 ring-border">
                                <CardHeader>
                                    <CardTitle className="text-xl">{dict.progress.learning_streak}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                                    <div className="h-20 w-20 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
                                        <Zap className="h-10 w-10 text-orange-500 fill-orange-500" />
                                    </div>
                                    <div className="text-4xl font-bold">12 days</div>
                                    <p className="text-muted-foreground mt-2">Next milestone: 15 days</p>
                                </CardContent>
                            </Card>
                        </StaggerItem>

                        <StaggerItem>
                            <Card className="border-none shadow-sm ring-1 ring-border">
                                <CardHeader>
                                    <CardTitle className="text-xl">{dict.progress.total_hours}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                                    <div className="h-20 w-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                                        <Clock className="h-10 w-10 text-blue-500" />
                                    </div>
                                    <div className="text-4xl font-bold">124h</div>
                                    <p className="text-muted-foreground mt-2">Top 5% of all learners</p>
                                </CardContent>
                            </Card>
                        </StaggerItem>
                    </div>
                </StaggerContainer>

                <FadeIn delay={0.4}>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold">{dict.progress.courses_in_progress}</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {enrolledCourses.length > 0 ? (
                            enrolledCourses.map((course) => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    dict={dict}
                                    locale={locale as import('@/lib/i18n/config').Locale}
                                    onClick={() => {
                                        setSelectedCourse(course);
                                        onNavigate('course-detail');
                                    }}
                                />
                            ))
                        ) : (
                            <p className="text-muted-foreground col-span-3 text-center py-10">
                                You are not enrolled in any courses yet.
                            </p>
                        )}
                    </div>
                </FadeIn>
            </div>
        </PageTransition>
    );
}
