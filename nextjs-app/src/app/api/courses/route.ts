import { NextRequest, NextResponse } from 'next/server';

// Мок-данные курсов (в продакшене будет запрос к БД)
const mockCourses = [
    {
        id: '1',
        title: 'Машинное обучение с нуля',
        description: 'Полный курс по ML: от основ до продвинутых техник',
        category: 'AI & Machine Learning',
        level: 'beginner',
        price: 49.99,
        duration: 40,
        rating: 4.8,
        studentsCount: 12500,
        thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600',
        instructor: {
            name: 'Алексей Иванов',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        },
    },
    {
        id: '2',
        title: 'React и Next.js Pro',
        description: 'Современный веб-разработчик: React, Next.js, TypeScript',
        category: 'Web Development',
        level: 'intermediate',
        price: 39.99,
        duration: 35,
        rating: 4.9,
        studentsCount: 8900,
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600',
        instructor: {
            name: 'Мария Петрова',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        },
    },
    {
        id: '3',
        title: 'Python для Data Science',
        description: 'Анализ данных, визуализация и машинное обучение на Python',
        category: 'Data Science',
        level: 'intermediate',
        price: 44.99,
        duration: 45,
        rating: 4.7,
        studentsCount: 15600,
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
        instructor: {
            name: 'Дмитрий Сидоров',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        },
    },
];

/**
 * GET /api/courses
 * Получение списка курсов с фильтрацией и пагинацией
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Параметры фильтрации
        const category = searchParams.get('category');
        const level = searchParams.get('level');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);

        // Фильтрация курсов
        let filteredCourses = [...mockCourses];

        if (category && category !== 'all') {
            filteredCourses = filteredCourses.filter(c =>
                c.category.toLowerCase().includes(category.toLowerCase())
            );
        }

        if (level && level !== 'all') {
            filteredCourses = filteredCourses.filter(c => c.level === level);
        }

        if (search) {
            const query = search.toLowerCase();
            filteredCourses = filteredCourses.filter(c =>
                c.title.toLowerCase().includes(query) ||
                c.description.toLowerCase().includes(query)
            );
        }

        // Пагинация
        const total = filteredCourses.length;
        const startIndex = (page - 1) * limit;
        const paginatedCourses = filteredCourses.slice(startIndex, startIndex + limit);

        return NextResponse.json({
            success: true,
            data: {
                courses: paginatedCourses,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('Get courses error:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/courses
 * Создание нового курса (только для администраторов)
 */
export async function POST(request: NextRequest) {
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
        const { title, description, category, level, price, duration } = body;

        // Валидация
        if (!title || !description || !category || !level || !price) {
            return NextResponse.json(
                { error: 'Все поля обязательны' },
                { status: 400 }
            );
        }

        // В продакшене здесь будет сохранение в БД
        const newCourse = {
            id: `course_${Date.now()}`,
            title,
            description,
            category,
            level,
            price,
            duration: duration || 0,
            rating: 0,
            studentsCount: 0,
            thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
            createdAt: new Date().toISOString(),
        };

        return NextResponse.json({
            success: true,
            data: newCourse,
            message: 'Курс успешно создан',
        }, { status: 201 });
    } catch (error) {
        console.error('Create course error:', error);
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}
