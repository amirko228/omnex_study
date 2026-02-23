'use client';

import { useAppContext } from '../providers';
import { AICourseCreatorChat } from '@/components/ai/ai-course-creator-chat';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';

export default function GenerateCoursePage() {
    const { dict, locale, subscription, isAuthenticated, isLoading } = useAppContext();
    const router = useRouter();

    // Hooks must be called before any conditional returns
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (!dict) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (isLoading || !isAuthenticated) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
            <div className="flex-1 overflow-hidden relative">
                {/* Back button */}
                <div className="absolute top-4 left-4 z-10">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/dashboard')}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        {locale === 'ru' ? 'Назад' : 'Back'}
                    </Button>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full w-full"
                >
                    <AICourseCreatorChat
                        locale={locale}
                        dict={dict}
                        subscription={subscription}
                        onCourseGenerated={(courseId) => {
                            console.log('Course generated:', courseId);
                        }}
                    />
                </motion.div>
            </div>
        </div>
    );
}
