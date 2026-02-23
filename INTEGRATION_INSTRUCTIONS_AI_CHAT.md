# 📝 ИНСТРУКЦИЯ: Интеграция Chat History в AI Course Creator

Файл: `nextjs-app/src/components/ai/ai-course-creator-chat.tsx`

---

## ШАГ 1: Добавить импорт Trash2 (строка 24)

**НАЙТИ:**
```typescript
    Cpu
} from 'lucide-react';
```

**ЗАМЕНИТЬ НА:**
```typescript
    Cpu,
    Trash2
} from 'lucide-react';
```

---

## ШАГ 2: Добавить импорт хука (строка 26, ПОСЛЕ импорта aiService)

**НАЙТИ:**
```typescript
import { aiService, type DifficultyLevel, type LessonFormat } from '@/lib/ai/ai-service';
import type { Locale } from '@/lib/i18n/config';
```

**ДОБАВИТЬ МЕЖДУ НИМИ:**
```typescript
import { aiService, type DifficultyLevel, type LessonFormat } from '@/lib/ai/ai-service';
import { useChatSession } from '@/lib/hooks/useChatSession';
import type { Locale } from '@/lib/i18n/config';
```

---

## ШАГ 3: Использовать хук (строка 60, ПОСЛЕ const router)

**НАЙТИ:**
```typescript
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
```

**ЗАМЕНИТЬ НА:**
```typescript
    const router = useRouter();
    const { sessionId, saveMessage, clearChat } = useChatSession();
    const [messages, setMessages] = useState<Message[]>([]);
```

---

## ШАГ 4: Сохранение USER сообщения (строка 141, ПОСЛЕ setMessages)

**НАЙТИ (строка 141):**
```typescript
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
```

**ЗАМЕНИТЬ НА:**
```typescript
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Сохранить user message в БД
        if (sessionId) {
            saveMessage('user', userMessage.content).catch(err => 
                console.error('Failed to save user message:', err)
            );
        }
```

---

## ШАГ 5: Сохранение AI сообщения (строка 181, ПОСЛЕ setMessages для aiMessage)

**НАЙТИ (строка 180-181):**
```typescript
                };
                setMessages(prev => [...prev, aiMessage]);
            } catch (error) {
```

**ЗАМЕНИТЬ НА:**
```typescript
                };
                setMessages(prev => [...prev, aiMessage]);
                
                // Сохранить AI message в БД
                if (sessionId) {
                    saveMessage('ai', aiMessage.content).catch(err => 
                        console.error('Failed to save AI message:', err)
                    );
                }
            } catch (error) {
```

---

## ШАГ 6: Кнопка Clear Chat (строка 302, В НАЧАЛЕ return)

**НАЙТИ (строка 301-302):**
```typescript
    return (
        <div className="flex flex-col h-full w-full max-w-4xl mx-auto relative">
```

**ЗАМЕНИТЬ НА:**
```typescript
    return (
        <div className="flex flex-col h-full w-full max-w-4xl mx-auto relative">
            {/* Clear Chat Button */}
            {messages.length > 0 && (
                <div className="absolute top-4 right-4 z-10">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                            const success = await clearChat();
                            if (success) {
                                setMessages([]);
                                console.log('Chat cleared');
                            }
                        }}
                        className="gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        Clear
                    </Button>
                </div>
            )}
```

---

## ✅ ГОТОВО!

После всех изменений AI chat будет:
- ✅ Автоматически создавать сессию при открытии
- ✅ Сохранять все сообщения пользователя в БД
- ✅ Сохранять все ответы AI в БД
- ✅ Иметь кнопку "Clear" для очистки чата

**Тестирование:**
1. Откройте AI Course Creator
2. Напишите несколько сообщений
3. Перезагрузите страницу - сообщения должны сохраниться (добавим загрузку истории позже)
4. Нажмите кнопку "Clear" - чат очистится
