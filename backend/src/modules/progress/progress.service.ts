// ============================================================================
// PROGRESS SERVICE — Прогресс пользователя
// ============================================================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ProgressService {
    constructor(private prisma: PrismaService) { }

    // Общий прогресс пользователя по всем курсам
    async getUserProgress(userId: string) {
        const enrollments = await this.prisma.enrollment.findMany({
            where: { userId },
            include: {
                course: {
                    include: {
                        modules: {
                            include: { lessons: { select: { id: true } } },
                        },
                    },
                },
            },
        });

        const progress = await Promise.all(
            enrollments.map(async (enrollment) => {
                const lessonIds = enrollment.course.modules.flatMap(m => m.lessons.map(l => l.id));
                const totalLessons = lessonIds.length;

                const completed = await this.prisma.userProgress.count({
                    where: { userId, lessonId: { in: lessonIds }, isCompleted: true },
                });

                const timeSpent = await this.prisma.userProgress.aggregate({
                    where: { userId, lessonId: { in: lessonIds } },
                    _sum: { timeSpentMinutes: true },
                });

                return {
                    courseId: enrollment.courseId,
                    courseTitle: enrollment.course.title,
                    totalLessons,
                    completedLessons: completed,
                    progress: totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0,
                    timeSpentMinutes: timeSpent._sum.timeSpentMinutes || 0,
                    enrolledAt: enrollment.enrolledAt,
                };
            }),
        );

        // Общая статистика
        const totalCourses = enrollments.length;
        const completedCourses = progress.filter(p => p.progress === 100).length;
        const totalTimeMinutes = progress.reduce((sum, p) => sum + p.timeSpentMinutes, 0);

        return {
            totalCourses,
            completedCourses,
            totalTimeMinutes,
            averageProgress: totalCourses > 0
                ? Math.round(progress.reduce((sum, p) => sum + p.progress, 0) / totalCourses)
                : 0,
            courses: progress,
        };
    }

    // Обновить время на уроке
    async updateTimeSpent(userId: string, lessonId: string, minutes: number) {
        await this.prisma.userProgress.upsert({
            where: { userId_lessonId: { userId, lessonId } },
            update: { timeSpentMinutes: { increment: minutes } },
            create: { userId, lessonId, timeSpentMinutes: minutes },
        });
    }
}
