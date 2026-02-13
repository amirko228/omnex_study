// ============================================================================
// PRISMA SERVICE - Подключение к PostgreSQL
// Синглтон сервис для работы с базой данных
// ============================================================================

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super({
            log: process.env.NODE_ENV === 'development'
                ? ['query', 'info', 'warn', 'error']
                : ['error'],
        });
    }

    // Подключаемся к БД при старте модуля
    async onModuleInit() {
        await this.$connect();
        console.log('✅ PostgreSQL подключён');
    }

    // Отключаемся при завершении
    async onModuleDestroy() {
        await this.$disconnect();
        console.log('❌ PostgreSQL отключён');
    }
}
