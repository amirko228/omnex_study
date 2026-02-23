import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateSessionDto, UpdateSessionDto, SaveMessageDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }

    // Создать новую сессию
    async createSession(userId: string, dto: CreateSessionDto) {
        return this.prisma.chatSession.create({
            data: {
                userId,
                title: dto.title || 'New Chat',
            },
        });
    }

    // Получить все сессии пользователя
    async getUserSessions(userId: string) {
        return this.prisma.chatSession.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            include: {
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }

    // Получить сессию с сообщениями
    async getSessionWithMessages(userId: string, sessionId: string) {
        const session = await this.prisma.chatSession.findFirst({
            where: { id: sessionId, userId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!session) {
            throw new NotFoundException('Session not found');
        }

        return session;
    }

    // Обновить заголовок сессии
    async updateSession(userId: string, sessionId: string, dto: UpdateSessionDto) {
        const session = await this.prisma.chatSession.findFirst({
            where: { id: sessionId, userId },
        });

        if (!session) {
            throw new NotFoundException('Session not found');
        }

        return this.prisma.chatSession.update({
            where: { id: sessionId },
            data: { title: dto.title },
        });
    }

    // Добавить сообщение в сессию
    async saveMessage(userId: string, sessionId: string, dto: SaveMessageDto) {
        // Проверяем что сессия принадлежит пользователю
        const session = await this.prisma.chatSession.findFirst({
            where: { id: sessionId, userId },
        });

        if (!session) {
            throw new NotFoundException('Session not found');
        }

        // Создаём сообщение
        const message = await this.prisma.chatMessage.create({
            data: {
                sessionId,
                role: dto.role,
                content: dto.content,
                metadata: dto.metadata,
            },
        });

        // Обновляем updatedAt сессии
        await this.prisma.chatSession.update({
            where: { id: sessionId },
            data: { updatedAt: new Date() },
        });

        return message;
    }

    // Удалить сессию (Clear Chat)
    async deleteSession(userId: string, sessionId: string) {
        const session = await this.prisma.chatSession.findFirst({
            where: { id: sessionId, userId },
        });

        if (!session) {
            throw new NotFoundException('Session not found');
        }

        await this.prisma.chatSession.delete({
            where: { id: sessionId },
        });

        return { message: 'Session deleted successfully' };
    }
}
