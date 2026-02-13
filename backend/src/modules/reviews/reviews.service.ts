// ============================================================================
// REVIEWS SERVICE — Отзывы и рейтинги
// ============================================================================

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class ReviewsService {
    constructor(
        private prisma: PrismaService,
        private redis: RedisService,
    ) { }

    // Отзывы на курс
    async getCourseReviews(courseId: string, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            this.prisma.review.findMany({
                where: { courseId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, name: true, avatar: true } },
                },
            }),
            this.prisma.review.count({ where: { courseId } }),
        ]);

        return { data: reviews, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    // Оставить отзыв
    async createReview(userId: string, courseId: string, rating: number, comment?: string) {
        // Проверяем, записан ли пользователь на курс
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
        });

        if (!enrollment) {
            throw new NotFoundException('Вы не записаны на этот курс');
        }

        // Проверяем дубликат
        const existing = await this.prisma.review.findUnique({
            where: { userId_courseId: { userId, courseId } },
        });

        if (existing) throw new ConflictException('Вы уже оставили отзыв');

        const review = await this.prisma.review.create({
            data: { userId, courseId, rating, comment },
            include: { user: { select: { id: true, name: true, avatar: true } } },
        });

        // Пересчитываем средний рейтинг курса
        await this.recalculateRating(courseId);

        return review;
    }

    // Обновить отзыв
    async updateReview(reviewId: string, userId: string, rating?: number, comment?: string) {
        const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
        if (!review || review.userId !== userId) {
            throw new NotFoundException('Отзыв не найден');
        }

        const updated = await this.prisma.review.update({
            where: { id: reviewId },
            data: { ...(rating !== undefined && { rating }), ...(comment !== undefined && { comment }) },
        });

        await this.recalculateRating(review.courseId);
        return updated;
    }

    // Удалить отзыв
    async deleteReview(reviewId: string, userId: string) {
        const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
        if (!review || review.userId !== userId) {
            throw new NotFoundException('Отзыв не найден');
        }

        await this.prisma.review.delete({ where: { id: reviewId } });
        await this.recalculateRating(review.courseId);

        return { message: 'Отзыв удалён' };
    }

    // Пересчёт среднего рейтинга курса
    private async recalculateRating(courseId: string) {
        const result = await this.prisma.review.aggregate({
            where: { courseId },
            _avg: { rating: true },
            _count: { rating: true },
        });

        await this.prisma.course.update({
            where: { id: courseId },
            data: {
                rating: result._avg.rating || 0,
                reviewsCount: result._count.rating,
            },
        });

        await this.redis.del(`course:${courseId}`);
    }

    // ==========================================
    // Отметить отзыв как полезный
    // ==========================================
    async markHelpful(reviewId: string, userId: string) {
        const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
        if (!review) throw new NotFoundException('Отзыв не найден');

        // Проверяем, не отмечал ли уже
        const alreadyMarked = await this.redis.get(`review:helpful:${reviewId}:${userId}`);
        if (alreadyMarked) {
            return { message: 'Вы уже отметили этот отзыв как полезный', helpfulCount: parseInt(alreadyMarked) || 0 };
        }

        // Инкрементируем счётчик полезности в Redis
        const key = `review:helpful:count:${reviewId}`;
        const currentStr = await this.redis.get(key);
        const current = parseInt(currentStr || '0');
        const newCount = current + 1;
        await this.redis.set(key, String(newCount), 86400 * 365);
        await this.redis.set(`review:helpful:${reviewId}:${userId}`, String(newCount), 86400 * 365);

        return { message: 'Отзыв отмечен как полезный', helpfulCount: newCount };
    }

    // ==========================================
    // Пожаловаться на отзыв
    // ==========================================
    async reportReview(reviewId: string, userId: string, reason?: string) {
        const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
        if (!review) throw new NotFoundException('Отзыв не найден');

        // Логируем жалобу в audit
        await this.prisma.auditLog.create({
            data: {
                userId,
                action: 'review_report',
                entityType: 'review',
                entityId: reviewId,
                changes: { reason: reason || 'Жалоба на отзыв' } as any,
            },
        });

        return { message: 'Жалоба на отзыв отправлена' };
    }
}

