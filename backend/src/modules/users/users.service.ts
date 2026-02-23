// ============================================================================
// USERS SERVICE — Управление профилями пользователей
// ============================================================================

import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private redis: RedisService,
    ) { }

    // Получить профиль по ID
    async findById(id: string) {
        // Пробуем получить из кеша
        const cached = await this.redis.getJSON(`user:profile:${id}`);
        if (cached) return cached;

        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                role: true,
                locale: true,
                subscriptionPlan: true,
                emailVerified: true,
                bio: true,
                phone: true,
                country: true,
                timezone: true,
                createdAt: true,
                _count: {
                    select: {
                        enrollments: true,
                        reviews: true,
                    },
                },
            },
        });

        if (!user) throw new NotFoundException('Пользователь не найден');

        // Кешируем на 30 минут
        await this.redis.setJSON(`user:profile:${id}`, user, 1800);
        return user;
    }

    // Обновить профиль
    async updateProfile(userId: string, data: {
        name?: string;
        bio?: string;
        phone?: string;
        country?: string;
        timezone?: string;
        locale?: string;
        avatar?: string;
    }) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                role: true,
                locale: true,
                subscriptionPlan: true,
                bio: true,
                phone: true,
                country: true,
                timezone: true,
            },
        });

        // Обновляем кеш
        await this.redis.del(`user:profile:${userId}`);
        return user;
    }

    // Обновить настройки
    async updateSettings(userId: string, settings: Record<string, unknown>) {
        // Обновляем только допустимые поля
        const allowedFields = ['locale', 'timezone'];
        const data: Record<string, unknown> = {};

        for (const key of allowedFields) {
            if (key in settings) {
                data[key] = settings[key];
            }
        }

        return this.prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                locale: true,
                timezone: true,
            },
        });
    }

    // Удалить аккаунт (soft delete)
    async deleteAccount(userId: string, password?: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, passwordHash: true }
        });

        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }

        // Если у пользователя есть пароль, требуем его для удаления
        if (user.passwordHash) {
            if (!password) {
                throw new BadRequestException('Пароль обязателен для удаления аккаунта');
            }
            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                throw new UnauthorizedException('Неверный пароль');
            }
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                deletedAt: new Date()
            },
        });

        // Удаляем все сессии (refresh tokens) пользователя
        await this.prisma.refreshToken.deleteMany({
            where: { userId },
        });

        // Удаляем привязки соцсетей, чтобы их можно было привязать к новому аккаунту
        await this.prisma.oAuthAccount.deleteMany({
            where: { userId }
        });

        await this.redis.del(`user:profile:${userId}`);
        return { message: 'Аккаунт удалён' };
    }

    // ==========================================
    // Загрузить аватар
    // ==========================================
    async uploadAvatar(userId: string, avatarUrl: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { avatar: avatarUrl },
        });
        await this.redis.del(`user:profile:${userId}`);
        return { avatarUrl };
    }

    // ==========================================
    // Удалить аватар
    // ==========================================
    async deleteAvatar(userId: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { avatar: null },
        });
        await this.redis.del(`user:profile:${userId}`);
        return { message: 'Аватар удалён' };
    }

    // ==========================================
    // Статистика пользователя
    // ==========================================
    async getStatistics(userId: string) {
        const [completedLessons, enrollmentsCount, quizAttempts] = await Promise.all([
            this.prisma.userProgress.count({
                where: { userId, isCompleted: true },
            }),
            this.prisma.enrollment.count({
                where: { userId },
            }),
            this.prisma.quizAttempt.findMany({
                where: { userId },
                select: { score: true },
            }),
        ]);

        const coursesCompleted = enrollmentsCount;
        const totalScore = quizAttempts.reduce((sum, q) => sum + q.score, 0);
        const averageScore = quizAttempts.length > 0 ? Math.round(totalScore / quizAttempts.length) : 0;

        // Подсчёт streak через прогресс по дням
        const recentProgress = await this.prisma.userProgress.findMany({
            where: { userId, isCompleted: true },
            orderBy: { completedAt: 'desc' },
            select: { completedAt: true },
            take: 60,
        });

        let streak = 0;
        if (recentProgress.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let checkDate = new Date(today);

            for (const p of recentProgress) {
                if (!p.completedAt) continue;
                const progressDate = new Date(p.completedAt);
                progressDate.setHours(0, 0, 0, 0);
                if (progressDate.getTime() === checkDate.getTime()) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else if (progressDate.getTime() < checkDate.getTime()) {
                    break;
                }
            }
        }

        return {
            coursesCompleted,
            lessonsCompleted: completedLessons,
            totalTimeSpent: completedLessons * 15 * 60, // ~15 мин на урок (в секундах)
            averageScore,
            streak,
            achievements: await this.getAchievements(userId),
        };
    }

    // ==========================================
    // Достижения пользователя
    // ==========================================
    async getAchievements(userId: string) {
        const [lessonsCount, coursesCount, reviewsCount] = await Promise.all([
            this.prisma.userProgress.count({ where: { userId, isCompleted: true } }),
            this.prisma.enrollment.count({ where: { userId } }),
            this.prisma.review.count({ where: { userId } }),
        ]);

        const achievements = [];

        // Достижения по урокам
        if (lessonsCount >= 1) achievements.push({ id: 'first_lesson', title: 'Первый урок', description: 'Завершите первый урок', icon: '📖', unlockedAt: new Date().toISOString() });
        if (lessonsCount >= 10) achievements.push({ id: 'ten_lessons', title: 'Ученик', description: 'Завершите 10 уроков', icon: '📚', unlockedAt: new Date().toISOString() });
        if (lessonsCount >= 50) achievements.push({ id: 'fifty_lessons', title: 'Эрудит', description: 'Завершите 50 уроков', icon: '🎓', unlockedAt: new Date().toISOString() });
        if (lessonsCount >= 100) achievements.push({ id: 'hundred_lessons', title: 'Мастер', description: 'Завершите 100 уроков', icon: '🏆', unlockedAt: new Date().toISOString() });

        // Достижения по курсам
        if (coursesCount >= 1) achievements.push({ id: 'first_course', title: 'Первый курс', description: 'Завершите первый курс', icon: '🎯', unlockedAt: new Date().toISOString() });
        if (coursesCount >= 5) achievements.push({ id: 'five_courses', title: 'Выпускник', description: 'Завершите 5 курсов', icon: '🎉', unlockedAt: new Date().toISOString() });

        // Достижения по отзывам
        if (reviewsCount >= 1) achievements.push({ id: 'first_review', title: 'Критик', description: 'Оставьте первый отзыв', icon: '✍️', unlockedAt: new Date().toISOString() });
        if (reviewsCount >= 10) achievements.push({ id: 'ten_reviews', title: 'Эксперт', description: 'Оставьте 10 отзывов', icon: '⭐', unlockedAt: new Date().toISOString() });

        return achievements;
    }

    // ==========================================
    // Позиция в лидерборде
    // ==========================================
    async getLeaderboardPosition(userId: string) {
        // Считаем завершённые уроки для каждого пользователя
        const allUsers = await this.prisma.userProgress.groupBy({
            by: ['userId'],
            where: { isCompleted: true },
            _count: { id: true },
        });

        // Сортируем по количеству завершённых
        allUsers.sort((a, b) => b._count.id - a._count.id);

        const userIndex = allUsers.findIndex(u => u.userId === userId);
        const userPoints = userIndex >= 0 ? allUsers[userIndex]._count.id * 10 : 0;

        return {
            position: userIndex >= 0 ? userIndex + 1 : allUsers.length + 1,
            totalUsers: allUsers.length || 1,
            points: userPoints,
        };
    }

    // ==========================================
    // Экспорт данных пользователя
    // ==========================================
    async exportData(userId: string) {
        const [user, enrollments, progress, reviews, payments] = await Promise.all([
            this.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true, email: true, name: true, avatar: true, role: true,
                    locale: true, bio: true, phone: true, country: true, timezone: true,
                    createdAt: true,
                },
            }),
            this.prisma.enrollment.findMany({
                where: { userId },
                include: { course: { select: { id: true, title: true } } },
            }),
            this.prisma.userProgress.findMany({
                where: { userId },
                include: { lesson: { select: { id: true, title: true } } },
            }),
            this.prisma.review.findMany({ where: { userId } }),
            this.prisma.payment.findMany({ where: { userId } }),
        ]);

        return { user, enrollments, progress, reviews, payments, exportedAt: new Date().toISOString() };
    }
}
