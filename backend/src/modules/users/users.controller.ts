import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
    constructor(private usersService: UsersService) { }

    // GET /users/me — Мой профиль
    @Get('me')
    @ApiOperation({ summary: 'Получить свой профиль' })
    async getMyProfile(@CurrentUser('id') userId: string) {
        return this.usersService.findById(userId);
    }

    // GET /users/me/profile — Детальный профиль
    @Get('me/profile')
    @ApiOperation({ summary: 'Получить детальный профиль' })
    async getDetailedProfile(@CurrentUser('id') userId: string) {
        return this.usersService.findById(userId);
    }

    // PATCH /users/me — Обновить профиль
    @Patch('me')
    @ApiOperation({ summary: 'Обновить профиль' })
    async updateProfile(
        @CurrentUser('id') userId: string,
        @Body() body: { name?: string; bio?: string; phone?: string; country?: string; timezone?: string; locale?: string; avatar?: string },
    ) {
        return this.usersService.updateProfile(userId, body);
    }

    // PATCH /users/me/profile — Обновить профиль (альтернативный путь)
    @Patch('me/profile')
    @ApiOperation({ summary: 'Обновить профиль (альтернативный путь)' })
    async updateProfileAlt(
        @CurrentUser('id') userId: string,
        @Body() body: { name?: string; bio?: string; phone?: string; country?: string; timezone?: string; locale?: string; avatar?: string },
    ) {
        return this.usersService.updateProfile(userId, body);
    }

    // PATCH /users/me/settings — Обновить настройки
    @Patch('me/settings')
    @ApiOperation({ summary: 'Обновить настройки' })
    async updateSettings(
        @CurrentUser('id') userId: string,
        @Body() body: Record<string, unknown>,
    ) {
        return this.usersService.updateSettings(userId, body);
    }

    // POST /users/me/avatar — Загрузить аватар
    @Post('me/avatar')
    @ApiOperation({ summary: 'Загрузить аватар' })
    async uploadAvatar(
        @CurrentUser('id') userId: string,
        @Body() body: { avatarUrl?: string },
    ) {
        // Принимаем URL аватара (base64 или ссылка)
        const avatarUrl = body.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
        return this.usersService.uploadAvatar(userId, avatarUrl);
    }

    // DELETE /users/me/avatar — Удалить аватар
    @Delete('me/avatar')
    @ApiOperation({ summary: 'Удалить аватар' })
    async deleteAvatar(@CurrentUser('id') userId: string) {
        return this.usersService.deleteAvatar(userId);
    }

    // GET /users/me/statistics — Статистика
    @Get('me/statistics')
    @ApiOperation({ summary: 'Статистика пользователя' })
    async getStatistics(@CurrentUser('id') userId: string) {
        return this.usersService.getStatistics(userId);
    }

    // GET /users/me/achievements — Достижения
    @Get('me/achievements')
    @ApiOperation({ summary: 'Достижения пользователя' })
    async getAchievements(@CurrentUser('id') userId: string) {
        return this.usersService.getAchievements(userId);
    }

    // GET /users/me/leaderboard — Лидерборд
    @Get('me/leaderboard')
    @ApiOperation({ summary: 'Позиция в лидерборде' })
    async getLeaderboardPosition(@CurrentUser('id') userId: string) {
        return this.usersService.getLeaderboardPosition(userId);
    }

    // GET /users/me/export — Экспорт данных
    @Get('me/export')
    @ApiOperation({ summary: 'Экспорт данных пользователя' })
    async exportData(@CurrentUser('id') userId: string) {
        return this.usersService.exportData(userId);
    }

    // DELETE /users/me — Удалить аккаунт
    @Delete('me')
    @ApiOperation({ summary: 'Удалить аккаунт' })
    async deleteAccount(@CurrentUser('id') userId: string) {
        return this.usersService.deleteAccount(userId);
    }

    // GET /users/:id — Профиль по ID (только админ)
    @Get(':id')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Получить пользователя по ID (Admin)' })
    async getUserById(@Param('id') id: string) {
        return this.usersService.findById(id);
    }
}
