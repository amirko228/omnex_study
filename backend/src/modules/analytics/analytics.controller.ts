import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, Roles, Public } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
    constructor(private analyticsService: AnalyticsService) { }

    // POST /analytics/events — Трекинг событий (может быть анонимным)
    @Public()
    @Post('events')
    @ApiOperation({ summary: 'Логировать аналитическое событие' })
    async trackEvent(@Body() body: {
        eventType: string;
        entityType?: string;
        entityId?: string;
        data?: Record<string, unknown>;
        userId?: string;
    }) {
        return this.analyticsService.trackEvent(body.userId || null, body);
    }

    // GET /analytics/dashboard — Общая статистика (только админ)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Get('dashboard')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Dashboard статистика (Admin)' })
    async getDashboard() {
        return this.analyticsService.getDashboardStats();
    }
}
