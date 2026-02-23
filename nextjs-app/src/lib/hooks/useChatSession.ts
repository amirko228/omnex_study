import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
    metadata?: any;
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
                console.warn('[useChatSession] User not authenticated, skipping session creation');
                return;
            }

            // Проверяем есть ли сохранённая сессия
            const savedSessionId = typeof window !== 'undefined' ? localStorage.getItem('chat_session_id') : null;

            if (savedSessionId) {
                console.log('[useChatSession] Restoring saved session:', savedSessionId);
                setSessionId(savedSessionId);
                return;
            }

            // Создаём новую сессию только если нет сохранённой
            try {
                console.log('[useChatSession] Creating new chat session...');
                const response = await apiClient.post('/chat/sessions', {
                    title: 'AI Course Creator',
                });
                const newSessionId = (response.data as any).id;
                console.log('[useChatSession] Session created:', newSessionId);

                setSessionId(newSessionId);
                // Сохраняем в localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('chat_session_id', newSessionId);
                }
            } catch (error: any) {
                console.error('[useChatSession] Failed to create chat session:', error);
                console.error('[useChatSession] Error details:', error.response?.data || error.message);
            }
        }

        initSession();
    }, []);

    // Сохранить сообщение
    const saveMessage = async (role: 'user' | 'ai', content: string, metadata?: any) => {
        if (!sessionId) {
            console.warn('[useChatSession] No session ID, cannot save message');
            return;
        }

        setIsLoading(true);
        try {
            console.log(`[useChatSession] Saving ${role} message to session ${sessionId}`);
            await apiClient.post(`/chat/sessions/${sessionId}/messages`, {
                role,
                content,
                metadata,
            });
            console.log(`[useChatSession] ${role} message saved successfully`);
        } catch (error: any) {
            console.error('[useChatSession] Failed to save message:', error);
            console.error('[useChatSession] Error details:', error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Загрузить историю сообщений
    const loadHistory = async () => {
        if (!sessionId) return [];

        try {
            const response = await apiClient.get(`/chat/sessions/${sessionId}`);
            const sessionData = response.data as any;
            const messages = sessionData?.messages;
            if (!messages || !Array.isArray(messages)) return [];
            return messages.map((msg: any) => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                timestamp: new Date(msg.createdAt),
                ...(msg.metadata && { metadata: msg.metadata }),
            }));
        } catch (error) {
            console.error('Failed to load chat history:', error);
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
            console.warn('[useChatSession] No session ID, cannot clear chat');
            return false;
        }

        try {
            console.log(`[useChatSession] Clearing chat session ${sessionId}`);
            await apiClient.delete(`/chat/sessions/${sessionId}`);
            console.log('[useChatSession] Session deleted, creating new one...');

            // Удаляем старый sessionId из localStorage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('chat_session_id');
            }

            // Создать новую сессию
            const response = await apiClient.post('/chat/sessions', {
                title: 'AI Course Creator',
            });
            const newSessionId = (response.data as any).id;
            console.log('[useChatSession] New session created:', newSessionId);

            setSessionId(newSessionId);
            // Сохраняем новый sessionId
            if (typeof window !== 'undefined') {
                localStorage.setItem('chat_session_id', newSessionId);
            }
            return true;
        } catch (error: any) {
            console.error('[useChatSession] Failed to clear chat:', error);
            console.error('[useChatSession] Error details:', error.response?.data || error.message);
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
