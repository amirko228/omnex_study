import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * OptionalAuthGuard - позволяет запросам проходить БЕЗ токена,
 * но если токен есть - валидирует его и добавляет user в request
 */
@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        // Если есть user - возвращаем его
        // Если нет user - просто пропускаем (не бросаем ошибку)
        return user || null;
    }
}
