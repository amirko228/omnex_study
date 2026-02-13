// ============================================================================
// BILLING SERVICE — Платежи, подписки, промокоды
// ============================================================================

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class BillingService {
    constructor(private prisma: PrismaService) { }

    // Оформить подписку
    async subscribe(userId: string, plan: string) {
        // Проверяем текущую подписку
        const existing = await this.prisma.subscription.findFirst({
            where: { userId, status: 'active' },
        });

        if (existing) {
            throw new BadRequestException('У вас уже есть активная подписка');
        }

        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1); // +1 месяц

        const subscription = await this.prisma.subscription.create({
            data: { userId, plan, expiresAt },
        });

        // Обновляем план пользователя
        await this.prisma.user.update({
            where: { id: userId },
            data: { subscriptionPlan: plan },
        });

        // Создаём запись о платеже
        const amount = plan === 'pro' ? 19.99 : plan === 'enterprise' ? 49.99 : 0;

        if (amount > 0) {
            await this.prisma.payment.create({
                data: {
                    userId,
                    subscriptionId: subscription.id,
                    amount,
                    currency: 'USD',
                    status: 'completed',
                    provider: 'internal',
                },
            });
        }

        return subscription;
    }

    // Купить курс
    async purchaseCourse(userId: string, courseId: string) {
        const course = await this.prisma.course.findUnique({ where: { id: courseId } });
        if (!course) throw new NotFoundException('Курс не найден');

        // Проверяем дубликат
        const existingPayment = await this.prisma.payment.findFirst({
            where: { userId, courseId, status: 'completed' },
        });

        if (existingPayment) {
            throw new BadRequestException('Курс уже куплен');
        }

        const payment = await this.prisma.payment.create({
            data: {
                userId,
                courseId,
                amount: course.price,
                currency: course.currency,
                status: 'completed',
                provider: 'internal',
            },
        });

        // Автоматически записываем на курс
        await this.prisma.enrollment.upsert({
            where: { userId_courseId: { userId, courseId } },
            update: {},
            create: { userId, courseId },
        });

        return payment;
    }

    // История платежей
    async getPaymentHistory(userId: string) {
        return this.prisma.payment.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                course: { select: { id: true, title: true } },
                subscription: { select: { id: true, plan: true } },
            },
        });
    }

    // Валидация промокода
    async validatePromoCode(code: string) {
        const promo = await this.prisma.promoCode.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!promo) throw new NotFoundException('Промокод не найден');

        if (promo.validUntil && promo.validUntil < new Date()) {
            throw new BadRequestException('Промокод истёк');
        }

        if (promo.maxUses && promo.currentUses >= promo.maxUses) {
            throw new BadRequestException('Промокод использован максимальное количество раз');
        }

        return {
            code: promo.code,
            discountPercent: promo.discountPercent,
            discountAmount: promo.discountAmount,
            valid: true,
        };
    }

    // ==========================================
    // Создать платёж
    // ==========================================
    async createPayment(userId: string, data: { amount: number; currency?: string; courseId?: string; provider?: string }) {
        const payment = await this.prisma.payment.create({
            data: {
                userId,
                amount: data.amount,
                currency: data.currency || 'USD',
                courseId: data.courseId || null,
                provider: data.provider || 'internal',
                status: 'pending',
            },
        });
        return payment;
    }

    // ==========================================
    // Подтвердить платёж
    // ==========================================
    async confirmPayment(paymentId: string, userId: string) {
        const payment = await this.prisma.payment.findFirst({
            where: { id: paymentId, userId },
        });
        if (!payment) throw new NotFoundException('Платёж не найден');
        if (payment.status !== 'pending') {
            throw new BadRequestException('Платёж не в статусе pending');
        }

        const updated = await this.prisma.payment.update({
            where: { id: paymentId },
            data: { status: 'completed' },
        });

        // Если покупка курса — автозапись
        if (payment.courseId) {
            await this.prisma.enrollment.upsert({
                where: { userId_courseId: { userId, courseId: payment.courseId } },
                update: {},
                create: { userId, courseId: payment.courseId },
            });
        }

        return updated;
    }

    // ==========================================
    // Получить платёж по ID
    // ==========================================
    async getPaymentById(paymentId: string, userId: string) {
        const payment = await this.prisma.payment.findFirst({
            where: { id: paymentId, userId },
            include: {
                course: { select: { id: true, title: true } },
                subscription: { select: { id: true, plan: true } },
            },
        });
        if (!payment) throw new NotFoundException('Платёж не найден');
        return payment;
    }

    // ==========================================
    // Возврат платежа
    // ==========================================
    async refundPayment(paymentId: string, userId: string, reason?: string) {
        const payment = await this.prisma.payment.findFirst({
            where: { id: paymentId, userId },
        });
        if (!payment) throw new NotFoundException('Платёж не найден');
        if (payment.status !== 'completed') {
            throw new BadRequestException('Можно вернуть только завершённый платёж');
        }

        const updated = await this.prisma.payment.update({
            where: { id: paymentId },
            data: { status: 'refunded' },
        });

        // Логируем в audit
        await this.prisma.auditLog.create({
            data: {
                userId,
                action: 'payment_refund',
                entityType: 'payment',
                entityId: paymentId,
                changes: { reason: reason || 'Запрос возврата пользователем' } as any,
            },
        });

        return updated;
    }

    // ==========================================
    // Методы оплаты (стабы)
    // ==========================================
    async getPaymentMethods(userId: string) {
        // Стаб: нет реального провайдера
        return [];
    }

    async updatePaymentMethod(userId: string, data: any) {
        // Стаб
        return { message: 'Метод оплаты обновлён', ...data };
    }

    async removePaymentMethod(userId: string, methodId: string) {
        // Стаб
        return { message: 'Метод оплаты удалён' };
    }

    // ==========================================
    // Транзакции (алиас для истории платежей)
    // ==========================================
    async getTransactions(userId: string, params?: { page?: number; limit?: number }) {
        const page = params?.page || 1;
        const limit = params?.limit || 20;
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            this.prisma.payment.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    course: { select: { id: true, title: true } },
                    subscription: { select: { id: true, plan: true } },
                },
            }),
            this.prisma.payment.count({ where: { userId } }),
        ]);

        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    // ==========================================
    // Инвойс 
    // ==========================================
    async getInvoice(transactionId: string, userId: string) {
        const payment = await this.prisma.payment.findFirst({
            where: { id: transactionId, userId },
            include: {
                user: { select: { id: true, email: true, name: true } },
                course: { select: { id: true, title: true } },
                subscription: { select: { id: true, plan: true } },
            },
        });
        if (!payment) throw new NotFoundException('Платёж не найден');

        return {
            invoiceNumber: `INV-${payment.id.substring(0, 8).toUpperCase()}`,
            date: payment.createdAt,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            customer: payment.user,
            item: payment.course
                ? { type: 'course', title: payment.course.title }
                : payment.subscription
                    ? { type: 'subscription', plan: payment.subscription.plan }
                    : { type: 'other' },
        };
    }

    // ==========================================
    // Применить промокод
    // ==========================================
    async applyPromoCode(code: string, userId: string) {
        const promo = await this.validatePromoCode(code);

        // Увеличиваем счётчик использований
        await this.prisma.promoCode.update({
            where: { code: code.toUpperCase() },
            data: { currentUses: { increment: 1 } },
        });

        return {
            ...promo,
            applied: true,
            message: 'Промокод успешно применён',
        };
    }
}

