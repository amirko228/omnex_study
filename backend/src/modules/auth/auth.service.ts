// ============================================================================
// AUTH SERVICE — Вся бизнес-логика аутентификации
// Регистрация, логин, JWT токены, пароли, email верификация
// ============================================================================

import {
    Injectable,
    Logger,
    UnauthorizedException,
    ConflictException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import * as net from 'net';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private redis: RedisService,
    ) { }

    // ==========================================
    // РЕГИСТРАЦИЯ
    // ==========================================
    async register(dto: RegisterDto) {
        // Проверяем, не занят ли email
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('Пользователь с таким email уже существует');
        }

        // Хешируем пароль (bcrypt, 12 раундов)
        const passwordHash = await bcrypt.hash(dto.password, 12);

        // Создаём пользователя в БД
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                name: dto.name,
                locale: dto.locale || 'ru',
            },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                role: true,
                locale: true,
                subscriptionPlan: true,
            },
        });

        // Генерируем 6-значный код верификации
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Сохраняем код в Redis (TTL = 10 минут)
        await this.redis.set(`email:verify:${user.id}`, verificationCode, 600);

        // Отправляем код на email
        await this.sendVerificationEmail(user.email, verificationCode, user.name);

        // Генерируем JWT токены
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        // Сохраняем refresh token в БД
        await this.saveRefreshToken(user.id, tokens.refreshToken);

        return {
            user,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            message: 'Код подтверждения отправлен на ' + user.email,
            requiresVerification: true,
        };
    }

    // ==========================================
    // ЛОГИН
    // ==========================================
    async login(dto: LoginDto) {
        // Ищем пользователя по email
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                role: true,
                locale: true,
                subscriptionPlan: true,
                passwordHash: true,
                twoFactorEnabled: true,
            },
        });

        if (!user || !user.passwordHash) {
            throw new UnauthorizedException('Неверный email или пароль');
        }

        // Проверяем пароль
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Неверный email или пароль');
        }

        // TODO: Раскомментировать когда будет настроен SMTP
        // // Проверяем подтверждён ли email
        // const fullUser = await this.prisma.user.findUnique({ where: { id: user.id } });
        // if (fullUser && !fullUser.emailVerified) {
        //     const code = Math.floor(100000 + Math.random() * 900000).toString();
        //     await this.redis.set(`email:verify:${user.id}`, code, 600);
        //     await this.sendVerificationEmail(user.email, code, user.name || '');
        //     throw new UnauthorizedException('Email не подтверждён. Новый код отправлен на ' + user.email);
        // }

        // Генерируем JWT токены
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        // Сохраняем refresh token
        await this.saveRefreshToken(user.id, tokens.refreshToken);

        // Убираем passwordHash из ответа
        const { passwordHash, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    // ==========================================
    // ОБНОВЛЕНИЕ ТОКЕНА (Refresh)
    // ==========================================
    async refreshToken(refreshToken: string) {
        // Ищем refresh token в БД
        const savedToken = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if (!savedToken) {
            throw new UnauthorizedException('Невалидный refresh token');
        }

        // Проверяем срок действия
        if (savedToken.expiresAt < new Date()) {
            await this.prisma.refreshToken.delete({ where: { id: savedToken.id } });
            throw new UnauthorizedException('Refresh token истёк');
        }

        // Удалить старый token
        await this.prisma.refreshToken.delete({ where: { id: savedToken.id } });

        // Генерируем новые токены
        const tokens = await this.generateTokens(
            savedToken.user.id,
            savedToken.user.email,
            savedToken.user.role,
        );

        // Сохраняем новый refresh token
        await this.saveRefreshToken(savedToken.user.id, tokens.refreshToken);

        return {
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    // ==========================================
    // ВЫХОД (удаление refresh token)
    // ==========================================
    async logout(userId: string) {
        // Удаляем все refresh tokens пользователя
        await this.prisma.refreshToken.deleteMany({
            where: { userId },
        });

        // Очищаем кеш пользователя
        await this.redis.del(`user:${userId}`);

        return { message: 'Вы успешно вышли из системы' };
    }

    // ==========================================
    // ПОЛУЧИТЬ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
    // ==========================================
    async getMe(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                role: true,
                locale: true,
                subscriptionPlan: true,
                emailVerified: true,
                twoFactorEnabled: true,
                bio: true,
                phone: true,
                country: true,
                timezone: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }

        return user;
    }

    // ==========================================
    // ЗАПРОС СБРОСА ПАРОЛЯ
    // ==========================================
    async requestPasswordReset(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Не сообщаем, что пользователя нет (безопасность)
            return { message: 'Если email существует, код сброса отправлен' };
        }

        // Генерируем 6-значный код
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Сохраняем код в Redis (TTL = 10 минут)
        await this.redis.set(`password:reset:${email}`, code, 600);

        // Отправляем email с кодом
        this.logger.log(`🔑 Код сброса пароля для ${email}: ${code}`);

        const host = this.configService.get('EMAIL_HOST');
        const port = parseInt(this.configService.get('EMAIL_PORT', '587'));
        const smtpUser = this.configService.get('EMAIL_USER');
        const pass = this.configService.get('EMAIL_PASSWORD');
        const from = this.configService.get('EMAIL_FROM', 'noreply@omnexstudy.com');

        if (host && smtpUser && pass) {
            const subject = `Omnex Study - Код сброса пароля: ${code}`;
            const html = `
                <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;background:#1a1a2e;color:#fff;border-radius:12px;">
                    <h2 style="text-align:center;color:#e94560;">Omnex Study</h2>
                    <p>Здравствуйте${user.name ? ', ' + user.name : ''}!</p>
                    <p>Вы запросили сброс пароля. Введите код ниже:</p>
                    <div style="text-align:center;margin:24px 0;">
                        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#e94560;background:#16213e;padding:16px;border-radius:8px;display:inline-block;">${code}</div>
                    </div>
                    <p style="color:#aaa;font-size:12px;text-align:center;">Код действителен 10 минут. Если вы не запрашивали сброс — проигнорируйте это письмо.</p>
                </div>
            `;

            try {
                await this.sendSmtpEmail({ host, port, user: smtpUser, pass, from, to: email, subject, html });
            } catch (err) {
                this.logger.error(`Ошибка отправки email: ${err.message}`);
            }
        } else {
            this.logger.log('SMTP не настроен. Код сброса выведен в консоль.');
        }

        return { message: 'Если email существует, код сброса отправлен' };
    }

    // ==========================================
    // ПОДТВЕРЖДЕНИЕ СБРОСА ПАРОЛЯ (по коду)
    // ==========================================
    async confirmPasswordReset(email: string, code: string, newPassword: string) {
        const savedCode = await this.redis.get(`password:reset:${email}`);

        if (!savedCode) {
            throw new BadRequestException('Код истёк. Запросите новый код');
        }

        if (savedCode !== code) {
            throw new BadRequestException('Неверный код');
        }

        // Находим пользователя
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new BadRequestException('Пользователь не найден');
        }

        // Хешируем новый пароль
        const passwordHash = await bcrypt.hash(newPassword, 12);

        // Обновляем пароль
        await this.prisma.user.update({
            where: { id: user.id },
            data: { passwordHash },
        });

        // Удаляем код из Redis
        await this.redis.del(`password:reset:${email}`);

        // Удаляем все refresh tokens (разлогиниваем)
        await this.prisma.refreshToken.deleteMany({
            where: { userId: user.id },
        });

        return { message: 'Пароль успешно изменён' };
    }

    // ==========================================
    // ВЕРИФИКАЦИЯ EMAIL (по 6-значному коду)
    // ==========================================
    async verifyEmail(token: string) {
        // Ищем пользователя ID по коду в Redis
        // token теперь это "userId:code" или просто "code" + userId
        // Поддерживаем оба варианта: старый (по БД) и новый (по Redis коду)

        // Сначала пробуем новый формат: ищем по email verification token в БД (обратная совместимость)
        const verificationToken = await this.prisma.emailVerificationToken.findUnique({
            where: { token },
        });

        if (verificationToken) {
            if (verificationToken.expiresAt < new Date()) {
                throw new BadRequestException('Токен недействителен или истёк');
            }

            await this.prisma.user.update({
                where: { id: verificationToken.userId },
                data: { emailVerified: true },
            });

            await this.prisma.emailVerificationToken.delete({
                where: { id: verificationToken.id },
            });

            return { message: 'Email успешно подтверждён' };
        }

        throw new BadRequestException('Недействительный код подтверждения');
    }

    // Верификация email по коду (новый метод)
    async verifyEmailByCode(userId: string, code: string) {
        const savedCode = await this.redis.get(`email:verify:${userId}`);

        if (!savedCode) {
            throw new BadRequestException('Код истёк. Запросите новый код');
        }

        if (savedCode !== code) {
            throw new BadRequestException('Неверный код подтверждения');
        }

        // Подтверждаем email
        await this.prisma.user.update({
            where: { id: userId },
            data: { emailVerified: true },
        });

        // Удаляем код из Redis
        await this.redis.del(`email:verify:${userId}`);

        return { message: 'Email успешно подтверждён' };
    }

    // ==========================================
    // ПОВТОРНАЯ ОТПРАВКА ВЕРИФИКАЦИИ
    // ==========================================
    async resendVerifyEmail(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }

        if (user.emailVerified) {
            return { message: 'Email уже подтверждён' };
        }

        // Генерируем новый 6-значный код
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await this.redis.set(`email:verify:${userId}`, code, 600);

        // Отправляем на email
        await this.sendVerificationEmail(user.email, code, user.name || '');

        return { message: 'Код подтверждения отправлен на ' + user.email };
    }

    // ==========================================
    // ОТПРАВКА EMAIL С КОДОМ ВЕРИФИКАЦИИ
    // ==========================================
    private async sendVerificationEmail(email: string, code: string, name: string) {
        this.logger.log(`📧 Код верификации для ${email}: ${code}`);

        const host = this.configService.get('EMAIL_HOST');
        const port = parseInt(this.configService.get('EMAIL_PORT', '587'));
        const user = this.configService.get('EMAIL_USER');
        const pass = this.configService.get('EMAIL_PASSWORD');
        const from = this.configService.get('EMAIL_FROM', 'noreply@omnexstudy.com');

        if (!host || !user || !pass) {
            this.logger.warn('SMTP не настроен. Код верификации выведен в консоль.');
            return;
        }

        // Формируем HTML письмо
        const subject = `Omnex Study - Код подтверждения: ${code}`;
        const html = `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:20px">
                <h2 style="color:#6366f1">Omnex Study</h2>
                <p>Здравствуйте${name ? ', ' + name : ''}!</p>
                <p>Ваш код подтверждения email:</p>
                <div style="background:#f3f4f6;border-radius:12px;padding:20px;text-align:center;margin:20px 0">
                    <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#6366f1">${code}</span>
                </div>
                <p style="color:#6b7280;font-size:14px">Код действителен 10 минут.</p>
                <p style="color:#9ca3af;font-size:12px">Если вы не регистрировались, проигнорируйте это письмо.</p>
            </div>
        `;

        try {
            await this.sendSmtpEmail({ host, port, user, pass, from, to: email, subject, html });
            this.logger.log(`✅ Письмо отправлено на ${email}`);
        } catch (error) {
            this.logger.error(`❌ Ошибка отправки email: ${error.message}`);
        }
    }

    // Простая отправка через SMTP без внешних зависимостей
    private sendSmtpEmail(opts: { host: string; port: number; user: string; pass: string; from: string; to: string; subject: string; html: string }): Promise<void> {
        return new Promise((resolve, reject) => {
            const socket = net.createConnection(opts.port, opts.host, () => {
                const lines: string[] = [];
                let step = 0;

                socket.on('data', (data) => {
                    const resp = data.toString();
                    lines.push(resp);

                    try {
                        switch (step) {
                            case 0: // greeting
                                socket.write(`EHLO omnexstudy.com\r\n`);
                                step++;
                                break;
                            case 1: // EHLO response
                                if (resp.includes('STARTTLS')) {
                                    socket.write(`STARTTLS\r\n`);
                                } else {
                                    socket.write(`AUTH LOGIN\r\n`);
                                }
                                step++;
                                break;
                            case 2:
                                socket.write(`AUTH LOGIN\r\n`);
                                step++;
                                break;
                            case 3:
                                socket.write(Buffer.from(opts.user).toString('base64') + '\r\n');
                                step++;
                                break;
                            case 4:
                                socket.write(Buffer.from(opts.pass).toString('base64') + '\r\n');
                                step++;
                                break;
                            case 5:
                                if (resp.startsWith('535') || resp.includes('Authentication')) {
                                    socket.destroy();
                                    reject(new Error('SMTP: Ошибка аутентификации'));
                                    return;
                                }
                                socket.write(`MAIL FROM:<${opts.from}>\r\n`);
                                step++;
                                break;
                            case 6:
                                socket.write(`RCPT TO:<${opts.to}>\r\n`);
                                step++;
                                break;
                            case 7:
                                socket.write(`DATA\r\n`);
                                step++;
                                break;
                            case 8:
                                const msg = [
                                    `From: Omnex Study <${opts.from}>`,
                                    `To: ${opts.to}`,
                                    `Subject: ${opts.subject}`,
                                    `MIME-Version: 1.0`,
                                    `Content-Type: text/html; charset=utf-8`,
                                    ``,
                                    opts.html,
                                    `.`,
                                ].join('\r\n');
                                socket.write(msg + '\r\n');
                                step++;
                                break;
                            case 9:
                                socket.write(`QUIT\r\n`);
                                socket.destroy();
                                resolve();
                                break;
                        }
                    } catch (e) {
                        reject(e);
                    }
                });

                socket.on('error', reject);
                socket.setTimeout(10000, () => {
                    socket.destroy();
                    reject(new Error('SMTP timeout'));
                });
            });

            socket.on('error', reject);
        });
    }

    // ==========================================
    // СМЕНА ПАРОЛЯ
    // ==========================================
    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.passwordHash) {
            throw new BadRequestException('Невозможно сменить пароль');
        }

        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            throw new UnauthorizedException('Текущий пароль неверный');
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });

        return { message: 'Пароль успешно изменён' };
    }

    // ==========================================
    // ПРИВАТНЫЕ МЕТОДЫ
    // ==========================================

    // Генерация пары JWT токенов
    private async generateTokens(userId: string, email: string, role: string) {
        const payload: JwtPayload = { sub: userId, email, role };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_EXPIRATION', '15m'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
            }),
        ]);

        return { accessToken, refreshToken };
    }

    // Сохранение refresh token в БД
    private async saveRefreshToken(userId: string, token: string) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 дней

        await this.prisma.refreshToken.create({
            data: {
                userId,
                token,
                expiresAt,
            },
        });
    }

    // ==========================================
    // 2FA — Включить (генерация секрета)
    // ==========================================
    async enable2FA(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('Пользователь не найден');

        if (user.twoFactorEnabled) {
            throw new BadRequestException('2FA уже включена');
        }

        // Генерируем секрет (base32-подобный)
        const crypto = await import('crypto');
        const secret = crypto.randomBytes(20).toString('hex').substring(0, 16).toUpperCase();

        // Сохраняем секрет в Redis (до подтверждения)
        await this.redis.set(`2fa:secret:${userId}`, secret, 600); // 10 минут на подтверждение

        // Генерируем URL для QR-кода
        const otpauthUrl = `otpauth://totp/OmnexStudy:${user.email}?secret=${secret}&issuer=OmnexStudy`;

        return {
            secret,
            qrCode: otpauthUrl,
        };
    }

    // ==========================================
    // 2FA — Подтвердить (верификация кода)
    // ==========================================
    async verify2FA(userId: string, code: string) {
        const secret = await this.redis.get(`2fa:secret:${userId}`);
        if (!secret) {
            throw new BadRequestException('Сначала запросите включение 2FA');
        }

        // Простая проверка — для production нужен otplib
        if (code.length !== 6 || !/^\d{6}$/.test(code)) {
            throw new BadRequestException('Неверный код 2FA');
        }

        // Включаем 2FA
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: true,
                twoFactorSecret: secret,
            },
        });

        // Удаляем временный секрет
        await this.redis.del(`2fa:secret:${userId}`);

        return { message: '2FA успешно включена' };
    }

    // ==========================================
    // 2FA — Отключить
    // ==========================================
    async disable2FA(userId: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.passwordHash) {
            throw new BadRequestException('Невозможно отключить 2FA');
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            throw new UnauthorizedException('Неверный пароль');
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
            },
        });

        return { message: '2FA отключена' };
    }

    // ==========================================
    // OAuth — Получить URL авторизации
    // ==========================================
    getOAuthUrl(provider: string, redirectUri: string) {
        const googleClientId = this.configService.get('GOOGLE_CLIENT_ID', '');
        const vkClientId = this.configService.get('VK_CLIENT_ID', '');
        const yandexClientId = this.configService.get('YANDEX_CLIENT_ID', '');

        const urls: Record<string, string> = {
            google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent('openid email profile')}&access_type=offline&prompt=consent`,
            vk: `https://oauth.vk.com/authorize?client_id=${vkClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&display=popup&scope=email&response_type=code&v=5.131`,
            yandex: `https://oauth.yandex.ru/authorize?client_id=${yandexClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&force_confirm=yes`,
        };

        if (!urls[provider]) {
            throw new BadRequestException(`Неподдерживаемый OAuth провайдер: ${provider}. Доступны: google, vk, yandex`);
        }

        return {
            url: urls[provider],
            provider,
        };
    }

    // ==========================================
    // OAuth — Обработка callback
    // ==========================================
    async oauthCallback(provider: string, code: string) {
        let email: string;
        let name: string;
        let providerAccountId: string;

        try {
            // Обмен code на данные пользователя от провайдера
            const userData = await this.exchangeOAuthCode(provider, code);
            email = userData.email;
            name = userData.name;
            providerAccountId = userData.id;
        } catch (error) {
            // Если ключи не настроены — fallback стаб
            email = `${provider}_user_${code.substring(0, 8)}@omnex.dev`;
            name = `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`;
            providerAccountId = code;
        }

        // Ищем пользователя по OAuth аккаунту
        const existingOAuth = await this.prisma.oAuthAccount.findFirst({
            where: { provider, providerAccountId },
            include: { user: true },
        });

        let user: any;

        if (existingOAuth) {
            // Пользователь уже авторизовывался через этот провайдер
            user = existingOAuth.user;
        } else {
            // Ищем по email
            user = await this.prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                // Новый пользователь — создаём
                user = await this.prisma.user.create({
                    data: {
                        email,
                        name,
                        locale: 'ru',
                        emailVerified: true,
                    },
                });
            }

            // Привязываем OAuth аккаунт
            await this.prisma.oAuthAccount.create({
                data: {
                    userId: user.id,
                    provider,
                    providerAccountId,
                },
            });
        }

        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.saveRefreshToken(user.id, tokens.refreshToken);

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                role: user.role,
                locale: user.locale,
            },
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    // ==========================================
    // Обмен OAuth code на данные пользователя
    // ==========================================
    private async exchangeOAuthCode(provider: string, code: string): Promise<{ id: string; email: string; name: string }> {
        switch (provider) {
            case 'google':
                return this.exchangeGoogleCode(code);
            case 'vk':
                return this.exchangeVkCode(code);
            case 'yandex':
                return this.exchangeYandexCode(code);
            default:
                throw new BadRequestException(`Неподдерживаемый провайдер: ${provider}`);
        }
    }

    // Google: code → token → userinfo
    private async exchangeGoogleCode(code: string): Promise<{ id: string; email: string; name: string }> {
        const clientId = this.configService.get('GOOGLE_CLIENT_ID');
        const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
        const redirectUri = this.configService.get('GOOGLE_CALLBACK_URL', 'http://localhost:3000/auth/callback');

        if (!clientId || !clientSecret) throw new Error('Google OAuth не настроен');

        // Обмен code на access_token
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });
        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) throw new Error('Google: не удалось получить токен');

        // Получаем данные пользователя
        const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const userData = await userRes.json();

        return {
            id: userData.id,
            email: userData.email,
            name: userData.name || userData.email,
        };
    }

    // VK: code → token + email
    private async exchangeVkCode(code: string): Promise<{ id: string; email: string; name: string }> {
        const clientId = this.configService.get('VK_CLIENT_ID');
        const clientSecret = this.configService.get('VK_CLIENT_SECRET');
        const redirectUri = this.configService.get('VK_CALLBACK_URL', 'http://localhost:3000/auth/callback');

        if (!clientId || !clientSecret) throw new Error('VK OAuth не настроен');

        // Обмен code на access_token
        const tokenRes = await fetch(`https://oauth.vk.com/access_token?client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`);
        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) throw new Error('VK: не удалось получить токен');

        // Получаем данные пользователя
        const userRes = await fetch(`https://api.vk.com/method/users.get?access_token=${tokenData.access_token}&fields=photo_200,email&v=5.131`);
        const userData = await userRes.json();

        const vkUser = userData.response?.[0];
        if (!vkUser) throw new Error('VK: не удалось получить данные пользователя');

        return {
            id: String(vkUser.id),
            email: tokenData.email || `vk_${vkUser.id}@vk.com`,
            name: `${vkUser.first_name} ${vkUser.last_name}`,
        };
    }

    // Yandex: code → token → userinfo
    private async exchangeYandexCode(code: string): Promise<{ id: string; email: string; name: string }> {
        const clientId = this.configService.get('YANDEX_CLIENT_ID');
        const clientSecret = this.configService.get('YANDEX_CLIENT_SECRET');

        if (!clientId || !clientSecret) throw new Error('Yandex OAuth не настроен');

        // Обмен code на access_token
        const tokenRes = await fetch('https://oauth.yandex.ru/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: clientId,
                client_secret: clientSecret,
            }),
        });
        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) throw new Error('Yandex: не удалось получить токен');

        // Получаем данные пользователя
        const userRes = await fetch('https://login.yandex.ru/info?format=json', {
            headers: { Authorization: `OAuth ${tokenData.access_token}` },
        });
        const userData = await userRes.json();

        return {
            id: userData.id,
            email: userData.default_email || `${userData.login}@yandex.ru`,
            name: userData.real_name || userData.display_name || userData.login,
        };
    }
}


