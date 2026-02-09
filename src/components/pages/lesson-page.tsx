'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, BookOpen } from 'lucide-react';
import { LessonView } from '@/components/lesson/lesson-view';
import { LessonChat } from '@/components/lesson/lesson-chat';
import { DictionaryFallback } from '@/components/ui/dictionary-fallback';
import { mockChatMessages } from '@/lib/api/mock-data';
import { toast } from 'sonner';
import type { Dictionary } from '@/lib/i18n/dictionaries';

interface LessonPageProps {
    dict: Dictionary;
    selectedCourse: any;
    selectedFormat: string | null;
    setSelectedFormat: (format: any) => void;
    setCurrentPage: (page: any) => void;
}

export const LessonPage = ({ dict, selectedCourse, selectedFormat, setSelectedFormat, setCurrentPage }: LessonPageProps) => {
    // Null-safety проверка словаря
    if (!dict?.lesson) {
        return <DictionaryFallback />;
    }

    const lesson = selectedCourse.modules[0]?.lessons[0];

    if (!lesson) {
        return (
            <div className="container mx-auto px-4 py-10">
                <Button variant="ghost" className="mb-6 -ml-2" onClick={() => setCurrentPage('course-detail')}>
                    <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                    Назад к курсу
                </Button>
                <Card className="border-2 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-20">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-6">
                            <BookOpen className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Уроки не найдены</h3>
                        <p className="text-muted-foreground mb-6">Для этого курса пока нет доступных уроков</p>
                        <Button onClick={() => setCurrentPage('course-detail')}>
                            Вернуться к курсу
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="bg-muted/30 min-h-[calc(100vh-4rem)]">
            <div className="container mx-auto px-4 py-8">
                <Button variant="ghost" className="mb-6 -ml-2" onClick={() => setCurrentPage('course-detail')}>
                    <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                    {dict.lesson.exit_lesson}
                </Button>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <LessonView
                            lesson={lesson}
                            dict={dict}
                            onNext={() => toast.info('Следующий урок скоро появится!')}
                            onPrevious={() => { }}
                            hasPrevious={false}
                            hasNext={true}
                            currentFormat={selectedFormat || 'text'}
                            onFormatChange={(format) => {
                                setSelectedFormat(format);
                                toast.success(`Формат изменен на "${format}". ИИ адаптирует контент...`);
                            }}
                        />
                    </div>
                    <div className="hidden lg:block lg:h-[calc(100vh-14rem)] lg:sticky lg:top-24">
                        <LessonChat dict={dict} initialMessages={mockChatMessages} />
                    </div>
                </div>
            </div>
        </div>
    );
};
