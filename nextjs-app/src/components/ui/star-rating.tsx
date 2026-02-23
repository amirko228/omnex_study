import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type StarRatingProps = {
    value: number; // 0-5
    onChange?: (value: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean; // показывать цифровое значение
};

export function StarRating({ value, onChange, readonly = false, size = 'md', showValue = false }: StarRatingProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    const handleClick = (rating: number) => {
        if (!readonly && onChange) {
            onChange(rating);
        }
    };

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= value;
                const isHalf = star === Math.ceil(value) && value % 1 !== 0;

                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleClick(star)}
                        disabled={readonly}
                        className={cn(
                            'transition-all duration-150',
                            !readonly && 'hover:scale-110 cursor-pointer',
                            readonly && 'cursor-default'
                        )}
                        aria-label={`Rate ${star} stars`}
                    >
                        <Star
                            className={cn(
                                sizeClasses[size],
                                'transition-colors',
                                isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600',
                                !readonly && 'hover:text-yellow-300'
                            )}
                        />
                    </button>
                );
            })}
            {showValue && (
                <span className="ml-2 text-sm font-medium text-muted-foreground">
                    {value.toFixed(1)}
                </span>
            )}
        </div>
    );
}
