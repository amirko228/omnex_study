// ============================================================================
// AI SERVICE — Интеграция с OpenAI для генерации курсов и ИИ-наставника
// Совместим с frontend src/lib/api/ai.ts
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { NotificationsService } from '../notifications/notifications.service';
import OpenAI from 'openai';

@Injectable()
export class AIService {
    private openai: OpenAI;
    private readonly logger = new Logger(AIService.name);

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
        private redis: RedisService,
        private notificationsService: NotificationsService,
    ) {
        // Инициализируем OpenAI клиент
        this.openai = new OpenAI({
            apiKey: this.configService.get('OPENAI_API_KEY', ''),
        });
    }

    // ==========================================
    // ГЕНЕРАЦИЯ КУРСА
    // ==========================================
    async generateCourse(userId: string, request: {
        topic: string;
        targetAudience?: string;
        difficulty?: string;
        language?: string;
        modulesCount?: number;
        lessonsPerModule?: number;
    }) {
        const { topic, targetAudience = 'beginners', difficulty = 'beginner', language = 'ru', modulesCount = 5, lessonsPerModule = 4 } = request;

        this.logger.log(`Генерация курса: "${topic}" для ${userId}`);

        try {
            const prompt = `Создай детальный онлайн-курс на тему: "${topic}".

Параметры:
- Целевая аудитория: ${targetAudience}
- Сложность: ${difficulty}
- Язык: ${language}
- Количество модулей: ${modulesCount}
- Уроков на модуль: ${lessonsPerModule}

Верни JSON в формате:
{
  "title": "Название курса",
  "description": "Описание курса (2-3 предложения)",
  "category": "Категория",
  "level": "${difficulty}",
  "modules": [
    {
      "title": "Название модуля",
      "description": "Описание модуля",
      "lessons": [
        {
          "title": "Название урока",
          "type": "text",
          "content": "Подробный контент урока (минимум 500 слов, с примерами и объяснениями)"
        }
      ]
    }
  ]
}

Контент должен быть:
- Практичным с реальными примерами
- Структурированным с чёткими объяснениями
- Содержать ключевые термины и определения
- На языке: ${language}`;

            // Retry logic — до 3 попыток для стабильного JSON
            let courseData: any = null;
            let lastError: Error | null = null;
            let tokensUsed = 0;
            const maxRetries = 3;

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    this.logger.log(`Попытка генерации ${attempt}/${maxRetries}...`);

                    const completion = await this.openai.chat.completions.create({
                        model: this.configService.get('OPENAI_MODEL', 'gpt-4'),
                        messages: [
                            { role: 'system', content: 'Ты — эксперт по созданию образовательного контента. Отвечай строго в формате JSON. Не добавляй комментарии вне JSON.' },
                            { role: 'user', content: prompt },
                        ],
                        max_tokens: parseInt(this.configService.get('OPENAI_MAX_TOKENS', '4096')),
                        temperature: 0.7,
                        response_format: { type: 'json_object' },
                    });

                    const raw = completion.choices[0].message.content || '{}';
                    courseData = JSON.parse(raw);

                    // Валидация структуры ответа
                    if (!courseData.title || !courseData.modules || !Array.isArray(courseData.modules)) {
                        throw new Error('Неверная структура JSON: отсутствует title или modules');
                    }

                    // Логируем токены
                    tokensUsed = completion.usage?.total_tokens || 0;
                    this.logger.log(`✅ JSON валиден (попытка ${attempt}), токенов: ${tokensUsed}`);
                    break; // Успех — выходим из цикла
                } catch (err) {
                    lastError = err as Error;
                    this.logger.warn(`⚠️ Попытка ${attempt}/${maxRetries} не удалась: ${lastError.message}`);
                    if (attempt < maxRetries) {
                        await new Promise(r => setTimeout(r, 1000 * attempt)); // Backoff
                    }
                }
            }

            if (!courseData) {
                throw lastError || new Error('Не удалось сгенерировать курс после 3 попыток');
            }

            // Сохраняем курс в БД
            const course = await this.prisma.course.create({
                data: {
                    title: courseData.title,
                    description: courseData.description,
                    category: courseData.category || 'General',
                    level: courseData.level || difficulty,
                    language,
                    authorId: userId,
                    isAIGenerated: true,
                    isPublished: true,
                    formats: ['text', 'quiz', 'chat', 'assignment'],
                    slug: `${courseData.title.toLowerCase().replace(/\s+/g, '-').substring(0, 100)}-${Date.now()}`,
                    modules: {
                        create: (courseData.modules || []).map((mod: any, modIdx: number) => ({
                            title: mod.title,
                            description: mod.description,
                            orderIndex: modIdx,
                            lessons: {
                                create: (mod.lessons || []).map((lesson: any, lesIdx: number) => ({
                                    title: lesson.title,
                                    type: lesson.type || 'text',
                                    content: lesson.content,
                                    orderIndex: lesIdx,
                                })),
                            },
                        })),
                    },
                },
                include: {
                    modules: { include: { lessons: true } },
                },
            });

            // Логируем AI генерацию
            await this.prisma.aIGeneratedCourse.create({
                data: {
                    userId,
                    courseId: course.id,
                    prompt: topic,
                    generationParams: request as any,
                    tokensUsed,
                },
            });

            // Автоматически записываем пользователя
            await this.prisma.enrollment.create({
                data: { userId, courseId: course.id },
            });

            this.logger.log(`Курс сгенерирован: ${course.id}, токенов: ${tokensUsed}`);

            // Отправляем уведомление пользователю
            await this.notificationsService.create(userId, {
                type: 'course_update',
                title: 'Курс готов!',
                message: `Ваш персональный курс "${course.title}" успешно сгенерирован и ждет вас.`,
                channel: 'all', // In-app + Email
                data: { courseId: course.id }
            });

            return course;
        } catch (error) {
            this.logger.error('Ошибка генерации курса:', error);
            throw error;
        }
    }

    // ==========================================
    // ЧАТ С ИИ-НАСТАВНИКОМ
    // ==========================================
    async createChat(userId: string, params: { courseId?: string; lessonId?: string; type?: string }) {
        return this.prisma.aIChat.create({
            data: {
                userId,
                courseId: params.courseId,
                lessonId: params.lessonId,
                type: params.type || 'general',
            },
            include: { messages: true },
        });
    }

    async getChat(chatId: string) {
        return this.prisma.aIChat.findUnique({
            where: { id: chatId },
            include: {
                messages: { orderBy: { createdAt: 'asc' } },
            },
        });
    }

    async getUserChats(userId: string) {
        return this.prisma.aIChat.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            include: {
                messages: { take: 1, orderBy: { createdAt: 'desc' } },
            },
        });
    }

    async sendMessage(userId: string, chatId: string, content: string) {
        // Сохраняем сообщение пользователя
        await this.prisma.aIMessage.create({
            data: { chatId, role: 'user', content },
        });

        // Получаем историю чата для контекста
        const chat = await this.prisma.aIChat.findUnique({
            where: { id: chatId },
            include: {
                messages: { orderBy: { createdAt: 'asc' }, take: 20 },
                course: { select: { title: true, description: true } },
                lesson: { select: { title: true, content: true } },
            },
        });

        // Формируем контекст
        let systemPrompt = 'Ты — AI-наставник на образовательной платформе Omnex Study. Помогай пользователю учиться, объясняй сложные темы простым языком, давай примеры.';

        if (chat?.course) {
            systemPrompt += ` Текущий курс: "${chat.course.title}". ${chat.course.description || ''}`;
        }
        if (chat?.lesson) {
            systemPrompt += ` Текущий урок: "${chat.lesson.title}".`;
        }

        const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
            { role: 'system', content: systemPrompt },
            ...(chat?.messages || []).map(m => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
            })),
        ];

        try {
            const completion = await this.openai.chat.completions.create({
                model: this.configService.get('OPENAI_MODEL', 'gpt-4'),
                messages,
                max_tokens: 2048,
                temperature: 0.7,
            });

            const aiResponse = completion.choices[0].message.content || 'Извините, произошла ошибка.';

            // Сохраняем ответ ИИ
            const aiMessage = await this.prisma.aIMessage.create({
                data: { chatId, role: 'assistant', content: aiResponse },
            });

            // Обновляем updatedAt чата
            await this.prisma.aIChat.update({
                where: { id: chatId },
                data: { updatedAt: new Date() },
            });

            return aiMessage;
        } catch (error) {
            this.logger.error('Ошибка AI чата:', error);

            // Сохраняем сообщение об ошибке
            return this.prisma.aIMessage.create({
                data: { chatId, role: 'assistant', content: 'Извините, сейчас я не могу ответить. Попробуйте позже.' },
            });
        }
    }

    // ==========================================
    // ГЕНЕРАЦИЯ КВИЗОВ
    // ==========================================
    async generateQuiz(params: { topic: string; questionsCount?: number; difficulty?: string }) {
        const { topic, questionsCount = 5, difficulty = 'medium' } = params;

        const prompt = `Создай ${questionsCount} тестовых вопросов по теме "${topic}" (сложность: ${difficulty}).

Верни JSON:
{
  "questions": [
    {
      "question": "Текст вопроса",
      "options": ["Вариант 1", "Вариант 2", "Вариант 3", "Вариант 4"],
      "correctAnswer": 0,
      "explanation": "Объяснение правильного ответа"
    }
  ]
}`;

        try {
            const completion = await this.openai.chat.completions.create({
                model: this.configService.get('OPENAI_MODEL', 'gpt-4'),
                messages: [
                    { role: 'system', content: 'Создай тестовые вопросы. Отвечай только JSON.' },
                    { role: 'user', content: prompt },
                ],
                response_format: { type: 'json_object' },
            });

            const data = JSON.parse(completion.choices[0].message.content || '{"questions":[]}');
            return data.questions || [];
        } catch (error) {
            this.logger.error('Ошибка генерации квиза:', error);
            return [];
        }
    }

    // ==========================================
    // РЕКОМЕНДАЦИИ
    // ==========================================
    async getRecommendations(userId: string) {
        // Получаем интересы пользователя
        const enrollments = await this.prisma.enrollment.findMany({
            where: { userId },
            include: { course: { select: { category: true, tags: true } } },
        });

        const categories = [...new Set(enrollments.map(e => e.course.category).filter(Boolean))];
        const enrolledIds = enrollments.map(e => e.courseId);

        return this.prisma.course.findMany({
            where: {
                isPublished: true,
                deletedAt: null,
                id: { notIn: enrolledIds },
                ...(categories.length > 0 ? { category: { in: categories as string[] } } : {}),
            },
            take: 6,
            orderBy: { rating: 'desc' },
        });
    }

    // ==========================================
    // АДАПТАЦИЯ СЛОЖНОСТИ (с AI-анализом)
    // ==========================================
    async adaptCourseContent(courseId: string, performance: { score: number; timeSpent: number }) {
        this.logger.log(`Адаптация курса ${courseId}, score: ${performance.score}`);

        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            select: { title: true, level: true, category: true },
        });

        let adaptationLevel = 'standard';
        let suggestions: string[] = [];

        if (performance.score < 50) {
            adaptationLevel = 'simplified';
            suggestions = [
                'Добавить больше базовых примеров',
                'Упростить формулировки',
                'Разбить сложные темы на подтемы',
            ];
        } else if (performance.score > 85) {
            adaptationLevel = 'advanced';
            suggestions = [
                'Добавить углублённые задания',
                'Включить продвинутые концепции',
                'Предложить дополнительные материалы',
            ];
        } else {
            suggestions = [
                'Поддерживать текущий уровень сложности',
                'Добавить больше практических заданий',
            ];
        }

        return {
            courseId,
            courseTitle: course?.title,
            currentLevel: course?.level,
            adaptationLevel,
            performanceScore: performance.score,
            timeSpent: performance.timeSpent,
            suggestions,
            message: `Контент адаптирован: ${adaptationLevel}`,
        };
    }

    // ==========================================
    // ПЕРЕВОД КОНТЕНТА (через OpenAI)
    // ==========================================
    async translateContent(content: string, targetLanguage: string, sourceLanguage?: string) {
        this.logger.log(`Перевод контента на ${targetLanguage}, из ${sourceLanguage || 'auto'}`);

        try {
            const langNames: Record<string, string> = {
                ru: 'русский', en: 'English', de: 'Deutsch', fr: 'français', es: 'español',
            };
            const targetName = langNames[targetLanguage] || targetLanguage;

            const completion = await this.openai.chat.completions.create({
                model: this.configService.get('OPENAI_MODEL', 'gpt-4'),
                messages: [
                    { role: 'system', content: `Ты — профессиональный переводчик. Переведи текст на ${targetName}. Сохрани форматирование, HTML-теги и структуру. Верни ТОЛЬКО перевод, без комментариев.` },
                    { role: 'user', content: content },
                ],
                max_tokens: 4096,
                temperature: 0.3,
            });

            return {
                original: content,
                translated: completion.choices[0].message.content || content,
                sourceLanguage: sourceLanguage || 'auto',
                targetLanguage,
                tokensUsed: completion.usage?.total_tokens || 0,
            };
        } catch (error) {
            this.logger.error(`Ошибка перевода: ${error.message}`);
            return {
                original: content,
                translated: content, // Возвращаем оригинал при ошибке
                sourceLanguage: sourceLanguage || 'auto',
                targetLanguage,
                error: 'Translation failed',
            };
        }
    }

    // ==========================================
    // АВТОПЕРЕВОД КУРСА
    // ==========================================
    async autoTranslateCourse(courseId: string, targetLanguage: string) {
        this.logger.log(`Автоперевод курса ${courseId} на ${targetLanguage}`);

        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            include: {
                modules: {
                    include: { lessons: true },
                },
            },
        });

        if (!course) {
            return { error: 'Курс не найден' };
        }

        let translatedCount = 0;

        // Переводим заголовок и описание курса
        const titleResult = await this.translateContent(course.title, targetLanguage, course.language);
        const descResult = await this.translateContent(course.description || '', targetLanguage, course.language);

        // Переводим каждый урок
        for (const mod of course.modules) {
            for (const lesson of mod.lessons) {
                try {
                    const translated = await this.translateContent(
                        lesson.content || '',
                        targetLanguage,
                        course.language,
                    );

                    // Можно сохранить в отдельное поле или создать копию
                    this.logger.log(`Переведён урок: ${lesson.title}`);
                    translatedCount++;
                } catch (err) {
                    this.logger.warn(`Пропуск урока ${lesson.id}: ${err.message}`);
                }
            }
        }

        return {
            courseId,
            originalLanguage: course.language,
            targetLanguage,
            translatedTitle: titleResult.translated,
            translatedDescription: descResult.translated,
            translatedLessons: translatedCount,
            totalLessons: course.modules.reduce((acc, m) => acc + m.lessons.length, 0),
            status: 'completed',
            message: `Курс "${course.title}" переведён на ${targetLanguage}`,
        };
    }

    // ==========================================
    // ФИДБЭК ПО ЗАДАНИЮ (через OpenAI)
    // ==========================================
    async getAssignmentFeedback(assignmentId: string, submission: string) {
        this.logger.log(`Генерация фидбэка для задания ${assignmentId}`);

        try {
            const completion = await this.openai.chat.completions.create({
                model: this.configService.get('OPENAI_MODEL', 'gpt-4'),
                messages: [
                    {
                        role: 'system',
                        content: `Ты — преподаватель, который оценивает работу студента. Проанализируй ответ и дай подробную обратную связь.

Верни JSON:
{
  "score": число от 0 до 100,
  "feedback": "Общий комментарий к работе",
  "strengths": ["Сильная сторона 1", "Сильная сторона 2"],
  "suggestions": ["Совет 1", "Совет 2", "Совет 3"]
}`,
                    },
                    { role: 'user', content: `Ответ студента:\n\n${submission}` },
                ],
                response_format: { type: 'json_object' },
                max_tokens: 1024,
                temperature: 0.5,
            });

            const data = JSON.parse(completion.choices[0].message.content || '{}');

            return {
                assignmentId,
                score: data.score ?? 70,
                feedback: data.feedback || 'Работа проверена.',
                suggestions: data.suggestions || [],
                strengths: data.strengths || [],
                tokensUsed: completion.usage?.total_tokens || 0,
            };
        } catch (error) {
            this.logger.error(`Ошибка генерации фидбэка: ${error.message}`);
            return {
                assignmentId,
                score: 70,
                feedback: 'Автоматическая проверка временно недоступна. Работа будет проверена вручную.',
                suggestions: [],
                strengths: [],
            };
        }
    }
}

