// ============================================================================
// CUSTOM DECORATORS
// Декораторы для удобного доступа к данным в контроллерах
// ============================================================================

import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

// ==========================================
// @CurrentUser() — получить текущего пользователя из JWT
// ==========================================
export const CurrentUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        // Если указано поле, вернуть только его
        if (data) {
            return user?.[data];
        }

        return user;
    },
);

// ==========================================
// @Roles('admin') — ограничение по ролям
// ==========================================
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// ==========================================
// @Public() — пометить endpoint как публичный (без JWT)
// ==========================================
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
