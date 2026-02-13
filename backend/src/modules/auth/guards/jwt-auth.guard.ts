// ============================================================================
// JWT AUTH GUARD — Защищает endpoints, требующие аутентификации
// Поддерживает декоратор @Public() для открытых endpoint'ов
// ============================================================================

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../common/decorators';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        // Проверяем, помечен ли endpoint как @Public()
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // Публичные endpoints доступны без токена
        if (isPublic) {
            return true;
        }

        // Для остальных — проверяем JWT
        return super.canActivate(context);
    }
}
