// ============================================================================
// JWT STRATEGY — Проверка access token из заголовка Authorization
// При каждом запросе с Bearer token эта стратегия извлекает userId
// и прикрепляет user к request (доступен через @CurrentUser())
// ============================================================================

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/prisma/prisma.service';

// Payload внутри JWT токена
export interface JwtPayload {
    sub: string;   // userId
    email: string;
    role: string;
    jti?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        configService: ConfigService,
        private prisma: PrismaService,
    ) {
        super({
            // Извлекаем токен из заголовка: Authorization: Bearer <token>
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET', 'default-secret'),
        });
    }

    // Вызывается после успешной проверки JWT
    // Возвращаемый объект попадает в request.user
    async validate(payload: JwtPayload) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                role: true,
                locale: true,
                subscriptionPlan: true,
                emailVerified: true,
                deletedAt: true,
            },
        });

        if (!user || user.deletedAt) {
            throw new UnauthorizedException('Пользователь не найден или аккаунт удалён');
        }

        return user;
    }
}
