// ============================================================================
// HEALTH CONTROLLER — Endpoint для мониторинга и Docker health checks
// Дополнение (не из ТЗ) — необходим для production
// ============================================================================

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from './common/prisma/prisma.service';
import { RedisService } from './common/redis/redis.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
    constructor(
        private prisma: PrismaService,
        private redis: RedisService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Проверка состояния сервера' })
    async check() {
        const checks: Record<string, string> = {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };

        // Проверяем PostgreSQL
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            checks.database = 'ok';
        } catch {
            checks.database = 'error';
            checks.status = 'degraded';
        }

        // Проверяем Redis
        try {
            await this.redis.set('health:check', 'ok', 10);
            checks.redis = 'ok';
        } catch {
            checks.redis = 'error';
            checks.status = 'degraded';
        }

        return checks;
    }
}
