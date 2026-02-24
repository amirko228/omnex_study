'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Send,
    Bot,
    Loader2,
    Sparkles,
    Clock,
    GraduationCap,
    CheckCircle2,
    ArrowRight,
    Code,
    Globe,
    Palette,
    Briefcase,
    Cpu,
    Trash2
} from 'lucide-react';
import { aiService, type DifficultyLevel, type LessonFormat } from '@/lib/ai/ai-service';
import { useChatSession } from '@/lib/hooks/useChatSession';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { useRouter } from 'next/navigation';

type Message = {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
    type?: 'text' | 'course-preview' | 'generating' | 'course-ready';
    courseData?: {
        topic: string;
        level: DifficultyLevel;
        duration: number;
        formats: LessonFormat[];
    };
    generatedCourseId?: string;
    generationSteps?: { label: string; status: 'pending' | 'loading' | 'completed' }[];
};

type AICourseCreatorChatProps = {
    locale: Locale;
    dict: Dictionary;
    subscription: 'free' | 'pro' | 'enterprise';
    onCourseGenerated?: (courseId: string) => void;
};

export function AICourseCreatorChat({
    locale,
    dict,
    subscription,
    onCourseGenerated
}: AICourseCreatorChatProps) {
    const router = useRouter();
    const { sessionId, saveMessage, clearChat, loadHistory } = useChatSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Ref for the scrollable container
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Improved scroll to bottom function
    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        if (scrollAreaRef.current) {
            const { scrollHeight, clientHeight } = scrollAreaRef.current;
            scrollAreaRef.current.scrollTo({
                top: scrollHeight - clientHeight,
                behavior
            });
        }
    };

    useEffect(() => {
        // Only scroll if we are generating loops or loading to keep user at bottom
        // but relaxed check to avoid jumping if user scrolled up significantly
        if (isLoading || isGenerating) {
            scrollToBottom();
        }
    }, [isLoading, isGenerating, messages]); // messages dependency is needed for new messages

    // Force scroll on new message mount
    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages.length]);

    // Загрузить историю чата при создании сессии (только один раз)
    useEffect(() => {
        let hasLoadedHistory = false;

        async function loadChatHistory() {
            if (!sessionId || hasLoadedHistory) return;
            hasLoadedHistory = true;

            try {
                const history = await loadHistory();

                if (history && history.length > 0) {
                    // Преобразуем в формат Message компонента с правильными типами
                    const formattedHistory = history.map((msg) => {
                        const baseMessage = {
                            id: msg.id,
                            role: msg.role,
                            content: msg.content,
                            timestamp: msg.timestamp,
                        };

                        // Восстанавливаем тип и специфичные поля из metadata
                        if (msg.metadata?.type === 'course-preview' && msg.metadata?.courseData) {
                            return {
                                ...baseMessage,
                                type: 'course-preview' as const,
                                courseData: msg.metadata.courseData,
                            };
                        } else if (msg.metadata?.type === 'generating' && msg.metadata?.generationSteps) {
                            return {
                                ...baseMessage,
                                type: 'generating' as const,
                                generationSteps: msg.metadata.generationSteps,
                            };
                        } else {
                            return {
                                ...baseMessage,
                                type: 'text' as const,
                            };
                        }
                    });
                    setMessages(formattedHistory as Message[]);
                }
            } catch {
                // silently ignored
            }
        }

        loadChatHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    // Парсинг запроса пользователя
    const parseUserRequest = (text: string): { topic: string; level: DifficultyLevel; duration: number; formats: LessonFormat[] } => {
        const lowerText = text.toLowerCase();

        let topic = text;
        const topicKeywords = ['создай курс', 'научи', 'хочу изучить', 'расскажи про', 'курс по', 'create course', 'teach me', 'learn', 'about'];
        for (const keyword of topicKeywords) {
            if (lowerText.includes(keyword)) {
                topic = text.slice(lowerText.indexOf(keyword) + keyword.length).trim();
                break;
            }
        }

        let level: DifficultyLevel = 'intermediate';
        if (lowerText.includes('начинающ') || lowerText.includes('beginner') || lowerText.includes('basic') || lowerText.includes('simple')) {
            level = 'beginner';
        } else if (lowerText.includes('продвинут') || lowerText.includes('advanced') || lowerText.includes('expert') || lowerText.includes('hard')) {
            level = 'advanced';
        }

        let duration = 10;
        const durationMatch = text.match(/(\d+)\s*(час|hour|ч|h)/i);
        if (durationMatch) {
            duration = parseInt(durationMatch[1]);
        }

        const formats: LessonFormat[] = subscription === 'free' ? ['text'] : ['text', 'quiz', 'practice'];

        return { topic, level, duration, formats };
    };

    const handleSend = async (customInput?: string) => {
        const textToSend = customInput || input;
        if (!textToSend.trim() || isLoading) return;

        // Immediately scroll to bottom before processing
        scrollToBottom();

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: textToSend.trim(),
            timestamp: new Date(),
            type: 'text'
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Сохранить user message в БД
        if (sessionId) {
            saveMessage('user', userMessage.content).catch(() => {});
        }

        const userInput = textToSend.trim();
        const createKeywords = ['создай', 'сделай', 'курс', 'научи', 'изучить', 'create', 'make', 'course', 'teach', 'learn', 'want to know'];
        const wantsToCreate = createKeywords.some(kw => userInput.toLowerCase().includes(kw));

        // Simulate AI thinking delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (wantsToCreate) {
            const courseParams = parseUserRequest(userInput);

            const previewMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: "Preview", // Not visible in new UI
                timestamp: new Date(),
                type: 'course-preview',
                courseData: courseParams
            };

            setMessages(prev => [...prev, previewMessage]);
            setIsLoading(false);

            // Сохранить course-preview message в БД с metadata
            if (sessionId) {
                saveMessage('ai', previewMessage.content, { type: 'course-preview', courseData: courseParams }).catch(() => {});
            }

            setTimeout(() => {
                startCourseGeneration(courseParams);
            }, 1500);

        } else {
            try {
                const response = await getAIResponse(userInput, locale);
                const aiMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'ai',
                    content: response,
                    timestamp: new Date(),
                    type: 'text'
                };
                setMessages(prev => [...prev, aiMessage]);

                // Сохранить AI message в БД
                if (sessionId) {
                    saveMessage('ai', aiMessage.content).catch(() => {});
                }
            } catch {
                // silently ignored
            } finally {
                setIsLoading(false);
            }
        }
    };

    const startCourseGeneration = async (params: { topic: string; level: DifficultyLevel; duration: number; formats: LessonFormat[] }) => {
        setIsGenerating(true);
        // Initial scroll for generation start
        scrollToBottom();

        const steps = [
            { label: dict.aiCreator.steps.analyzing, status: 'loading' as const },
            { label: dict.aiCreator.steps.curriculum, status: 'pending' as const },
            { label: dict.aiCreator.steps.materials, status: 'pending' as const },
            { label: dict.aiCreator.steps.practical, status: 'pending' as const }
        ];

        const generatingMessageId = (Date.now() + 2).toString();
        const generatingMessage: Message = {
            id: generatingMessageId,
            role: 'ai',
            content: dict.aiCreator.generating,
            timestamp: new Date(),
            type: 'generating',
            generationSteps: steps
        };
        setMessages(prev => [...prev, generatingMessage]);

        // Сохранить generating message в БД с metadata
        if (sessionId) {
            saveMessage('ai', generatingMessage.content, { type: 'generating', generationSteps: steps }).catch(() => {});
        }

        // Simulate progress steps
        const updateStep = (index: number, status: 'loading' | 'completed') => {
            setMessages(prev => prev.map(m => {
                if (m.id === generatingMessageId && m.generationSteps) {
                    const newSteps = [...m.generationSteps];
                    newSteps[index] = { ...newSteps[index], status };
                    // If completing one step, start loading the next
                    if (status === 'completed' && index + 1 < newSteps.length) {
                        newSteps[index + 1] = { ...newSteps[index + 1], status: 'loading' };
                    }
                    return { ...m, generationSteps: newSteps };
                }
                return m;
            }));
        };

        try {
            // Step 1: Analyzing
            await new Promise(resolve => setTimeout(resolve, 1500));
            updateStep(0, 'completed');

            // Step 2: Curriculum
            await new Promise(resolve => setTimeout(resolve, 2000));
            updateStep(1, 'completed');

            // Step 3: Materials
            // Actually call AI service here in background
            aiService.generateCourse({
                topic: params.topic,
                level: params.level,
                duration: params.duration,
                language: locale,
                format: params.formats
            }).then(async (course) => {

                await new Promise(resolve => setTimeout(resolve, 1500)); // Finish step 3 visual
                updateStep(2, 'completed');

                await new Promise(resolve => setTimeout(resolve, 1000)); // Step 4
                updateStep(3, 'completed');

                // Remove generating message and show result
                setTimeout(() => {
                    setMessages(prev => {
                        const filtered = prev.filter(m => m.id !== generatingMessageId);
                        return [...filtered, {
                            id: (Date.now() + 3).toString(),
                            role: 'ai',
                            content: dict.aiCreator.courseReady.replace('{title}', course.title),
                            timestamp: new Date(),
                            type: 'course-ready',
                            generatedCourseId: course.id
                        }];
                    });
                    setIsGenerating(false);

                    if (onCourseGenerated) {
                        onCourseGenerated(course.id);
                    }
                }, 800);
            });

        } catch {
            setIsGenerating(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleOpenCourse = (courseId: string) => {
        router.push(`/course-detail?id=${courseId}`);
    };

    const suggestions = [
        { icon: <Code className="w-4 h-4" />, label: dict.aiCreator.suggestions.python.label, text: dict.aiCreator.suggestions.python.text },
        { icon: <Globe className="w-4 h-4" />, label: dict.aiCreator.suggestions.web.label, text: dict.aiCreator.suggestions.web.text },
        { icon: <Palette className="w-4 h-4" />, label: dict.aiCreator.suggestions.design.label, text: dict.aiCreator.suggestions.design.text },
        { icon: <Briefcase className="w-4 h-4" />, label: dict.aiCreator.suggestions.marketing.label, text: dict.aiCreator.suggestions.marketing.text },
    ];

    const emptyState = messages.length === 0;

    return (
        <div className="flex flex-col h-full w-full max-w-4xl mx-auto">

            {/* Messages Area - Added ref here */}
            <div
                ref={scrollAreaRef}
                className={`flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth ${emptyState ? 'items-center justify-center flex' : ''}`}
            >

                {/* Empty State / Welcome Screen */}
                <AnimatePresence>
                    {emptyState && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="text-center max-w-2xl w-full"
                        >
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/20">
                                <Sparkles className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
                                {dict.aiCreator.title}
                            </h2>
                            <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
                                {dict.aiCreator.subtitle}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(s.text)}
                                        className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-secondary/50 hover:border-purple-500/30 transition-all text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-purple-500/10 group-hover:text-purple-500 transition-colors">
                                            {s.icon}
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">{s.label}</div>
                                            <div className="text-xs text-muted-foreground truncate w-32 md:w-40">{s.text}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Chat Messages */}
                <AnimatePresence mode="popLayout">
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {/* AI Avatar */}
                            {message.role === 'ai' && (
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                            )}

                            <div className={`flex flex-col gap-2 max-w-[85%] md:max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>

                                {/* Regular Text Bubble */}
                                {message.type === 'text' && (
                                    <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${message.role === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-br-none'
                                        : 'bg-card border rounded-bl-none'
                                        }`}>
                                        {message.content}
                                    </div>
                                )}

                                {/* Course Preview Card */}
                                {message.type === 'course-preview' && message.courseData && (
                                    <Card className="p-0 overflow-hidden border-2 border-purple-100 dark:border-purple-900/30 w-full max-w-md shadow-lg">
                                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 p-4 border-b">
                                            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium text-sm mb-1">
                                                <Sparkles className="w-4 h-4" />
                                                <span>{dict.aiCreator.preview.draft}</span>
                                            </div>
                                            <h3 className="font-bold text-lg">{message.courseData.topic}</h3>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-muted-foreground flex items-center gap-2"><GraduationCap className="w-4 h-4" /> {dict.aiCreator.preview.level}</span>
                                                <Badge variant="secondary">{message.courseData.level}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> {dict.aiCreator.preview.duration}</span>
                                                <span>~{message.courseData.duration} {dict.card?.hours || 'hours'}</span>
                                            </div>
                                            <div className="pt-2">
                                                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                                                    <Cpu className="w-3 h-3" /> {dict.aiCreator.preview.processing}
                                                </div>
                                                <div className="h-1 bg-secondary rounded-full overflow-hidden w-full">
                                                    <motion.div
                                                        className="h-full bg-purple-500"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: "100%" }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                )}

                                {/* Generating Progress Step List */}
                                {message.type === 'generating' && message.generationSteps && (
                                    <Card className="p-5 w-full max-w-md border-purple-200 dark:border-purple-800 shadow-lg">
                                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                                            {message.content}
                                        </h4>
                                        <div className="space-y-4">
                                            {message.generationSteps.map((step, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors duration-300 ${step.status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                                                        step.status === 'loading' ? 'border-purple-500 text-purple-500 bg-purple-50 dark:bg-purple-900/20' :
                                                            'border-muted-foreground/30 text-muted-foreground'
                                                        }`}>
                                                        {step.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                        {step.status === 'loading' && <div className="w-2 h-2 bg-current rounded-full animate-ping" />}
                                                        {step.status === 'pending' && <div className="w-2 h-2 bg-current rounded-full opacity-20" />}
                                                    </div>
                                                    <span className={`text-sm transition-colors duration-300 ${step.status === 'loading' ? 'text-foreground font-medium' :
                                                        step.status === 'completed' ? 'text-muted-foreground line-through opacity-70' :
                                                            'text-muted-foreground'
                                                        }`}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                )}

                                {/* Course Ready Card */}
                                {message.type === 'course-ready' && (
                                    <Card className="p-0 overflow-hidden w-full max-w-md shadow-xl border-green-200 dark:border-green-900/30">
                                        <div className="bg-green-500/10 p-6 text-center">
                                            <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg">
                                                <CheckCircle2 className="w-6 h-6" />
                                            </div>
                                            <h3 className="font-bold text-xl mb-1">{message.content}</h3>
                                            <p className="text-sm text-muted-foreground">Your personalized learning path is ready.</p>
                                        </div>
                                        <div className="p-4 bg-card">
                                            <Button
                                                onClick={() => message.generatedCourseId && handleOpenCourse(message.generatedCourseId)}
                                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20 h-11 text-base"
                                            >
                                                {dict.aiCreator.courseReady.replace('{title}', '')}
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </Card>
                                )}

                                {/* Metadata */}
                                <span className="text-[10px] text-muted-foreground/50 px-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isLoading && !isGenerating && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-card border px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce"></span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 pt-2">
                <div className="relative flex items-center max-w-3xl mx-auto bg-card rounded-2xl border shadow-lg shadow-black/5 ring-offset-2 focus-within:ring-2 ring-purple-500/20 transition-all">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={dict.aiCreator.inputPlaceholder}
                        disabled={isLoading || isGenerating}
                        className="flex-1 border-none bg-transparent h-14 px-5 text-base focus-visible:ring-0 placeholder:text-muted-foreground/50"
                    />
                    <div className="flex items-center gap-1.5 pr-2">
                        {/* Clear Chat Button */}
                        {messages.length > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={async () => {
                                    const success = await clearChat();
                                    if (success) {
                                        setMessages([]);
                                    }
                                }}
                                className="h-9 w-9 text-muted-foreground hover:text-destructive transition-colors"
                                title="Clear chat"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            size="icon"
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isLoading || isGenerating}
                            className={`h-10 w-10 rounded-xl transition-all duration-300 ${input.trim()
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/20 hover:scale-105'
                                : 'bg-secondary text-muted-foreground'
                                }`}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </Button>
                    </div>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-3">
                    {dict.aiCreator.disclaimer}
                </p>
            </div>
        </div>
    );
}

async function getAIResponse(input: string, locale: Locale): Promise<string> {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('привет')) {
        return locale === 'ru'
            ? 'Привет! Чем могу помочь в обучении сегодня?'
            : 'Hello! How can I help you learn today?';
    }

    return locale === 'ru'
        ? 'Я специализируюсь на создании курсов. Попробуйте сказать "Создай курс по..." и укажите тему.'
        : 'I specialize in creating courses. Try saying "Create a course about..." and specify a topic.';
}
