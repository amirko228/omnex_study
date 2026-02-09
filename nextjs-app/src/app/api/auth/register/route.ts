import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/register
 * Регистрация нового пользователя
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, password, confirmPassword } = body;

        // Валидация входных данных
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Имя, email и пароль обязательны' },
                { status: 400 }
            );
        }

        // Проверка формата email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Некорректный формат email' },
                { status: 400 }
            );
        }

        // Проверка длины пароля
        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Пароль должен содержать минимум 8 символов' },
                { status: 400 }
            );
        }

        // Проверка совпадения паролей
        if (password !== confirmPassword) {
            return NextResponse.json(
                { error: 'Пароли не совпадают' },
                { status: 400 }
            );
        }

        // В продакшене здесь будет сохранение в БД
        // Сейчас возвращаем мок успешного ответа
        const token = `mock_jwt_token_${Date.now()}`;
        const user = {
            id: `user_${Date.now()}`,
            name,
            email,
            avatar: null,
            role: 'student',
            createdAt: new Date().toISOString(),
        };

        const response = NextResponse.json({
            success: true,
            data: { user, token },
            message: 'Регистрация успешна',
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
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}
