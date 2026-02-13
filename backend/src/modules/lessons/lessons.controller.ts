// ============================================================================
// LESSONS CONTROLLER
// Совместим с frontend src/lib/api/courses.ts (lessons endpoints)
// ============================================================================

import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, Public } from '../../common/decorators';

@ApiTags('lessons')
@Controller()
export class LessonsController {
    constructor(private lessonsService: LessonsService) { }

    // GET /modules/:moduleId/lessons — Уроки модуля
    @Public()
    @Get('modules/:moduleId/lessons')
    @ApiOperation({ summary: 'Уроки модуля' })
    async getModuleLessons(@Param('moduleId') moduleId: string) {
        return this.lessonsService.getLessonsByModule(moduleId);
    }

    // GET /lessons/:id — Один урок
    @UseGuards(JwtAuthGuard)
    @Get('lessons/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Получить урок по ID' })
    async getLesson(@Param('id') id: string) {
        return this.lessonsService.findById(id);
    }

    // GET /lessons/:id/quiz — Квиз урока
    @UseGuards(JwtAuthGuard)
    @Get('lessons/:id/quiz')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Получить квиз урока' })
    async getQuiz(@Param('id') lessonId: string) {
        return this.lessonsService.getQuiz(lessonId);
    }

    // POST /quizzes/:quizId/attempts — Отправить ответы на квиз
    @UseGuards(JwtAuthGuard)
    @Post('quizzes/:quizId/attempts')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Отправить ответы на квиз' })
    async submitQuiz(
        @CurrentUser('id') userId: string,
        @Param('quizId') quizId: string,
        @Body() body: { answers: Record<string, number> },
    ) {
        return this.lessonsService.submitQuizAttempt(userId, quizId, body.answers);
    }

    // POST /lessons/:id/complete — Отметить урок как выполненный
    @UseGuards(JwtAuthGuard)
    @Post('lessons/:id/complete')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Отметить урок как завершённый' })
    async completeLesson(
        @CurrentUser('id') userId: string,
        @Param('id') lessonId: string,
    ) {
        return this.lessonsService.completeLesson(userId, lessonId);
    }
}
