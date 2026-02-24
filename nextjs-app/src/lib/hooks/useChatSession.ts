import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}

export function useChatSession() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Создать новую сессию при mount
    useEffect(() => {
        async function initSession() {
            // Проверка авторизации
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

            if (!token) {
                return;
            }

            // Проверяем есть ли сохранённая сессия
            const savedSessionId = typeof window !== 'undefined' ? localStorage.getItem('chat_session_id') : null;

            if (savedSessionId) {
                setSessionId(savedSessionId);
                return;
            }

            // Создаём новую сессию только если нет сохранённой
            try {
                const response = await apiClient.post<{ id: string }>('/chat/sessions', {
                    title: 'AI Course Creator',
                });
                const newSessionId = response.data?.id;

                if (newSessionId) {
                    setSessionId(newSessionId);
                    // Сохраняем в localStorage
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('chat_session_id', newSessionId);
                    }
                }
            } catch {
                // session creation failed
            }
        }

        initSession();
    }, []);

    // Сохранить сообщение
    const saveMessage = async (role: 'user' | 'ai', content: string, metadata?: Record<string, unknown>) => {
        if (!sessionId) {
            return;
        }

        setIsLoading(true);
        try {
            await apiClient.post(`/chat/sessions/${sessionId}/messages`, {
                role,
                content,
                metadata,
            });
        } catch {
            // message save failed
        } finally {
            setIsLoading(false);
        }
    };

    // Загрузить историю сообщений
    const loadHistory = async () => {
        if (!sessionId) return [];

        try {
            const response = await apiClient.get<{ messages: Array<{ id: string; role: 'user' | 'ai'; content: string; createdAt: string; metadata?: Record<string, unknown> }> }>(`/chat/sessions/${sessionId}`);
            const messages = response.data?.messages;
            if (!messages || !Array.isArray(messages)) return [];
            return messages.map((msg) => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                timestamp: new Date(msg.createdAt),
                ...(msg.metadata && { metadata: msg.metadata }),
            }));
        } catch {
            // Сессия не найдена — очищаем сохранённый ID
            if (typeof window !== 'undefined') {
                localStorage.removeItem('chat_session_id');
            }
            return [];
        }
    };

    // Очистить чат (удалить сессию)
    const clearChat = async () => {
        if (!sessionId) {
            return false;
        }

        try {
            await apiClient.delete(`/chat/sessions/${sessionId}`);

            // Удаляем старый sessionId из localStorage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('chat_session_id');
            }

            // Создать новую сессию
            const response = await apiClient.post<{ id: string }>('/chat/sessions', {
                title: 'AI Course Creator',
            });
            const newSessionId = response.data?.id;

            if (newSessionId) {
                setSessionId(newSessionId);
                // Сохраняем новый sessionId
                if (typeof window !== 'undefined') {
                    localStorage.setItem('chat_session_id', newSessionId);
                }
            }
            return true;
        } catch {
            return false;
        }
    };

    return {
        sessionId,
        saveMessage,
        loadHistory,
        clearChat,
        isLoading,
    };
}
