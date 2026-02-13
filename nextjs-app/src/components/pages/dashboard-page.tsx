'use client';

import { useState, useEffect } from 'react';
import { CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Award, TrendingUp, Search, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { PageTransition, FadeIn, StaggerContainer, StaggerItem, SlideIn } from '@/components/ui/page-transition';
import { AnimatedCard } from '@/components/ui/animated-elements';
import { DictionaryFallback } from '@/components/ui/dictionary-fallback';
import { apiClient } from '@/lib/api-client';
import type { Dictionary } from '@/lib/i18n/dictionaries';

import type { User } from '@/types';

interface DashboardPageProps {
    dict: Dictionary;
    user: User | null;
    setCurrentPage: (page: string) => void;
}

interface UserStats {
    coursesCompleted: number;
    lessonsCompleted: number;
    totalTimeSpent: number;
    averageScore: number;
    streak: number;
}

export const DashboardPage = ({ dict, user, setCurrentPage }: DashboardPageProps) => {
    const [stats, setStats] = useState<UserStats>({
        coursesCompleted: 0,
        lessonsCompleted: 0,
        totalTimeSpent: 0,
        averageScore: 0,
        streak: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const result = await apiClient.get<UserStats>('/users/me/statistics');
                if (result.success && result.data) {
                    setStats(result.data);
                }
            } catch (err) {
                // Если API недоступен — оставляем нули
            }
        };

        if (user) fetchStats();
    }, [user]);

    // Null-safety проверка словаря
    if (!dict?.dashboard) {
        return <DictionaryFallback />;
    }

    const hoursLearned = Math.round(stats.totalTimeSpent / 60);

    return (
        <PageTransition>
            <div className="container mx-auto px-4 py-10">
                <FadeIn>
                    <div className="mb-10">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            {dict.dashboard.welcome}, {user?.name}!
                        </h1>
                        <p className="text-muted-foreground text-lg">Track your learning progress and continue your courses.</p>
                    </div>
                </FadeIn>

                <StaggerContainer>
                    <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-4">
                        <StaggerItem>
                            <AnimatedCard hoverable className="border-none shadow-md bg-gradient-to-br from-primary/10 to-primary/5">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">{dict.dashboard.stats.courses_enrolled}</CardTitle>
                                    <motion.div whileHover={{ rotate: 15, scale: 1.1 }}>
                                        <BookOpen className="h-5 w-5 text-primary" />
                                    </motion.div>
                                </CardHeader>
                                <CardContent>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", delay: 0.2 }}
                                        className="text-4xl font-bold"
                                    >
                                        {stats.coursesCompleted}
                                    </motion.div>
                                </CardContent>
                            </AnimatedCard>
                        </StaggerItem>

                        <StaggerItem>
                            <AnimatedCard hoverable className="border-none shadow-md bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">{dict.dashboard.stats.hours_learned}</CardTitle>
                                    <motion.div whileHover={{ rotate: 15, scale: 1.1 }}>
                                        <Clock className="h-5 w-5 text-blue-500" />
                                    </motion.div>
                                </CardHeader>
                                <CardContent>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", delay: 0.3 }}
                                        className="text-4xl font-bold"
                                    >
                                        {hoursLearned}
                                    </motion.div>
                                </CardContent>
                            </AnimatedCard>
                        </StaggerItem>

                        <StaggerItem>
                            <AnimatedCard hoverable className="border-none shadow-md bg-gradient-to-br from-green-500/10 to-green-500/5">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">{dict.dashboard.stats.certificates}</CardTitle>
                                    <motion.div whileHover={{ rotate: 15, scale: 1.1 }}>
                                        <Award className="h-5 w-5 text-green-500" />
                                    </motion.div>
                                </CardHeader>
                                <CardContent>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", delay: 0.4 }}
                                        className="text-4xl font-bold"
                                    >
                                        {stats.lessonsCompleted}
                                    </motion.div>
                                </CardContent>
                            </AnimatedCard>
                        </StaggerItem>

                        <StaggerItem>
                            <AnimatedCard hoverable className="border-none shadow-md bg-gradient-to-br from-orange-500/10 to-orange-500/5">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">{dict.dashboard.stats.streak}</CardTitle>
                                    <motion.div whileHover={{ rotate: 15, scale: 1.1 }}>
                                        <TrendingUp className="h-5 w-5 text-orange-500" />
                                    </motion.div>
                                </CardHeader>
                                <CardContent>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", delay: 0.5 }}
                                        className="text-4xl font-bold"
                                    >
                                        {stats.streak}
                                    </motion.div>
                                </CardContent>
                            </AnimatedCard>
                        </StaggerItem>
                    </div>
                </StaggerContainer>

                <SlideIn direction="up" delay={0.2}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Карточка AI-генерации */}
                        <AnimatedCard hoverable onClick={() => setCurrentPage('generate-course')} className="cursor-pointer border-2 border-purple-500/20 hover:border-purple-500/40">
                            <CardHeader>
                                <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg">
                                    <Sparkles className="h-6 w-6 text-white" />
                                </motion.div>
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    {dict.dashboard.create_ai_course || 'Создать курс с ИИ'}
                                    <span className="text-xs bg-purple-500/10 text-purple-500 px-2 py-1 rounded-full font-normal">AI</span>
                                </CardTitle>
                                <CardDescription className="text-base">
                                    {dict.dashboard.create_ai_course_desc || 'Опишите тему и ИИ создаст персонализированный курс для вас'}
                                </CardDescription>
                            </CardHeader>
                        </AnimatedCard>

                        {/* Каталог курсов */}
                        <AnimatedCard hoverable onClick={() => setCurrentPage('catalog')} className="cursor-pointer border-2">
                            <CardHeader>
                                <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-500/50 flex items-center justify-center mb-4 shadow-lg">
                                    <Search className="h-6 w-6 text-white" />
                                </motion.div>
                                <CardTitle className="text-2xl">{dict.dashboard.browse_catalog}</CardTitle>
                                <CardDescription className="text-base">{dict.dashboard.browse_catalog_desc}</CardDescription>
                            </CardHeader>
                        </AnimatedCard>
                    </div>
                </SlideIn>
            </div>
        </PageTransition>
    );
};

