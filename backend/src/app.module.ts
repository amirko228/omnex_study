// ============================================================================
// APP MODULE - Корневой модуль приложения
// Подключаем все модули платформы
// ============================================================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

// Core сервисы
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';

// Модули приложения
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { ProgressModule } from './modules/progress/progress.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AIModule } from './modules/ai/ai.module';
import { BillingModule } from './modules/billing/billing.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthController } from './health.controller';

@Module({
    imports: [
        // ==========================================
        // Конфигурация из .env
        // ==========================================
        ConfigModule.forRoot({
            isGlobal: true,      // Доступно во всех модулях
            envFilePath: '.env',
        }),

        // ==========================================
        // Rate Limiting (защита от DDoS)
        // ==========================================
        ThrottlerModule.forRoot([
            {
                ttl: parseInt(process.env.THROTTLE_TTL || '60') * 1000,
                limit: parseInt(process.env.THROTTLE_LIMIT || '100'),
            },
        ]),

        // ==========================================
        // Core сервисы (БД, кеш)
        // ==========================================
        PrismaModule,
        RedisModule,

        // ==========================================
        // Модули приложения
        // ==========================================
        AuthModule,
        UsersModule,
        CoursesModule,
        LessonsModule,
        ProgressModule,
        ReviewsModule,
        AIModule,
        BillingModule,
        NotificationsModule,
        AnalyticsModule,
        AdminModule,
    ],
    controllers: [HealthController],
})
export class AppModule { }
