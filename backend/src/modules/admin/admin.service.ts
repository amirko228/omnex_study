// ============================================================================
// ADMIN SERVICE — Администрирование платформы
// ============================================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    // Все пользователи
    async getUsers(params: {
        page?: number;
        limit?: number;
        search?: string;
        role?: string;
    }) {
        const { page = 1, limit = 20, search, role } = params;
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = { deletedAt: null };
        if (role) where.role = role;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where: where as any,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    avatar: true,
                    role: true,
                    subscriptionPlan: true,
                    emailVerified: true,
                    createdAt: true,
                    _count: { select: { enrollments: true } },
                },
            }),
            this.prisma.user.count({ where: where as any }),
        ]);

        return { data: users, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    // Заблокировать/разблокировать
    async toggleUserBan(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('Пользователь не найден');

        return this.prisma.user.update({
            where: { id: userId },
            data: { deletedAt: user.deletedAt ? null : new Date() },
        });
    }

    // Изменить роль
    async changeUserRole(userId: string, role: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { role },
        });
    }

    // Все курсы (включая неопубликованные)
    async getCourses(params: { page?: number; limit?: number; search?: string }) {
        const { page = 1, limit = 20, search } = params;
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {};
        if (search) {
            where.title = { contains: search, mode: 'insensitive' };
        }

        const [courses, total] = await Promise.all([
            this.prisma.course.findMany({
                where: where as any,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { enrollments: true, reviews: true, modules: true } },
                },
            }),
            this.prisma.course.count({ where: where as any }),
        ]);

        return { data: courses, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    // Удалить курс (soft-delete)
    async deleteCourse(courseId: string) {
        return this.prisma.course.update({
            where: { id: courseId },
            data: { deletedAt: new Date() },
        });
    }

    // Опубликовать/Снять с публикации
    async toggleCoursePublish(courseId: string) {
        const course = await this.prisma.course.findUnique({ where: { id: courseId } });
        if (!course) throw new NotFoundException('Курс не найден');

        return this.prisma.course.update({
            where: { id: courseId },
            data: { isPublished: !course.isPublished },
        });
    }

    // Аудит-логи
    async getAuditLogs(page = 1, limit = 50) {
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { id: true, name: true, email: true } } },
            }),
            this.prisma.auditLog.count(),
        ]);

        return { data: logs, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
}
