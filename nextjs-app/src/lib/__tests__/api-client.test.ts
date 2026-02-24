/**
 * Unit-тесты для ApiClient
 */

// Мок fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Мок localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Упрощённая реализация ApiClient для тестирования
class ApiClient {
    private baseUrl: string;
    private timeout: number;

    constructor(baseUrl = 'http://localhost:3001/api', timeout = 10000) {
        this.baseUrl = baseUrl;
        this.timeout = timeout;
    }

    private getAuthToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    private buildHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        const token = this.getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
        let url = `${this.baseUrl}${endpoint}`;

        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, String(value));
                }
            });
            url += `?${searchParams.toString()}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: this.buildHeaders(),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async post<T>(endpoint: string, data?: unknown): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: this.buildHeaders(),
            body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }
}

describe('ApiClient', () => {
    let apiClient: ApiClient;

    beforeEach(() => {
        jest.clearAllMocks();
        apiClient = new ApiClient();
    });

    describe('GET запросы', () => {
        it('должен выполнять GET запрос с правильным URL', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ data: 'test' }),
            });

            await apiClient.get('/users');

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3001/api/users',
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                    }),
                })
            );
        });

        it('должен добавлять query параметры к URL', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ data: [] }),
            });

            await apiClient.get('/courses', { page: 1, limit: 10 });

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3001/api/courses?page=1&limit=10',
                expect.any(Object)
            );
        });

        it('должен добавлять Authorization заголовок при наличии токена', async () => {
            localStorageMock.getItem.mockReturnValue('test-token');
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ user: {} }),
            });

            await apiClient.get('/users/me');

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer test-token',
                    }),
                })
            );
        });

        it('должен выбрасывать ошибку при неуспешном ответе', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
            });

            await expect(apiClient.get('/not-found')).rejects.toThrow('HTTP error! status: 404');
        });
    });

    describe('POST запросы', () => {
        it('должен выполнять POST запрос с телом', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ success: true }),
            });

            const data = { email: 'test@example.com', password: 'password' };
            await apiClient.post('/auth/login', data);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3001/api/auth/login',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(data),
                })
            );
        });

        it('должен выполнять POST без тела', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ success: true }),
            });

            await apiClient.post('/auth/logout');

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3001/api/auth/logout',
                expect.objectContaining({
                    method: 'POST',
                    body: undefined,
                })
            );
        });

        it('должен выбрасывать ошибку при ошибке сервера', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
            });

            await expect(apiClient.post('/error')).rejects.toThrow('HTTP error! status: 500');
        });
    });
});
