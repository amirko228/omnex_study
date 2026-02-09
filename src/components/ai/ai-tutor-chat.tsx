'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { aiService, type DifficultyLevel } from '@/lib/ai/ai-service';
import type { Locale } from '@/lib/i18n/config';

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
};

type AITutorChatProps = {
  courseId?: string;
  lessonId?: string;
  userLevel?: DifficultyLevel;
  locale: Locale;
  placeholder?: string;
};

export function AITutorChat({ 
  courseId, 
  lessonId, 
  userLevel = 'intermediate',
  locale,
  placeholder 
}: AITutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: getWelcomeMessage(locale),
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiService.chatWithTutor(input.trim(), {
        courseId,
        lessonId,
        userLevel,
        language: locale
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: getErrorMessage(locale),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-t-lg">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold flex items-center gap-2">
            {getTutorName(locale)}
            <Sparkles className="w-4 h-4 text-purple-500" />
          </h3>
          <p className="text-sm text-muted-foreground">
            {getTutorStatus(locale)}
          </p>
        </div>
        <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
          {locale === 'ru' ? 'Онлайн' :
           locale === 'de' ? 'Online' :
           locale === 'es' ? 'En línea' :
           locale === 'fr' ? 'En ligne' :
           'Online'}
        </Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/20">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'ai' 
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                  : 'bg-blue-500'
              }`}>
                {message.role === 'ai' ? (
                  <Bot className="w-5 h-5 text-white" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`flex flex-col gap-1 max-w-[80%] ${
                message.role === 'user' ? 'items-end' : 'items-start'
              }`}>
                <Card className={`px-4 py-3 ${
                  message.role === 'ai'
                    ? 'bg-card border'
                    : 'bg-blue-500 text-white border-blue-500'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </Card>
                <span className="text-xs text-muted-foreground px-1">
                  {message.timestamp.toLocaleTimeString(locale, { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <Card className="px-4 py-3 bg-card border">
              <div className="flex gap-1">
                <motion.div
                  className="w-2 h-2 bg-purple-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-purple-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-purple-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </Card>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder || getInputPlaceholder(locale)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper functions for localization

function getWelcomeMessage(locale: Locale): string {
  const messages: Record<Locale, string> = {
    ru: 'Привет! Я ваш ИИ-наставник. Задавайте любые вопросы по курсу, и я помогу вам разобраться! 🤖✨',
    en: 'Hi! I\'m your AI tutor. Ask me anything about the course, and I\'ll help you understand! 🤖✨',
    de: 'Hallo! Ich bin Ihr KI-Tutor. Fragen Sie mich alles über den Kurs, und ich helfe Ihnen zu verstehen! 🤖✨',
    es: '¡Hola! Soy tu tutor de IA. Pregúntame cualquier cosa sobre el curso, ¡y te ayudaré a entender! 🤖✨',
    fr: 'Salut! Je suis votre tuteur IA. Posez-moi n\'importe quelle question sur le cours, et je vous aiderai à comprendre! 🤖✨'
  };
  return messages[locale] || messages.en;
}

function getTutorName(locale: Locale): string {
  const names: Record<Locale, string> = {
    ru: 'ИИ-Наставник',
    en: 'AI Tutor',
    de: 'KI-Tutor',
    es: 'Tutor IA',
    fr: 'Tuteur IA'
  };
  return names[locale] || names.en;
}

function getTutorStatus(locale: Locale): string {
  const statuses: Record<Locale, string> = {
    ru: 'Готов помочь 24/7',
    en: 'Ready to help 24/7',
    de: 'Bereit zu helfen 24/7',
    es: 'Listo para ayudar 24/7',
    fr: 'Prêt à aider 24/7'
  };
  return statuses[locale] || statuses.en;
}

function getInputPlaceholder(locale: Locale): string {
  const placeholders: Record<Locale, string> = {
    ru: 'Задайте вопрос...',
    en: 'Ask a question...',
    de: 'Stellen Sie eine Frage...',
    es: 'Haz una pregunta...',
    fr: 'Posez une question...'
  };
  return placeholders[locale] || placeholders.en;
}

function getErrorMessage(locale: Locale): string {
  const errors: Record<Locale, string> = {
    ru: 'Извините, произошла ошибка. Попробуйте задать вопрос ещё раз.',
    en: 'Sorry, an error occurred. Please try asking again.',
    de: 'Entschuldigung, ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
    es: 'Lo siento, ocurrió un error. Por favor intenta preguntar de nuevo.',
    fr: 'Désolé, une erreur s\'est produite. Veuillez réessayer.'
  };
  return errors[locale] || errors.en;
}
