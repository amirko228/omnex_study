'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="max-w-md w-full">
                <CardContent className="flex flex-col items-center text-center py-12">
                    <div className="text-9xl font-bold text-primary mb-4">404</div>
                    <h1 className="text-2xl font-bold mb-2">Страница не найдена</h1>
                    <p className="text-muted-foreground mb-8">
                        К сожалению, запрашиваемая страница не существует или была перемещена.
                    </p>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => router.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Назад
                        </Button>
                        <Button onClick={() => router.push('/')}>
                            <Home className="mr-2 h-4 w-4" />
                            На главную
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
