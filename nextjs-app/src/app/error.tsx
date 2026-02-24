'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
            <div className="flex max-w-md flex-col items-center text-center space-y-4">
                <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
                    <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold">Что-то пошло не так!</h2>
                <p className="text-muted-foreground">
                    Мы столкнулись с непредвиденной ошибкой. Попробуйте обновить страницу.
                </p>
                <div className="flex gap-4">
                    <Button onClick={() => window.location.reload()} variant="outline">
                        Обновить страницу
                    </Button>
                    <Button onClick={() => reset()}>Попробовать снова</Button>
                </div>
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 max-w-full overflow-auto rounded bg-muted p-4 text-left text-xs font-mono">
                        {error.message}
                    </div>
                )}
            </div>
        </div>
    );
}
