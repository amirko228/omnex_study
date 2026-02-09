# LocalStorage Documentation

## Overview
Приложение использует кастомный хук `useLocalStorage` для надежного хранения состояния пользователя между сессиями.

## Stored Data

### 1. Authentication State
**Key:** `ai-learning-auth`  
**Type:** `boolean`  
**Description:** Хранит статус аутентификации пользователя

### 2. Purchased Courses
**Key:** `ai-learning-purchased-courses`  
**Type:** `string[]`  
**Description:** Массив ID купленных курсов

### 3. Locale
**Key:** `ai-learning-locale`  
**Type:** `'ru' | 'en' | 'de' | 'es' | 'fr'`  
**Description:** Выбранный язык интерфейса

### 4. Selected Format
**Key:** `ai-learning-selected-format`  
**Type:** `'text' | 'quiz' | 'chat' | 'assignment' | null`  
**Description:** Последний выбранный формат обучения

### 5. Theme (handled by ThemeProvider)
**Key:** `theme`  
**Type:** `'light' | 'dark' | 'system'`  
**Description:** Тема оформления

## Usage

```typescript
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';

// В компоненте
const [value, setValue, removeValue] = useLocalStorage('key', defaultValue);

// Чтение
console.log(value);

// Запись
setValue('new value');

// Удаление
removeValue();
```

## Utility Functions

### clearAllStorage()
Очищает все данные приложения из localStorage:
```typescript
import { clearAllStorage } from '@/lib/hooks/useLocalStorage';

clearAllStorage();
```

### getStoredValue() / setStoredValue()
Работа с localStorage без хука (для утилит):
```typescript
import { getStoredValue, setStoredValue } from '@/lib/hooks/useLocalStorage';

const value = getStoredValue('key', defaultValue);
setStoredValue('key', newValue);
```

## Error Handling
- Все операции с localStorage обернуты в try-catch
- При ошибках выводятся в console.error
- Возвращаются значения по умолчанию при ошибках чтения
- SSR-safe: проверка typeof window !== 'undefined'

## Security Notes
⚠️ **Важно:**
- Не храните чувствительные данные (пароли, токены)
- localStorage доступен только в браузере клиента
- Данные хранятся в открытом виде
- Для production используйте httpOnly cookies для аутентификации

## Data Persistence
Данные сохраняются:
- ✅ Между перезагрузками страницы
- ✅ Между закрытием и открытием браузера
- ✅ На конкретном устройстве и браузере
- ❌ Не синхронизируются между устройствами
- ❌ Очищаются при очистке данных браузера
