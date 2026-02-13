// ============================================================================
// MAIN.TS - Точка входа NestJS приложения
// ============================================================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // ==========================================
    // Глобальный префикс API
    // ==========================================
    const apiPrefix = process.env.API_PREFIX || 'api/v1';
    app.setGlobalPrefix(apiPrefix);

    // ==========================================
    // CORS - разрешаем запросы от frontend
    // ==========================================
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // ==========================================
    // Безопасность
    // ==========================================
    app.use(helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    }));
    app.use(cookieParser());

    // ==========================================
    // Глобальные Interceptors и Filters
    // ==========================================
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());

    // ==========================================
    // Валидация DTO (глобально)
    // ==========================================
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,           // Убирает лишние поля из запроса
            forbidNonWhitelisted: true, // Ошибка при лишних полях
            transform: true,           // Авто-преобразование типов
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    // ==========================================
    // Swagger / OpenAPI документация
    // ==========================================
    if (process.env.NODE_ENV !== 'production') {
        const config = new DocumentBuilder()
            .setTitle('Omnex Study API')
            .setDescription('AI Learning Platform — REST API')
            .setVersion('1.0')
            .addBearerAuth()
            .addTag('auth', 'Аутентификация и авторизация')
            .addTag('users', 'Управление пользователями')
            .addTag('courses', 'Курсы')
            .addTag('lessons', 'Уроки')
            .addTag('progress', 'Прогресс обучения')
            .addTag('reviews', 'Отзывы')
            .addTag('ai', 'AI сервисы')
            .addTag('billing', 'Платежи и подписки')
            .addTag('notifications', 'Уведомления')
            .addTag('analytics', 'Аналитика')
            .addTag('admin', 'Администрирование')
            .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('docs', app, document);
    }

    // ==========================================
    // Запуск сервера
    // ==========================================
    const port = process.env.PORT || 4000;
    await app.listen(port);

    console.log(`🚀 Omnex Backend запущен на порту ${port}`);
    console.log(`📚 Swagger: http://localhost:${port}/docs`);
    console.log(`🌐 API: http://localhost:${port}/${apiPrefix}`);
}

bootstrap();
