// ============================================================================
// COURSES CONTROLLER — REST API курсов
// Совместим с frontend src/lib/api/courses.ts
// ============================================================================

import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, Public, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
    constructor(private coursesService: CoursesService) { }

    // GET /courses — Список курсов (публичный)
    @Public()
    @Get()
    @ApiOperation({ summary: 'Получить список курсов' })
    async findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('category') category?: string,
        @Query('level') level?: string,
        @Query('search') search?: string,
        @Query('sort') sort?: string,
    ) {
        return this.coursesService.findAll({ page, limit, category, level, search, sort });
    }

    // GET /courses/enrolled — Мои курсы
    @UseGuards(JwtAuthGuard)
    @Get('enrolled')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Мои записанные курсы' })
    async getEnrolled(@CurrentUser('id') userId: string) {
        return this.coursesService.getEnrolledCourses(userId);
    }

    // GET /courses/featured — Рекомендованные
    @Public()
    @Get('featured')
    @ApiOperation({ summary: 'Рекомендованные курсы' })
    async getFeatured() {
        return this.coursesService.getFeaturedCourses();
    }

    // GET /courses/popular — Популярные
    @Public()
    @Get('popular')
    @ApiOperation({ summary: 'Популярные курсы' })
    async getPopular(@Query('limit') limit?: number) {
        return this.coursesService.getPopularCourses(limit);
    }

    // GET /courses/recommended — Рекомендации для пользователя
    @UseGuards(JwtAuthGuard)
    @Get('recommended')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Рекомендации на основе интересов' })
    async getRecommended(@CurrentUser('id') userId: string) {
        return this.coursesService.getRecommendedCourses(userId);
    }

    // GET /courses/search — Поиск
    @Public()
    @Get('search')
    @ApiOperation({ summary: 'Поиск курсов' })
    async search(@Query('q') query: string) {
        return this.coursesService.searchCourses(query || '');
    }

    // GET /courses/:id — Получить курс
    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Получить курс по ID' })
    async findOne(@Param('id') id: string) {
        return this.coursesService.findById(id);
    }

    // GET /courses/:id/modules — Модули курса
    @Public()
    @Get(':id/modules')
    @ApiOperation({ summary: 'Получить модули курса' })
    async getModules(@Param('id') courseId: string) {
        return this.coursesService.getCourseModules(courseId);
    }

    // POST /courses — Создать курс
    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Создать курс' })
    async create(
        @CurrentUser('id') userId: string,
        @Body() body: {
            title: string;
            description?: string;
            category?: string;
            level?: string;
            language?: string;
            price?: number;
            tags?: string[];
            formats?: string[];
        },
    ) {
        return this.coursesService.createCourse(userId, body);
    }

    // POST /courses/:id/enroll — Записаться на курс
    @UseGuards(JwtAuthGuard)
    @Post(':id/enroll')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Записаться на курс' })
    async enroll(
        @CurrentUser('id') userId: string,
        @Param('id') courseId: string,
    ) {
        return this.coursesService.enrollCourse(userId, courseId);
    }

    // GET /courses/:id/progress — Прогресс по курсу
    @UseGuards(JwtAuthGuard)
    @Get(':id/progress')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Получить прогресс по курсу' })
    async getProgress(
        @CurrentUser('id') userId: string,
        @Param('id') courseId: string,
    ) {
        return this.coursesService.getCourseProgress(userId, courseId);
    }

    // PATCH /courses/:id — Обновить курс
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Обновить курс' })
    async update(
        @CurrentUser('id') userId: string,
        @Param('id') courseId: string,
        @Body() body: Record<string, unknown>,
    ) {
        return this.coursesService.updateCourse(courseId, userId, body);
    }
}
