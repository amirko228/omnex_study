// ============================================================================
// СТАНДАРТНЫЙ ФОРМАТ ОТВЕТА API
// Все контроллеры возвращают данные в этом формате
// Совместимо с frontend ApiResponse<T>
// ============================================================================

export class ApiResponseDto<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };

    static success<T>(data: T, message?: string): ApiResponseDto<T> {
        const response = new ApiResponseDto<T>();
        response.success = true;
        response.data = data;
        response.message = message;
        return response;
    }

    static error(code: string, message: string, details?: unknown): ApiResponseDto<null> {
        const response = new ApiResponseDto<null>();
        response.success = false;
        response.error = { code, message, details };
        return response;
    }
}

// Пагинированный ответ
export class PaginatedResponseDto<T> {
    success: boolean;
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;

    static create<T>(data: T[], total: number, page: number, limit: number): PaginatedResponseDto<T> {
        const response = new PaginatedResponseDto<T>();
        response.success = true;
        response.data = data;
        response.total = total;
        response.page = page;
        response.limit = limit;
        response.totalPages = Math.ceil(total / limit);
        return response;
    }
}
