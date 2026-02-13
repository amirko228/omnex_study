// ============================================================================
// ANALYTICS SERVICE — Сбор и отчёты аналитики
// ============================================================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class AnalyticsService {
    constructor(
        private prisma: PrismaService,
        private redis: RedisService,
    ) { }

    // Трекинг событий
    async trackEvent(userId: string | null, event: {
        eventType: string;
        entityType?: string;
        entityId?: string;
        data?: Record<string, unknown>;
        sessionId?: string;
        ip?: string;
        userAgent?: string;
    }) {
        return this.prisma.analyticsEvent.create({
            data: {
                userId,
                eventType: event.eventType,
                eventData: {
                    ...(event.data || {}),
                    entityType: event.entityType,
                    entityId: event.entityId,
                    sessionId: event.sessionId,
                } as any,
                ipAddress: event.ip,
                userAgent: event.userAgent,
            },
        });
    }

    // Dashboard — общая статистика (админ)
    async getDashboardStats() {
        const cached = await this.redis.getJSON('analytics:dashboard');
        if (cached) return cached;

        const [
            totalUsers,
            totalCourses,
            totalEnrollments,
            totalRevenue,
            recentUsers,
            recentEnrollments,
        ] = await Promise.all([
            this.prisma.user.count({ where: { deletedAt: null } }),
            this.prisma.course.count({ where: { isPublished: true, deletedAt: null } }),
            this.prisma.enrollment.count(),
            this.prisma.payment.aggregate({
                where: { status: 'completed' },
                _sum: { amount: true },
            }),
            this.prisma.user.count({
                where: {
                    createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                },
            }),
            this.prisma.enrollment.count({
                where: {
                    enrolledAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                },
            }),
        ]);

        const stats = {
            totalUsers,
            totalCourses,
            totalEnrollments,
            totalRevenue: totalRevenue._sum.amount || 0,
            recentUsersWeek: recentUsers,
            recentEnrollmentsWeek: recentEnrollments,
        };

        await this.redis.setJSON('analytics:dashboard', stats, 300);
        return stats;
    }

    // Аудит-лог
    async createAuditLog(data: {
        userId: string;
        action: string;
        entityType: string;
        entityId: string;
        changes?: Record<string, unknown>;
        ipAddress?: string;
    }) {
        return this.prisma.auditLog.create({
            data: {
                userId: data.userId,
                action: data.action,
                entityType: data.entityType,
                entityId: data.entityId,
                changes: data.changes as any,
                ipAddress: data.ipAddress,
            },
        });
    }
}
