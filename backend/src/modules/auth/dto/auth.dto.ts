// ============================================================================
// AUTH DTOs — Объекты валидации для аутентификации
// class-validator автоматически проверяет входящие данные
// ============================================================================

import { IsEmail, IsString, MinLength, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==========================================
// Регистрация
// ==========================================
export class RegisterDto {
    @ApiProperty({ example: 'user@gmail.com' })
    @IsEmail({}, { message: 'Введите корректный email адрес' })
    email: string;

    @ApiProperty({ example: 'StrongPass123!' })
    @IsString()
    @MinLength(8, { message: 'Пароль минимум 8 символов' })
    password: string;

    @ApiProperty({ example: 'Иван Иванов' })
    @IsString()
    @IsNotEmpty({ message: 'Имя обязательно' })
    name: string;

    @ApiPropertyOptional({ example: 'ru' })
    @IsOptional()
    @IsString()
    locale?: string;
}


// ==========================================
// Логин
// ==========================================
export class LoginDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail({}, { message: 'Некорректный email' })
    email: string;

    @ApiProperty({ example: 'StrongPass123!' })
    @IsString()
    @IsNotEmpty({ message: 'Пароль обязателен' })
    password: string;
}

// ==========================================
// Refresh Token
// ==========================================
export class RefreshTokenDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}

// ==========================================
// Сброс пароля — запрос
// ==========================================
export class RequestPasswordResetDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    email: string;
}

// ==========================================
// Сброс пароля — подтверждение
// ==========================================
export class ConfirmPasswordResetDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: '123456' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty()
    @IsString()
    @MinLength(8)
    newPassword: string;
}

// ==========================================
// Верификация email
// ==========================================
export class VerifyEmailDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    token: string;
}

// ==========================================
// Смена пароля
// ==========================================
export class ChangePasswordDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    currentPassword: string;

    @ApiProperty()
    @IsString()
    @MinLength(8)
    newPassword: string;
}

// ==========================================
// 2FA
// ==========================================
export class TwoFactorDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    code: string;
}

export class DisableTwoFactorDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    password: string;
}

// ==========================================
// OAuth callback
// ==========================================
export class OAuthCallbackDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    state?: string;
}

// ==========================================
// Ответы (для Swagger)
// ==========================================
export class AuthResponseDto {
    user: {
        id: string;
        email: string;
        name: string;
        avatar: string | null;
        role: string;
        locale: string;
        subscriptionPlan: string;
    };
    token: string;
    refreshToken: string;
}

export class TokensResponseDto {
    token: string;
    refreshToken: string;
}
