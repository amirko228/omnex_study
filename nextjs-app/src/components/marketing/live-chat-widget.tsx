'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Sparkles, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useFloatingCTA } from './floating-cta-context';

type Message = {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
};

const botResponses = [
  'Привет! 👋 Я AI-ассистент. Чем могу помочь?',
  'Конечно! Наши курсы адаптируются под ваш уровень знаний.',
  'У нас есть бесплатный пробный период на 14 дней. Хотите начать?',
  'Отличный вопрос! Вы получите персонального AI-наставника 24/7.',
  'Да, все курсы доступны на 5 языках: RU, EN, DE, ES, FR',
  'После завершения курса вы получите верифицированный сертификат.',
  'Можете отменить подписку в любой момент. Без скрытых платежей!'
];

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { isVisible: ctaVisible, isExpanded: ctaExpanded } = useFloatingCTA();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Привет! 👋 Я AI-ассистент платформы. Готов ответить на ваши вопросы!',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  // Calculate right position based on CTA state
  const getChatButtonPosition = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    
    if (!ctaVisible) return 24;
    
    if (isMobile) {
      // Mobile: +3px further
      if (ctaExpanded) return 143;
      return 79;
    } else {
      // Desktop: closer spacing
      if (ctaExpanded) return 170;
      return 80;
    }
  };

  return (
    <>
      {/* Chat bubble button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
            }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ 
              scale: { type: 'spring', damping: 15 },
              opacity: { duration: 0.2 },
            }}
            onClick={() => setIsOpen(true)}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: `${getChatButtonPosition()}px`,
              transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            className="h-12 w-12 sm:h-14 sm:w-14 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center shadow-2xl z-40 group"
          >
            {/* Glowing effect */}
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all" />
            
            <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground relative z-10" />
            
            {/* Notification badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white"
            >
              1
            </motion.div>

            {/* Ping animation */}
            <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-6 right-6 w-[calc(100vw-3rem)] sm:w-[380px] h-[500px] sm:h-[600px] max-h-[calc(100vh-3rem)] bg-background border-2 border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10 border-2 border-primary-foreground/20">
                    <AvatarFallback className="bg-primary-foreground/10">
                      <Sparkles className="h-5 w-5 text-primary-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator */}
                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-primary-foreground">AI Ассистент</h3>
                  <p className="text-xs text-primary-foreground/80">Онлайн • Отвечаем мгновенно</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-primary-foreground/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-primary-foreground" />
              </button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`flex gap-2 max-w-[80%] ${message.isBot ? '' : 'flex-row-reverse'}`}>
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        {message.isBot ? (
                          <AvatarFallback className="bg-primary/10">
                            <Sparkles className="h-4 w-4 text-primary" />
                          </AvatarFallback>
                        ) : (
                          <AvatarFallback className="bg-muted">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          message.isBot
                            ? 'bg-muted text-foreground'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex gap-2 items-end">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10">
                          <Sparkles className="h-4 w-4 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <motion.div
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                            className="h-2 w-2 bg-muted-foreground/50 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                            className="h-2 w-2 bg-muted-foreground/50 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                            className="h-2 w-2 bg-muted-foreground/50 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Напишите сообщение..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!inputValue.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Работает на AI • Среднее время ответа: 30 сек
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}