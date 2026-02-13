// ============================================================================
// COURSES SERVICE — Вся логика работы с курсами
// Каталог, поиск, запись, прогресс
// ============================================================================

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class CoursesService {
    constructor(
        private prisma: PrismaService,
        private redis: RedisService,
    ) { }

    // ==========================================
    // ВСЕ КУРСЫ (с фильтрами и пагинацией)
    // ==========================================
    async findAll(params: {
        page?: number;
        limit?: number;
        category?: string;
        level?: string;
        search?: string;
        sort?: string;
    }) {
        const { page = 1, limit = 12, category, level, search, sort } = params;
        const skip = (page - 1) * limit;

        // Строим условия фильтрации
        const where: Record<string, unknown> = {
            isPublished: true,
            deletedAt: null,
        };

        if (category) where.category = category;
        if (level) where.level = level;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Сортировка
        let orderBy: Record<string, string> = { createdAt: 'desc' };
        if (sort === 'popular') orderBy = { enrolledCount: 'desc' };
        if (sort === 'rating') orderBy = { rating: 'desc' };
        if (sort === 'price_asc') orderBy = { price: 'asc' };
        if (sort === 'price_desc') orderBy = { price: 'desc' };

        const [courses, total] = await Promise.all([
            this.prisma.course.findMany({
                where: where as any,
                skip,
                take: limit,
                orderBy: orderBy as any,
                include: {
                    _count: { select: { modules: true, enrollments: true, reviews: true } },
                },
            }),
            this.prisma.course.count({ where: where as any }),
        ]);

        return {
            data: courses,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    // ==========================================
    // ОДИН КУРС ПО ID
    // ==========================================
    async findById(id: string) {
        // Пробуем кеш
        const cached = await this.redis.getJSON(`course:${id}`);
        if (cached) return cached;

        const course = await this.prisma.course.findUnique({
            where: { id },
            include: {
                modules: {
                    orderBy: { orderIndex: 'asc' },
                    include: {
                        lessons: {
                            orderBy: { orderIndex: 'asc' },
                            select: {
                                id: true,
                                title: true,
                                type: true,
                                format: true,
                                durationMinutes: true,
                                orderIndex: true,
                            },
                        },
                    },
                },
                _count: { select: { enrollments: true, reviews: true } },
            },
        });

        if (!course) throw new NotFoundException('Курс не найден');

        // Кешируем на 10 минут
        await this.redis.setJSON(`course:${id}`, course, 600);
        return course;
    }

    // ==========================================
    // МОДУЛИ КУРСА
    // ==========================================
    async getCourseModules(courseId: string) {
        const modules = await this.prisma.courseModule.findMany({
            where: { courseId },
            orderBy: { orderIndex: 'asc' },
            include: {
                lessons: {
                    orderBy: { orderIndex: 'asc' },
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        format: true,
                        durationMinutes: true,
                        orderIndex: true,
                    },
                },
            },
        });

        return modules;
    }

    // ==========================================
    // МОИ КУРСЫ (записанные)
    // ==========================================
    async getEnrolledCourses(userId: string) {
        const enrollments = await this.prisma.enrollment.findMany({
            where: { userId },
            include: {
                course: {
                    include: {
                        modules: {
                            include: {
                                lessons: { select: { id: true } },
                            },
                        },
                        _count: { select: { enrollments: true } },
                    },
                },
            },
            orderBy: { enrolledAt: 'desc' },
        });

        // Вычисляем прогресс для каждого курса
        const coursesWithProgress = await Promise.all(
            enrollments.map(async (enrollment) => {
                const totalLessons = enrollment.course.modules.reduce(
                    (sum, mod) => sum + mod.lessons.length, 0,
                );

                const completedLessons = await this.prisma.userProgress.count({
                    where: {
                        userId,
                        isCompleted: true,
                        lesson: {
                            module: { courseId: enrollment.courseId },
                        },
                    },
                });

                return {
                    ...enrollment.course,
                    progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
                    completedLessons,
                    totalLessons,
                };
            }),
        );

        return coursesWithProgress;
    }

    // ==========================================
    // ЗАПИСАТЬСЯ НА КУРС
    // ==========================================
    async enrollCourse(userId: string, courseId: string) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course) throw new NotFoundException('Курс не найден');

        // Проверяем, не записан ли уже
        const existing = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
        });

        if (existing) {
            return { message: 'Вы уже записаны на этот курс', alreadyEnrolled: true };
        }

        // Создаём запись
        await this.prisma.enrollment.create({
            data: { userId, courseId },
        });

        // Увеличиваем счётчик
        await this.prisma.course.update({
            where: { id: courseId },
            data: { enrolledCount: { increment: 1 } },
        });

        // Сбрасываем кеш
        await this.redis.del(`course:${courseId}`);

        return { message: 'Вы успешно записались на курс' };
    }

    // ==========================================
    // ПРОГРЕСС ПО КУРСУ
    // ==========================================
    async getCourseProgress(userId: string, courseId: string) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            include: {
                modules: {
                    include: {
                        lessons: { select: { id: true } },
                    },
                },
            },
        });

        if (!course) throw new NotFoundException('Курс не найден');

        const allLessonIds = course.modules.flatMap(m => m.lessons.map(l => l.id));
        const totalLessons = allLessonIds.length;

        const completedProgress = await this.prisma.userProgress.findMany({
            where: {
                userId,
                lessonId: { in: allLessonIds },
                isCompleted: true,
            },
        });

        const completedLessons = completedProgress.length;

        return {
            courseId,
            totalLessons,
            completedLessons,
            progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
            completedLessonIds: completedProgress.map(p => p.lessonId),
        };
    }

    // ==========================================
    // ПОПУЛЯРНЫЕ КУРСЫ
    // ==========================================
    async getPopularCourses(limit = 6) {
        const cached = await this.redis.getJSON('courses:popular');
        if (cached) return cached;

        const courses = await this.prisma.course.findMany({
            where: { isPublished: true, deletedAt: null },
            orderBy: { enrolledCount: 'desc' },
            take: limit,
        });

        await this.redis.setJSON('courses:popular', courses, 3600);
        return courses;
    }

    // ==========================================
    // РЕКОМЕНДОВАННЫЕ КУРСЫ
    // ==========================================
    async getFeaturedCourses() {
        const cached = await this.redis.getJSON('courses:featured');
        if (cached) return cached;

        const courses = await this.prisma.course.findMany({
            where: { isFeatured: true, isPublished: true, deletedAt: null },
            take: 8,
        });

        await this.redis.setJSON('courses:featured', courses, 3600);
        return courses;
    }

    // ==========================================
    // РЕКОМЕНДАЦИИ
    // ==========================================
    async getRecommendedCourses(userId: string) {
        // Умные рекомендации на основе пройденных категорий
        const enrollments = await this.prisma.enrollment.findMany({
            where: { userId },
            include: { course: { select: { category: true } } },
        });

        const categories = [...new Set(enrollments.map(e => e.course.category).filter(Boolean))];

        if (categories.length === 0) {
            return this.getPopularCourses(6);
        }

        const enrolledIds = enrollments.map(e => e.courseId);

        return this.prisma.course.findMany({
            where: {
                isPublished: true,
                deletedAt: null,
                category: { in: categories as string[] },
                id: { notIn: enrolledIds },
            },
            take: 6,
            orderBy: { rating: 'desc' },
        });
    }

    // ==========================================
    // ПОИСК КУРСОВ
    // ==========================================
    async searchCourses(query: string) {
        return this.prisma.course.findMany({
            where: {
                isPublished: true,
                deletedAt: null,
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { tags: { has: query } },
                ],
            },
            take: 20,
            orderBy: { rating: 'desc' },
        });
    }

    // ==========================================
    // СОЗДАТЬ КУРС (для админа/инструктора)
    // ==========================================
    async createCourse(authorId: string, data: {
        title: string;
        description?: string;
        category?: string;
        level?: string;
        language?: string;
        price?: number;
        tags?: string[];
        formats?: string[];
    }) {
        const slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9а-яё\s]/gi, '')
            .replace(/\s+/g, '-')
            .substring(0, 200);

        return this.prisma.course.create({
            data: {
                ...data,
                slug: `${slug}-${Date.now()}`,
                authorId,
                price: data.price || 0,
            },
        });
    }

    // ==========================================
    // ОБНОВИТЬ КУРС
    // ==========================================
    async updateCourse(courseId: string, userId: string, data: Record<string, unknown>) {
        const course = await this.prisma.course.findUnique({ where: { id: courseId } });
        if (!course) throw new NotFoundException('Курс не найден');

        if (course.authorId !== userId) {
            // Проверяем, является ли пользователь админом
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (user?.role !== 'admin') {
                throw new ForbiddenException('Нет прав на редактирование');
            }
        }

        const updated = await this.prisma.course.update({
            where: { id: courseId },
            data: data as any,
        });

        await this.redis.del(`course:${courseId}`);
        return updated;
    }
}
