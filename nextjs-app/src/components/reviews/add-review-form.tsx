'use client';

import { useState } from 'react';
import { StarRating } from '@/components/ui/star-rating';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Send, X } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import type { Dictionary } from '@/lib/i18n/dictionaries';

type AddReviewFormProps = {
    courseId: string;
    dict: Dictionary;
    onSuccess?: () => void;
    onCancel?: () => void;
    existingReview?: {
        rating: number;
        comment?: string;
    };
};

export function AddReviewForm({ courseId, dict, onSuccess, onCancel, existingReview }: AddReviewFormProps) {
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [comment, setComment] = useState(existingReview?.comment || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            setError(dict?.reviews?.error_select_rating || 'Пожалуйста, выберите рейтинг');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await apiClient.post<{ id: string }>(`/courses/${courseId}/reviews`, {
                rating,
                comment: comment.trim() || undefined,
            });

            if (!response.success || (response as unknown as { message?: string }).message?.includes('Invalid course ID')) {
                const errorData = response as unknown as { message?: string; error?: string };
                let message = response.error?.message || errorData.message || dict?.reviews?.error_submit || 'Не удалось отправить отзыв';

                // Special handling for 401 if refresh failed
                if (response.error?.code === '401' || errorData.error === 'Unauthorized') {
                    message = dict?.reviews?.error_unauthorized || 'Сессия истекла. Пожалуйста, войдите снова.';
                }

                setError(message);
                return;
            }

            // Успешно создано
            if (onSuccess) onSuccess();
        } catch {
            setError(dict?.reviews?.error_submit || 'Не удалось отправить отзыв');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold mb-2">{dict?.reviews?.your_review || 'Ваш отзыв'}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                        {dict?.reviews?.rate_course || 'Оцените курс от 1 до 5 звёзд'}
                    </p>
                    <div className="flex items-center gap-2">
                        <StarRating value={rating} onChange={setRating} size="lg" />
                        {rating > 0 && (
                            <span className="text-sm font-medium text-muted-foreground">
                                {rating} {dict?.reviews?.out_of_five || 'из 5'}
                            </span>
                        )}
                    </div>
                    {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                </div>

                <div>
                    <label htmlFor="comment" className="block text-sm font-medium mb-2">
                        {dict?.reviews?.comment_optional || 'Комментарий (необязательно)'}
                    </label>
                    <Textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={dict?.reviews?.comment_placeholder || 'Расскажите о своём опыте прохождения курса...'}
                        rows={4}
                        className="resize-none"
                        maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        {comment.length}/1000
                    </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <Button
                        type="submit"
                        disabled={isSubmitting || rating === 0}
                        className="flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>{dict?.reviews?.submitting || 'Отправка...'}</>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                {existingReview ? (dict?.reviews?.update_review || 'Обновить отзыв') : (dict?.reviews?.publish_review || 'Опубликовать отзыв')}
                            </>
                        )}
                    </Button>
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            <X className="w-4 h-4 mr-2" />
                            {dict?.reviews?.cancel || 'Отмена'}
                        </Button>
                    )}
                </div>
            </form>
        </Card>
    );
}
