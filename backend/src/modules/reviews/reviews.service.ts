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
    async getCourseReviews(courseId: string, currentUserId?: string, page = 1, limit = 10) {
        console.log(`[ReviewsService] getCourseReviews: courseId=${courseId}, currentUserId=${currentUserId}, page=${page}, limit=${limit}`);

        const skip = (page - 1) * limit;

        try {
            console.log(`[ReviewsService] Executing findMany for courseId: ${courseId}`);

            const [reviews, total] = await Promise.all([
                this.prisma.review.findMany({
                    where: { courseId: courseId },
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: { select: { id: true, name: true, avatar: true } },
                        // Убираем проблемный include пока не обновим клиент
                        // likes: { select: { userId: true } }
                    },
                }),
                this.prisma.review.count({ where: { courseId: courseId } }),
            ]);

            console.log(`[ReviewsService] DB results: total=${total}, returned=${reviews.length}`);

            // Маппим данные
            const mappedReviews = (reviews as any[]).map(review => {
                return {
                    ...review
                };
            });

            return { data: mappedReviews, total, page, limit, totalPages: Math.ceil(total / limit) };
        } catch (error) {
            console.error('[ReviewsService] getCourseReviews error:', error);
            throw error;
        }
    }

    // Оставить отзыв
    async createReview(userId: string, courseId: string, rating: number, comment?: string) {
        // Для MVP: автоматически записываем пользователя на курс, если он еще не записан
        // Это позволяет оставлять отзывы без предварительной ручной записи.
        await this.prisma.enrollment.upsert({
            where: { userId_courseId: { userId, courseId } },
            create: { userId, courseId },
            update: {}
        });

        // Проверяем дубликат
        console.log(`[ReviewsService] Checking for existing review: userId=${userId}, courseId=${courseId}`);
        const existing = await this.prisma.review.findFirst({
            where: {
                userId: userId,
                courseId: courseId
            },
        });

        if (existing) {
            console.warn('[ReviewsService] Duplicate review attempt block:', existing.id);
            throw new ConflictException('Вы уже оставили отзыв');
        }

        console.log('[ReviewsService] Creating new review in DB...');
        const review = await this.prisma.review.create({
            data: {
                userId: userId,
                courseId: courseId,
                rating: rating,
                comment: comment
            },
            include: { user: { select: { id: true, name: true, avatar: true } } },
        });

        console.log('[ReviewsService] Review created:', review);

        // Пересчитываем средний рейтинг курса
        await this.recalculateRating(courseId);

        console.log('[ReviewsService] Returning created review');
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

    async reportReview(reviewId: string, userId: string, reason?: string) {
        // Метод удален по запросу
        return { message: 'Функционал жалоб отключен' };
    }
}

