import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/login
 * Авторизация пользователя
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Валидация входных данных
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email и пароль обязательны' },
                { status: 400 }
            );
        }

        // В продакшене здесь будет реальная проверка через БД
        // Сейчас используем мок для демонстрации
        if (email === 'demo@example.com' && password === 'demo123') {
            const token = `mock_jwt_token_${Date.now()}`;
            const user = {
                id: '1',
                email,
                name: 'Demo User',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
                role: 'student',
                createdAt: new Date().toISOString(),
            };

            const response = NextResponse.json({
                success: true,
                data: { user, token },
                message: 'Успешный вход',
            });

            // Устанавливаем cookie с токеном
            response.cookies.set('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 дней
                path: '/',
            });

            return response;
        }

        return NextResponse.json(
            { error: 'Неверный email или пароль' },
            { status: 401 }
        );
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}
