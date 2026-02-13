// ============================================================================
// PRISMA MODULE - Экспортирует PrismaService для всех модулей
// ============================================================================

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Доступен во всех модулях без импорта
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule { }
