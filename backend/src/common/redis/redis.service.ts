// ============================================================================
// REDIS SERVICE - Кеширование, сессии, rate limiting
// ============================================================================

import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly client: Redis;

    constructor(private configService: ConfigService) {
        this.client = new Redis({
            host: this.configService.get('REDIS_HOST', 'localhost'),
            port: this.configService.get<number>('REDIS_PORT', 6379),
            password: this.configService.get('REDIS_PASSWORD', ''),
            retryStrategy: (times: number) => {
                // Повторная попытка подключения через 2 секунды
                return Math.min(times * 2000, 10000);
            },
        });

        this.client.on('connect', () => {
            console.log('✅ Redis подключён');
        });

        this.client.on('error', (err: Error) => {
            console.error('❌ Redis ошибка:', err.message);
        });
    }

    // Получить значение по ключу
    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    // Установить значение с TTL (время жизни в секундах)
    async set(key: string, value: string, ttl?: number): Promise<void> {
        if (ttl) {
            await this.client.setex(key, ttl, value);
        } else {
            await this.client.set(key, value);
        }
    }

    // Удалить ключ
    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    // Удалить по паттерну (например, 'courses:*')
    async delByPattern(pattern: string): Promise<void> {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
            await this.client.del(...keys);
        }
    }

    // Проверить существование ключа
    async exists(key: string): Promise<boolean> {
        const result = await this.client.exists(key);
        return result === 1;
    }

    // Инкремент (для счётчиков rate limiting)
    async incr(key: string): Promise<number> {
        return this.client.incr(key);
    }

    // Установить TTL для ключа
    async expire(key: string, ttl: number): Promise<void> {
        await this.client.expire(key, ttl);
    }

    // Получить JSON из кеша
    async getJSON<T>(key: string): Promise<T | null> {
        const data = await this.get(key);
        if (!data) return null;
        try {
            return JSON.parse(data) as T;
        } catch {
            return null;
        }
    }

    // Сохранить JSON в кеш
    async setJSON(key: string, value: unknown, ttl?: number): Promise<void> {
        await this.set(key, JSON.stringify(value), ttl);
    }

    // Отключение при завершении
    async onModuleDestroy() {
        await this.client.quit();
        console.log('❌ Redis отключён');
    }
}
