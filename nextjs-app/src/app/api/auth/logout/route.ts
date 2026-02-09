import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Выход пользователя из системы
 */
export async function POST(request: NextRequest) {
    try {
        const response = NextResponse.json({
            success: true,
            message: 'Успешный выход из системы',
        });

        // Удаляем cookie с токеном
        response.cookies.delete('auth_token');

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}
