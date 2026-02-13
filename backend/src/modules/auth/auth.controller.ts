// ============================================================================
// AUTH CONTROLLER — REST API эндпоинты аутентификации
// Все пути совместимы с frontend (src/lib/api/auth.ts)
// ============================================================================

import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
    RegisterDto,
    LoginDto,
    RefreshTokenDto,
    RequestPasswordResetDto,
    ConfirmPasswordResetDto,
    VerifyEmailDto,
    ChangePasswordDto,
    TwoFactorDto,
    OAuthCallbackDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser, Public } from '../../common/decorators';

@ApiTags('auth')
@Controller('auth')

export class AuthController {
    constructor(private authService: AuthService) { }

    // ==========================================
    // POST /auth/register — Регистрация
    // ==========================================
    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Регистрация нового пользователя' })
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    // ==========================================
    // POST /auth/login — Вход
    // ==========================================
    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Вход в систему' })
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    // ==========================================
    // POST /auth/logout — Выход
    // ==========================================
    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Выход из системы' })
    async logout(@CurrentUser('id') userId: string) {
        return this.authService.logout(userId);
    }

    // ==========================================
    // GET /auth/me — Текущий пользователь
    // ==========================================
    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Получить данные текущего пользователя' })
    async getMe(@CurrentUser('id') userId: string) {
        return this.authService.getMe(userId);
    }

    // ==========================================
    // POST /auth/refresh — Обновление токена
    // ==========================================
    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Обновить access token' })
    async refresh(@Body() dto: RefreshTokenDto) {
        return this.authService.refreshToken(dto.refreshToken);
    }

    // ==========================================
    // POST /auth/password-reset/request — Запрос сброса
    // ==========================================
    @Public()
    @Post('password-reset/request')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Запросить сброс пароля' })
    async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
        return this.authService.requestPasswordReset(dto.email);
    }

    // ==========================================
    // POST /auth/password-reset/confirm — Подтверждение
    // ==========================================
    @Public()
    @Post('password-reset/confirm')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Подтвердить сброс пароля' })
    async confirmPasswordReset(@Body() dto: ConfirmPasswordResetDto) {
        return this.authService.confirmPasswordReset(dto.email, dto.code, dto.newPassword);
    }

    // ==========================================
    // POST /auth/verify-email — Верификация email
    // ==========================================
    @Public()
    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Подтвердить email' })
    async verifyEmail(@Body() dto: VerifyEmailDto) {
        return this.authService.verifyEmail(dto.token);
    }

    // ==========================================
    // POST /auth/verify-email/resend — Повторная отправка
    // ==========================================
    // ==========================================
    // POST /auth/verify-email/code — Подтвердить email по 6-значному коду
    // ==========================================
    @Post('verify-email/code')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Подтвердить email по 6-значному коду' })
    async verifyEmailByCode(
        @Body() body: { userId: string; code: string },
    ) {
        return this.authService.verifyEmailByCode(body.userId, body.code);
    }

    // ==========================================
    // POST /auth/verify-email/resend — Повторная отправка
    // ==========================================
    @UseGuards(JwtAuthGuard)
    @Post('verify-email/resend')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Повторно отправить код верификации' })
    async resendVerifyEmail(@CurrentUser('id') userId: string) {
        return this.authService.resendVerifyEmail(userId);
    }

    // ==========================================
    // POST /auth/change-password — Смена пароля
    // ==========================================
    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Сменить пароль' })
    async changePassword(
        @CurrentUser('id') userId: string,
        @Body() dto: ChangePasswordDto,
    ) {
        return this.authService.changePassword(userId, dto.currentPassword, dto.newPassword);
    }

    // ==========================================
    // POST /auth/2fa/enable — Включить 2FA
    // ==========================================
    @UseGuards(JwtAuthGuard)
    @Post('2fa/enable')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Включить двухфакторную аутентификацию' })
    async enable2FA(@CurrentUser('id') userId: string) {
        return this.authService.enable2FA(userId);
    }

    // ==========================================
    // POST /auth/2fa/verify — Подтвердить 2FA
    // ==========================================
    @UseGuards(JwtAuthGuard)
    @Post('2fa/verify')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Подтвердить код 2FA' })
    async verify2FA(
        @CurrentUser('id') userId: string,
        @Body() dto: TwoFactorDto,
    ) {
        return this.authService.verify2FA(userId, dto.code);
    }

    // ==========================================
    // POST /auth/2fa/disable — Отключить 2FA
    // ==========================================
    @UseGuards(JwtAuthGuard)
    @Post('2fa/disable')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Отключить 2FA' })
    async disable2FA(
        @CurrentUser('id') userId: string,
        @Body() dto: { password: string },
    ) {
        return this.authService.disable2FA(userId, dto.password);
    }

    // ==========================================
    // GET /auth/oauth/:provider — Перенаправление на OAuth
    // ==========================================
    @Public()
    @Get('oauth/:provider')
    @ApiOperation({ summary: 'Получить URL авторизации OAuth' })
    async getOAuthUrl(
        @Param('provider') provider: string,
        @Query('redirectUri') redirectUri: string,
    ) {
        return this.authService.getOAuthUrl(provider, redirectUri || 'http://localhost:3000/auth/callback');
    }

    // ==========================================
    // POST /auth/oauth/:provider/callback — OAuth callback
    // ==========================================
    @Public()
    @Post('oauth/:provider/callback')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Обработка OAuth callback' })
    async oauthCallback(
        @Param('provider') provider: string,
        @Body() dto: OAuthCallbackDto,
    ) {
        return this.authService.oauthCallback(provider, dto.code);
    }
}

