import { Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AIController {
    constructor(private aiService: AIService) { }

    // POST /ai/courses/generate — Генерация курса ИИ
    @Post('courses/generate')
    @ApiOperation({ summary: 'Сгенерировать курс с помощью ИИ' })
    async generateCourse(
        @CurrentUser('id') userId: string,
        @Body() body: {
            topic: string;
            targetAudience?: string;
            difficulty?: string;
            language?: string;
            modulesCount?: number;
            lessonsPerModule?: number;
        },
    ) {
        return this.aiService.generateCourse(userId, body);
    }

    // POST /ai/chats — Создать чат
    @Post('chats')
    @ApiOperation({ summary: 'Создать AI чат' })
    async createChat(
        @CurrentUser('id') userId: string,
        @Body() body: { courseId?: string; lessonId?: string; type?: string },
    ) {
        return this.aiService.createChat(userId, body);
    }

    // GET /ai/chats — Мои чаты
    @Get('chats')
    @ApiOperation({ summary: 'Список AI чатов' })
    async getChats(@CurrentUser('id') userId: string) {
        return this.aiService.getUserChats(userId);
    }

    // GET /ai/chats/:id — Один чат
    @Get('chats/:id')
    @ApiOperation({ summary: 'Получить AI чат' })
    async getChat(@Param('id') id: string) {
        return this.aiService.getChat(id);
    }

    // POST /ai/chats/:id/messages — Отправить сообщение
    @Post('chats/:id/messages')
    @ApiOperation({ summary: 'Отправить сообщение в AI чат' })
    async sendMessage(
        @CurrentUser('id') userId: string,
        @Param('id') chatId: string,
        @Body() body: { content: string },
    ) {
        return this.aiService.sendMessage(userId, chatId, body.content);
    }

    // GET /ai/learning-path — Путь обучения
    @Get('learning-path')
    @ApiOperation({ summary: 'Путь обучения (ИИ)' })
    async getLearningPath(@CurrentUser('id') userId: string) {
        return this.aiService.getRecommendations(userId);
    }

    // POST /ai/courses/:id/adapt — Адаптация сложности
    @Post('courses/:id/adapt')
    @ApiOperation({ summary: 'Адаптировать сложность курса' })
    async adaptCourse(
        @Param('id') courseId: string,
        @Body() body: { performance: { score: number; timeSpent: number } },
    ) {
        return this.aiService.adaptCourseContent(courseId, body.performance);
    }

    // POST /ai/quiz/generate — Генерация квиза
    @Post('quiz/generate')
    @ApiOperation({ summary: 'Сгенерировать квиз ИИ' })
    async generateQuiz(
        @Body() body: { topic: string; questionsCount?: number; difficulty?: string },
    ) {
        return this.aiService.generateQuiz(body);
    }

    // GET /ai/recommendations — Рекомендации
    @Get('recommendations')
    @ApiOperation({ summary: 'AI рекомендации курсов' })
    async getRecommendations(@CurrentUser('id') userId: string) {
        return this.aiService.getRecommendations(userId);
    }

    // ==========================================
    // НОВЫЕ ЭНДПОИНТЫ
    // ==========================================

    // POST /ai/translate — Перевод контента
    @Post('translate')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Перевести контент' })
    async translateContent(
        @Body() body: { content: string; targetLanguage: string; sourceLanguage?: string },
    ) {
        return this.aiService.translateContent(body.content, body.targetLanguage, body.sourceLanguage);
    }

    // POST /ai/courses/:id/auto-translate — Автоперевод курса
    @Post('courses/:id/auto-translate')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Автоперевод курса' })
    async autoTranslateCourse(
        @Param('id') courseId: string,
        @Body() body: { targetLanguage: string },
    ) {
        return this.aiService.autoTranslateCourse(courseId, body.targetLanguage);
    }

    // POST /ai/assignments/:id/feedback — Фидбэк по заданию
    @Post('assignments/:id/feedback')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'AI-фидбэк по заданию' })
    async getAssignmentFeedback(
        @Param('id') assignmentId: string,
        @Body() body: { submission: string },
    ) {
        return this.aiService.getAssignmentFeedback(assignmentId, body.submission);
    }
}

