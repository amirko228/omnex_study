'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Check, Star, BookOpen, Clock } from 'lucide-react';
import { DictionaryFallback } from '@/components/ui/dictionary-fallback';
import type { Dictionary } from '@/lib/i18n/dictionaries';

interface CourseDetailPageProps {
    dict: Dictionary;
    selectedCourse: any;
    setCurrentPage: (page: any) => void;
}

export const CourseDetailPage = ({ dict, selectedCourse, setCurrentPage }: CourseDetailPageProps) => {
    // Null-safety проверка словаря
    if (!dict?.course) {
        return <DictionaryFallback />;
    }

    return (
        <div className="container mx-auto px-4 py-10">
            <Button variant="ghost" className="mb-6 -ml-2" onClick={() => setCurrentPage('courses')}>
                <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                {dict.course.back_to_courses}
            </Button>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <div className="mb-10 aspect-video overflow-hidden rounded-2xl shadow-xl ring-1 ring-border">
                        <img src={selectedCourse.thumbnail} alt={selectedCourse.title} className="h-full w-full object-cover" />
                    </div>

                    <div className="mb-6">
                        <h1 className="text-4xl font-bold mb-4">{selectedCourse.title}</h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">{selectedCourse.description}</p>
                    </div>

                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 mb-8 space-x-8">
                            <TabsTrigger
                                value="overview"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-0 py-3 text-base font-medium"
                            >
                                {dict.course.overview}
                            </TabsTrigger>
                            <TabsTrigger
                                value="curriculum"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-0 py-3 text-base font-medium"
                            >
                                {dict.course.curriculum}
                            </TabsTrigger>
                            <TabsTrigger
                                value="reviews"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-0 py-3 text-base font-medium"
                            >
                                {dict.course.reviews}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-10 focus-visible:outline-none">
                            <div>
                                <h3 className="text-2xl font-bold mb-6">{dict.course.what_you_learn}</h3>
                                <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {dict.course.learning_points.map((item: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 p-4 rounded-xl border bg-muted/30">
                                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                <Check className="h-4 w-4 text-primary font-bold" />
                                            </div>
                                            <span className="text-base text-foreground/80">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </TabsContent>

                        <TabsContent value="curriculum" className="focus-visible:outline-none">
                            <div className="space-y-6">
                                {selectedCourse.modules.map((module: any, idx: number) => (
                                    <Card key={module.id} className="overflow-hidden border-none shadow-sm ring-1 ring-border">
                                        <CardHeader className="bg-muted/30">
                                            <CardTitle className="text-lg">
                                                <span className="text-primary mr-2">Module {idx + 1}:</span> {module.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="divide-y">
                                                {module.lessons.map((lesson: any) => (
                                                    <div
                                                        key={lesson.id}
                                                        className="flex items-center justify-between p-5 cursor-pointer hover:bg-muted/50 transition-colors group"
                                                        onClick={() => setCurrentPage('lesson')}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center border ${lesson.completed ? 'bg-primary border-primary' : 'bg-background'}`}>
                                                                {lesson.completed ? (
                                                                    <Check className="h-4 w-4 text-white" />
                                                                ) : (
                                                                    <BookOpen className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                                                )}
                                                            </div>
                                                            <span className="font-medium">{lesson.title}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                            <Clock className="h-4 w-4" />
                                                            <span>{lesson.duration} min</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="reviews" className="focus-visible:outline-none">
                            <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <Star className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{dict.course.no_reviews}</h3>
                                <p className="text-muted-foreground">{dict.course.be_first_review}</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div>
                    <Card className="sticky top-24 shadow-2xl ring-1 ring-primary/10 overflow-hidden">
                        <CardHeader className="pb-4">
                            <div className="mb-4 flex items-center justify-between">
                                <Badge variant="secondary" className="px-3 py-1 text-xs font-bold uppercase tracking-wider">{selectedCourse.level}</Badge>
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600 font-bold">
                                    <Star className="h-4 w-4 fill-yellow-500" />
                                    <span>{selectedCourse.rating}</span>
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold">{selectedCourse.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4 text-base">
                                <div className="flex justify-between items-center py-1 border-b border-dashed">
                                    <span className="text-muted-foreground">{dict.course.students}</span>
                                    <span className="font-semibold">{selectedCourse.studentsCount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-dashed">
                                    <span className="text-muted-foreground">{dict.course.lessons}</span>
                                    <span className="font-semibold">{selectedCourse.lessonsCount} {dict.courses.card.lessons}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-dashed">
                                    <span className="text-muted-foreground">{dict.course.duration}</span>
                                    <span className="font-semibold">{selectedCourse.duration} {dict.courses.card.hours}</span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-muted-foreground">{dict.course.language}</span>
                                    <span className="font-semibold">English</span>
                                </div>
                            </div>
                            <Separator />
                            <Button
                                className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20"
                                onClick={() => {
                                    if (selectedCourse.isEnrolled) {
                                        setCurrentPage('lesson');
                                    } else {
                                        setCurrentPage('format-selection');
                                    }
                                }}
                            >
                                {selectedCourse.isEnrolled ? dict.course.continue : dict.course.enroll}
                            </Button>
                            <p className="text-xs text-center text-muted-foreground px-4">{dict.course.guarantee}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
