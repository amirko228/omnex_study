// ============================================================================
// LESSONS SERVICE — Уроки и квизы
// ============================================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LessonsService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService,
    ) { }

    // Уроки модуля
    async getLessonsByModule(moduleId: string) {
        return this.prisma.lesson.findMany({
            where: { moduleId },
            orderBy: { orderIndex: 'asc' },
        });
    }

    // Один урок по ID
    async findById(lessonId: string) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                quizzes: {
                    include: {
                        questions: { orderBy: { orderIndex: 'asc' } },
                    },
                },
            },
        });

        if (!lesson) throw new NotFoundException('Урок не найден');
        return lesson;
    }

    // Квиз урока
    async getQuiz(lessonId: string) {
        const quiz = await this.prisma.quiz.findFirst({
            where: { lessonId },
            include: {
                questions: {
                    orderBy: { orderIndex: 'asc' },
                    select: {
                        id: true,
                        question: true,
                        options: true,
                        points: true,
                        orderIndex: true,
                        // НЕ отдаём correctAnswer и explanation
                    },
                },
            },
        });

        if (!quiz) throw new NotFoundException('Квиз не найден');
        return quiz;
    }

    // Отправить ответы на квиз
    async submitQuizAttempt(userId: string, quizId: string, answers: Record<string, number>) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: { questions: true },
        });

        if (!quiz) throw new NotFoundException('Квиз не найден');

        // Вычисляем результат
        let totalPoints = 0;
        let earnedPoints = 0;

        for (const question of quiz.questions) {
            totalPoints += question.points;
            if (answers[question.id] === question.correctAnswer) {
                earnedPoints += question.points;
            }
        }

        const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
        const passed = score >= quiz.passingScore;

        // Сохраняем попытку
        const attempt = await this.prisma.quizAttempt.create({
            data: {
                quizId,
                userId,
                answers,
                score,
                passed,
            },
        });

        // Отправляем уведомление о результате квиза
        await this.notificationsService.create(userId, {
            type: passed ? 'info' : 'warning',
            title: passed ? 'Тест пройден!' : 'Тест не пройден',
            message: passed
                ? `Поздравляем! Вы набрали ${score}% в тесте "${quiz.title || 'урока'}".`
                : `Ваш результат: ${score}%. Для прохождения нужно ${quiz.passingScore}%. Попробуйте еще раз!`,
            channel: 'in-app'
        });

        return {
            ...attempt,
            totalQuestions: quiz.questions.length,
            correctAnswers: earnedPoints,
            // Отдаём правильные ответы после отправки
            correctAnswersMap: Object.fromEntries(
                quiz.questions.map(q => [q.id, { correct: q.correctAnswer, explanation: q.explanation }]),
            ),
        };
    }

    // Пометить урок как завершённый
    async completeLesson(userId: string, lessonId: string) {
        const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
        if (!lesson) throw new NotFoundException('Урок не найден');

        await this.prisma.userProgress.upsert({
            where: { userId_lessonId: { userId, lessonId } },
            update: { isCompleted: true, completedAt: new Date() },
            create: {
                userId,
                lessonId,
                isCompleted: true,
                completedAt: new Date(),
            },
        });

        // Уведомление о завершении урока
        await this.notificationsService.create(userId, {
            type: 'success',
            title: 'Урок завершен',
            message: `Отлично! Вы завершили урок "${lesson.title}". Продолжайте в том же темпе!`,
            channel: 'in-app'
        });

        return { message: 'Урок завершён' };
    }
}
