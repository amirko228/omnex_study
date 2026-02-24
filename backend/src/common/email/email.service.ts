// ============================================================================
// EMAIL SERVICE — Общий сервис отправки email через SMTP (nodemailer)
// Используется в: NotificationsService, AuthService, SupportController
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter: nodemailer.Transporter | null = null;

    constructor(private configService: ConfigService) {
        this.initTransporter();
    }

    // Инициализация SMTP транспорта
    private initTransporter() {
        const host = this.configService.get('EMAIL_HOST');
        const port = parseInt(this.configService.get('EMAIL_PORT', '587'));
        const user = this.configService.get('EMAIL_USER');
        const pass = this.configService.get('EMAIL_PASSWORD');

        if (!host || !user || !pass) {
            this.logger.warn('⚠️ SMTP не настроен. Письма не будут отправляться.');
            return;
        }

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465, // true для 465, false для остальных (STARTTLS)
            auth: {
                user,
                pass,
            },
        });

        // Проверяем подключение при старте
        this.transporter.verify()
            .then(() => this.logger.log('✅ SMTP подключение успешно'))
            .catch((err: any) => this.logger.error(`❌ SMTP ошибка подключения: ${err.message}`));
    }

    // Проверка настроен ли SMTP
    isConfigured(): boolean {
        return this.transporter !== null;
    }

    // ==========================================
    // Главный метод отправки email
    // ==========================================
    async send(options: {
        to: string;
        subject: string;
        html: string;
    }): Promise<boolean> {
        if (!this.transporter) {
            this.logger.warn('⚠️ SMTP не настроен. Email не отправлен.');
            return false;
        }

        const from = this.configService.get('EMAIL_FROM', 'noreply@omnexstudy.com');

        try {
            await this.transporter.sendMail({
                from: `Omnex Study <${from}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
            });
            this.logger.log(`✅ Email отправлен → ${options.to}`);
            return true;
        } catch (error) {
            this.logger.error(`❌ Ошибка отправки email: ${error.message}`);
            return false;
        }
    }

    // ==========================================
    // Шаблоны email
    // ==========================================

    // Уведомление о курсе
    async sendCourseNotification(to: string, userName: string, courseTitle: string, message: string): Promise<boolean> {
        const html = this.wrapTemplate(`
            <h2 style="color:#6366f1;margin-bottom:16px">📚 ${courseTitle}</h2>
            <p>Здравствуйте${userName ? ', ' + userName : ''}!</p>
            <p>${message}</p>
        `);
        return this.send({ to, subject: `Omnex Study — ${courseTitle}`, html });
    }

    // Напоминание об обучении
    async sendStudyReminder(to: string, userName: string): Promise<boolean> {
        const html = this.wrapTemplate(`
            <h2 style="color:#6366f1;margin-bottom:16px">⏰ Напоминание об обучении</h2>
            <p>Здравствуйте${userName ? ', ' + userName : ''}!</p>
            <p>Вы давно не заходили на платформу. Продолжите обучение, чтобы не потерять прогресс!</p>
            <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/dashboard"
               style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">
                Продолжить обучение →
            </a>
        `);
        return this.send({ to, subject: 'Omnex Study — Продолжите обучение!', html });
    }

    // Приветственное письмо
    async sendWelcome(to: string, userName: string): Promise<boolean> {
        const html = this.wrapTemplate(`
            <h2 style="color:#6366f1;margin-bottom:16px">🎉 Добро пожаловать в Omnex Study!</h2>
            <p>Здравствуйте${userName ? ', ' + userName : ''}!</p>
            <p>Мы рады приветствовать вас на платформе AI-обучения. Вот что вы можете сделать:</p>
            <ul style="color:#374151">
                <li>📖 Генерировать персональные курсы с помощью ИИ</li>
                <li>🤖 Общаться с AI-наставником</li>
                <li>📊 Отслеживать прогресс обучения</li>
            </ul>
            <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/dashboard"
               style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">
                Перейти в кабинет →
            </a>
        `);
        return this.send({ to, subject: 'Добро пожаловать в Omnex Study! 🎉', html });
    }

    // Email поддержки
    async sendSupportEmail(userEmail: string, userName: string, subject: string, message: string): Promise<boolean> {
        const supportEmail = this.configService.get('SUPPORT_EMAIL', 'support@omnexstudy.com');
        const html = this.wrapTemplate(`
            <h2 style="color:#6366f1;margin-bottom:16px">📩 Обращение в поддержку</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
                <tr><td style="padding:8px;color:#6b7280;font-weight:bold">От:</td><td style="padding:8px">${userName} (${userEmail})</td></tr>
                <tr><td style="padding:8px;color:#6b7280;font-weight:bold">Тема:</td><td style="padding:8px">${subject}</td></tr>
            </table>
            <div style="background:#f3f4f6;border-radius:8px;padding:16px;white-space:pre-wrap">${message}</div>
        `);

        // Шлём на support email (или тому же SMTP пользователю)
        const sent = await this.send({ to: supportEmail, subject: `[Support] ${subject} — от ${userName}`, html });

        // Подтверждение пользователю
        if (sent) {
            const confirmHtml = this.wrapTemplate(`
                <h2 style="color:#6366f1;margin-bottom:16px">✅ Обращение получено</h2>
                <p>Здравствуйте${userName ? ', ' + userName : ''}!</p>
                <p>Мы получили ваше обращение и ответим в ближайшее время.</p>
                <p style="color:#6b7280"><strong>Тема:</strong> ${subject}</p>
            `);
            await this.send({ to: userEmail, subject: 'Omnex Study — Обращение получено', html: confirmHtml });
        }

        return sent;
    }

    // ==========================================
    // HTML шаблон-обёртка
    // ==========================================
    private wrapTemplate(content: string): string {
        return `
            <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px">
                <div style="text-align:center;margin-bottom:24px">
                    <h1 style="font-size:24px;color:#6366f1;margin:0">Omnex Study</h1>
                </div>
                ${content}
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
                <p style="color:#9ca3af;font-size:12px;text-align:center">
                    © ${new Date().getFullYear()} Omnex Study. Все права защищены.
                </p>
            </div>
        `;
    }
}
