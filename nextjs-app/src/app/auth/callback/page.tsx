'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { apiClient } from '@/lib/api-client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface OAuthResponse {
    token: string;
    refreshToken?: string;
}

/**
 * Страница обработки OAuth callback.
 * 
 * Когда пользователь авторизуется через Google/VK/Yandex,
 * провайдер редиректит сюда с параметрами:
 * /auth/callback?provider=google&code=AUTH_CODE
 * 
 * Страница:
 * 1. Извлекает provider и code из URL
 * 2. Отправляет code на бэкенд POST /auth/oauth/{provider}/callback
 * 3. Получает токены (accessToken + refreshToken)
 * 4. Сохраняет токены в localStorage
 * 5. Редиректит на /dashboard
 */
export default function OAuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const handleCallback = async () => {
            // Получаем параметры из URL
            const provider = searchParams.get('provider');
            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const error = searchParams.get('error');

            // Проверка ошибки от провайдера
            if (error) {
                setStatus('error');
                setErrorMessage(`Провайдер вернул ошибку: ${error}`);
                return;
            }

            // Проверяем наличие обязательных параметров
            if (!provider || !code) {
                setStatus('error');
                setErrorMessage('Отсутствуют параметры авторизации (provider или code).');
                return;
            }

            try {
                // Реконструируем redirect_uri (тот же формат что при инициализации OAuth)
                const redirectUri = `${window.location.origin}/auth/callback?provider=${provider}`;

                // Отправляем code на бэкенд для обмена на токены
                const response = await authApi.oauthCallback(
                    provider as 'google' | 'vk' | 'yandex',
                    code,
                    state || undefined,
                    redirectUri
                );

                // Проверяем ответ
                if (response.data && (response.data as OAuthResponse).token) {
                    const data = response.data as OAuthResponse;

                    // Сохраняем токены
                    apiClient.setToken(data.token);
                    if (data.refreshToken) {
                        localStorage.setItem('refresh_token', data.refreshToken);
                    }

                    setStatus('success');

                    // Редирект в dashboard через 1 секунду
                    // Используем window.location.href вместо router.push 
                    // чтобы react-query перезагрузил getCurrentUser с новым токеном
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 1000);
                } else {
                    throw new Error('Сервер не вернул токен авторизации');
                }
            } catch (err: unknown) {
                const error = err as Record<string, unknown>;
                const response = error?.response as Record<string, unknown> | undefined;
                const data = response?.data as Record<string, unknown> | undefined;
                setStatus('error');
                setErrorMessage(
                    (data?.message as string) ||
                    (error?.message as string) ||
                    'Ошибка авторизации через OAuth. Попробуйте ещё раз.'
                );
            }
        };

        handleCallback();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center max-w-md mx-auto px-6">
                {status === 'loading' && (
                    <div className="space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                        <h2 className="text-xl font-semibold">Авторизация...</h2>
                        <p className="text-muted-foreground">
                            Обрабатываем ваши данные. Пожалуйста, подождите.
                        </p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                        <h2 className="text-xl font-semibold text-green-600">Успешно!</h2>
                        <p className="text-muted-foreground">
                            Вы успешно авторизованы. Перенаправляем в личный кабинет...
                        </p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4">
                        <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                        <h2 className="text-xl font-semibold text-red-600">Ошибка авторизации</h2>
                        <p className="text-muted-foreground">{errorMessage}</p>
                        <div className="flex gap-3 justify-center mt-6">
                            <button
                                onClick={() => router.push('/login')}
                                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition"
                            >
                                Войти другим способом
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                className="px-6 py-2.5 border border-input rounded-xl font-medium hover:bg-muted transition"
                            >
                                На главную
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
