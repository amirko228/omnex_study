// ============================================================================
// NOTIFICATIONS SERVICE
// Совместим с frontend src/lib/api/notifications.ts
// ============================================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class NotificationsService {
    constructor(
        private prisma: PrismaService,
        private redis: RedisService,
    ) { }

    // Все уведомления пользователя с пагинацией
    async findAll(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where: { userId } }),
        ]);

        return { data: notifications, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    // Количество непрочитанных
    async getUnreadCount(userId: string) {
        const count = await this.prisma.notification.count({
            where: { userId, isRead: false },
        });
        return { count };
    }

    // Отметить как прочитанное
    async markAsRead(notificationId: string, userId: string) {
        await this.prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true, readAt: new Date() },
        });
    }

    // Отметить все как прочитанные
    async markAllAsRead(userId: string) {
        await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
    }

    // Удалить уведомление
    async delete(notificationId: string, userId: string) {
        await this.prisma.notification.deleteMany({
            where: { id: notificationId, userId },
        });
    }

    // Удалить все
    async deleteAll(userId: string) {
        await this.prisma.notification.deleteMany({ where: { userId } });
    }

    // Создать уведомление (внутренний метод)
    async create(userId: string, data: {
        type: string;
        title: string;
        message: string;
        channel?: string;
        data?: Record<string, unknown>;
    }) {
        return this.prisma.notification.create({
            data: {
                userId,
                type: data.type,
                title: data.title,
                message: data.message,
                channel: data.channel || 'in-app',
                data: data.data as any,
            },
        });
    }

    // ==========================================
    // Получить настройки уведомлений
    // ==========================================
    async getPreferences(userId: string) {
        const cached = await this.redis.get(`notification:prefs:${userId}`);
        if (cached) {
            try { return JSON.parse(cached); } catch { /* ignore */ }
        }

        // Дефолтные настройки
        const defaults = {
            email: true,
            push: true,
            inApp: true,
            courseUpdates: true,
            promotions: false,
            reminders: true,
            weeklyDigest: true,
        };

        await this.redis.set(`notification:prefs:${userId}`, JSON.stringify(defaults), 86400 * 30);
        return defaults;
    }

    // ==========================================
    // Обновить настройки уведомлений
    // ==========================================
    async updatePreferences(userId: string, preferences: Record<string, boolean>) {
        const current = await this.getPreferences(userId);
        const updated = { ...current, ...preferences };
        await this.redis.set(`notification:prefs:${userId}`, JSON.stringify(updated), 86400 * 30);
        return updated;
    }

    // ==========================================
    // Подписка на push (стаб)
    // ==========================================
    async subscribePush(userId: string, subscription: any) {
        await this.redis.set(`push:sub:${userId}`, JSON.stringify(subscription), 86400 * 365);
        return { message: 'Подписка на push-уведомления успешна' };
    }

    // ==========================================
    // Отписка от push
    // ==========================================
    async unsubscribePush(userId: string) {
        await this.redis.del(`push:sub:${userId}`);
        return { message: 'Подписка на push-уведомления отменена' };
    }

    // ==========================================
    // Тестовое уведомление
    // ==========================================
    async sendTestNotification(userId: string) {
        return this.create(userId, {
            type: 'reminder',
            title: 'Тестовое уведомление',
            message: 'Это тестовое уведомление для проверки системы.',
            channel: 'in-app',
        });
    }
}

