import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/users/me
 * Получение данных текущего пользователя
 */
export async function GET(request: NextRequest) {
    try {
        // Проверка авторизации
        const authToken = request.cookies.get('auth_token');
        if (!authToken) {
            return NextResponse.json(
                { error: 'Требуется авторизация' },
                { status: 401 }
            );
        }

        // В продакшене здесь будет проверка токена и запрос к БД
        // Сейчас возвращаем мок-данные
        const user = {
            id: '1',
            email: 'demo@example.com',
            name: 'Demo User',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
            role: 'student',
            enrolledCourses: ['1', '2'],
            completedCourses: ['1'],
            progress: {
                totalHours: 45,
                completedLessons: 127,
                certificates: 3,
            },
            createdAt: '2024-01-15T10:00:00Z',
        };

        return NextResponse.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/users/me
 * Обновление данных пользователя
 */
export async function PATCH(request: NextRequest) {
    try {
        // Проверка авторизации
        const authToken = request.cookies.get('auth_token');
        if (!authToken) {
            return NextResponse.json(
                { error: 'Требуется авторизация' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, avatar, settings } = body;

        // В продакшене здесь будет обновление в БД
        const updatedUser = {
            id: '1',
            email: 'demo@example.com',
            name: name || 'Demo User',
            avatar: avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
            settings: settings || {},
            updatedAt: new Date().toISOString(),
        };

        return NextResponse.json({
            success: true,
            data: updatedUser,
            message: 'Профиль обновлён',
        });
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}
