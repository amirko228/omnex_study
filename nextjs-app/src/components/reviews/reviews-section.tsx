'use client';

import { useState, useEffect } from 'react';
import { StarRating } from '@/components/ui/star-rating';
import { AddReviewForm } from './add-review-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquarePlus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

type Review = {
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    helpfulCount: number;
    userLiked: boolean;
    user: {
        id: string;
        name: string;
        avatar?: string;
    };
};

type ReviewsStats = {
    averageRating: number;
    totalCount: number;
};

type ReviewsSectionProps = {
    courseId: string;
    currentUserId?: string | null;
    dict: any; // Dictionary type из i18n
};

export function ReviewsSection({ courseId, currentUserId, dict }: ReviewsSectionProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewsStats>({ averageRating: 0, totalCount: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    const loadReviews = async () => {
        try {
            setIsLoading(true);
            console.log('[ReviewsSection] Loading reviews for courseId:', courseId);
            console.log('[ReviewsSection] Current userId:', currentUserId);

            const response: any = await apiClient.get(`/courses/${courseId}/reviews`, {
                params: { page, limit },
            });

            console.log('[ReviewsSection] API response:', response);

            // Безопасная проверка наличия данных
            if (response?.data) {
                const reviewsData = response.data.data || [];
                console.log('[ReviewsSection] Reviews data:', reviewsData);
                console.log('[ReviewsSection] Total reviews:', response.data.total);

                setReviews(reviewsData);
                setTotalPages(response.data.totalPages || 1);
                setStats({
                    averageRating: reviewsData.length > 0
                        ? reviewsData.reduce((sum: number, r: Review) => sum + r.rating, 0) / reviewsData.length
                        : 0,
                    totalCount: response.data.total || 0,
                });
            } else {
                // Fallback на пустые данные если response пустой
                console.warn('[ReviewsSection] Empty response, setting empty reviews');
                setReviews([]);
                setStats({ averageRating: 0, totalCount: 0 });
            }
        } catch (error) {
            console.error('[ReviewsSection] Failed to load reviews:', error);
            // Устанавливаем пустой массив при ошибке
            setReviews([]);
            setStats({ averageRating: 0, totalCount: 0 });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadReviews();
    }, [courseId, page]);

    const handleDelete = async (reviewId: string) => {
        if (!confirm('Вы уверены что хотите удалить отзыв?')) return;

        try {
            await apiClient.delete(`/reviews/${reviewId}`);
            await loadReviews();
        } catch (error) {
            console.error('Failed to delete review:', error);
            alert('Не удалось удалить отзыв');
        }
    };

    // Проверяем, оставил ли текущий пользователь отзыв
    // (Ищем среди загруженных, но в идеале бэкенд должен возвращать этот флаг отдельно)
    const userReview = reviews.find((r) => String(r.user?.id) === String(currentUserId));

    console.log('[ReviewsSection] Condition check for Add Review button:');
    console.log('  - currentUserId:', currentUserId, typeof currentUserId);
    console.log('  - isLoading:', isLoading);
    console.log('  - userReview found:', !!userReview);
    console.log('  - reviews count:', reviews.length);
    if (userReview) {
        console.log('  - existing review ID:', userReview.id);
    }

    // Helper для pluralization отзывов
    const getReviewsCountText = (count: number) => {
        if (!dict?.reviews) return `${count} отзывов`;
        const lastDigit = count % 10;
        const lastTwoDigits = count % 100;
        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
            return `${count} ${dict.reviews.reviews_count_many}`;
        }
        if (lastDigit === 1) {
            return `${count} ${dict.reviews.reviews_count_one}`;
        }
        if (lastDigit >= 2 && lastDigit <= 4) {
            return `${count} ${dict.reviews.reviews_count_few}`;
        }
        return `${count} ${dict.reviews.reviews_count_many}`;
    };

    return (
        <div className="space-y-6">
            {/* Stats Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">{dict?.reviews?.title || 'Отзывы'}</h2>
                    <div className="flex items-center gap-3 mt-2">
                        <StarRating value={stats.averageRating} readonly size="lg" showValue />
                        <span className="text-sm text-muted-foreground">
                            ({getReviewsCountText(stats.totalCount)})
                        </span>
                    </div>
                </div>

                {/* Кнопка показывается ТОЛЬКО если currentUserId существует И отзыва нет И не идет загрузка */}
                {currentUserId && currentUserId !== '' && !isLoading && !userReview && (
                    <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
                        <MessageSquarePlus className="w-4 h-4" />
                        {dict?.reviews?.add_review || 'Добавить отзыв'}
                    </Button>
                )}
            </div>

            {/* Add Review Form */}
            {showAddForm && (
                <AddReviewForm
                    courseId={courseId}
                    dict={dict}
                    onSuccess={() => {
                        console.log('[ReviewsSection] Review submitted successfully, reloading reviews...');
                        setShowAddForm(false);
                        loadReviews();
                    }}
                    onCancel={() => setShowAddForm(false)}
                />
            )}

            {/* Reviews List */}
            {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">{dict?.reviews?.loading || 'Загрузка отзывов...'}</div>
            ) : reviews.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground">{dict?.reviews?.no_reviews || 'Пока нет отзывов на этот курс'}</p>
                    {currentUserId && (
                        <p className="text-sm text-muted-foreground mt-2">
                            {dict?.reviews?.be_first || 'Будьте первым кто оставит отзыв!'}
                        </p>
                    )}
                </Card>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review, index) => {
                        console.log(`[ReviewsSection] Rendering review ${index}:`, {
                            reviewId: review.id,
                            reviewUserId: review.user.id,
                            currentUserId: currentUserId,
                            isOwnReview: review.user.id === currentUserId
                        });

                        return (
                            <Card key={review.id} className="p-6">
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <Avatar className="w-12 h-12">
                                        <AvatarImage src={review.user.avatar} alt={review.user.name} />
                                        <AvatarFallback>{review.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 space-y-2">
                                        {/* Header */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold">{review.user.name}</p>
                                                    {review.user.id === currentUserId && (
                                                        <Badge variant="outline" className="text-xs">{dict?.reviews?.you_badge || 'Вы'}</Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(review.createdAt), 'd MMMM yyyy', { locale: ru })}
                                                </p>
                                            </div>
                                            <StarRating value={review.rating} readonly size="sm" />
                                        </div>

                                        {/* Comment */}
                                        {review.comment && (
                                            <p className="text-sm leading-relaxed">{review.comment}</p>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 pt-2">
                                            {review.user.id === currentUserId && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(review.id)}
                                                    className="gap-1.5 text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    {dict?.reviews?.delete || 'Удалить'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="gap-1"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        {dict?.reviews?.prev_page || 'Назад'}
                    </Button>
                    <span className="text-sm text-muted-foreground px-4">
                        {dict?.reviews?.page_of?.replace('{page}', String(page)).replace('{total}', String(totalPages)) || `Страница ${page} из ${totalPages}`}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        className="gap-1"
                    >
                        {dict?.reviews?.next_page || 'Вперёд'}
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
