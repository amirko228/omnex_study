import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';

type SetValue<T> = Dispatch<SetStateAction<T>>;

/**
 * Улучшенный хук для работы с localStorage
 * - Автоматическая синхронизация между вкладками
 * - Полная обработка ошибок
 * - Type-safe API
 * - Поддержка SSR
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, SetValue<T>, () => void] {
  // Функция для безопасного чтения из localStorage
  const readValue = useCallback((): T => {
    // Проверка SSR
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  }, [initialValue, key]);

  // State для хранения значения
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Функция для записи в localStorage
  const setValue: SetValue<T> = useCallback(
    (value) => {
      // Проверка SSR
      if (typeof window === 'undefined') {
        return;
      }

      try {
        // Поддержка функционального обновления как в useState
        const newValue = value instanceof Function ? value(storedValue) : value;

        // Сохраняем в localStorage
        window.localStorage.setItem(key, JSON.stringify(newValue));

        // Обновляем state
        setStoredValue(newValue);

        // Dispatch custom event для синхронизации между вкладками
        window.dispatchEvent(
          new CustomEvent('local-storage', {
            detail: { key, newValue },
          })
        );
      } catch {
        // silently ignored
      }
    },
    [key, storedValue]
  );

  // Функция для удаления из localStorage
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);

      // Dispatch event для синхронизации
      window.dispatchEvent(
        new CustomEvent('local-storage', {
          detail: { key, newValue: initialValue },
        })
      );
    } catch {
      // silently ignored
    }
  }, [key, initialValue]);

  // Слушаем изменения в других вкладках
  useEffect(() => {
    // Обновляем state при изменении в другой вкладке
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if ((e as StorageEvent).key && (e as StorageEvent).key !== key) {
        return;
      }

      setStoredValue(readValue());
    };

    // Слушаем событие storage (между вкладками)
    window.addEventListener('storage', handleStorageChange as EventListener);

    // Слушаем custom event (внутри одной вкладки)
    window.addEventListener('local-storage', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener);
      window.removeEventListener('local-storage', handleStorageChange as EventListener);
    };
  }, [key, readValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Utility функция для очистки всех данных приложения из localStorage
 */
export const clearAllStorage = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Список всех ключей п��иложения
    const appKeys = [
      'ai-learning-auth',
      'ai-learning-user',
      'ai-learning-purchased-courses',
      'ai-learning-locale',
      'ai-learning-theme',
      'ai-learning-selected-format',
      'ai-learning-progress',
      'ai-learning-completed-lessons',
      'ai-learning-notifications',
      'ai-learning-preferences',
    ];

    appKeys.forEach((key) => {
      window.localStorage.removeItem(key);
    });

    // Dispatch event для синхронизации
    window.dispatchEvent(new Event('storage'));

  } catch {
    // silently ignored
  }
};

/**
 * Получить значение из localStorage без использования хука
 */
export const getStoredValue = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
};

/**
 * Установить значение в localStorage без использования хука
 */
export const setStoredValue = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));

    // Dispatch event для синхронизации
    window.dispatchEvent(
      new CustomEvent('local-storage', {
        detail: { key, newValue: value },
      })
    );
  } catch {
    // silently ignored
  }
};

/**
 * Удалить значение из localStorage без использования хука
 */
export const removeStoredValue = (key: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(key);
    window.dispatchEvent(new Event('storage'));
  } catch {
    // silently ignored
  }
};

/**
 * Проверить доступность localStorage
 */
export const isLocalStorageAvailable = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const testKey = '__localStorage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Получить размер всех данных в localStorage (в байтах)
 */
export const getLocalStorageSize = (): number => {
  if (typeof window === 'undefined') {
    return 0;
  }

  let total = 0;
  try {
    for (const key in window.localStorage) {
      if (window.localStorage.hasOwnProperty(key)) {
        total += window.localStorage[key].length + key.length;
      }
    }
  } catch {
    // silently ignored
  }

  return total;
};

/**
 * Экспортировать все данные приложения из localStorage
 */
export const exportAppData = (): Record<string, unknown> => {
  if (typeof window === 'undefined') {
    return {};
  }

  const data: Record<string, unknown> = {};
  const appPrefix = 'ai-learning-';

  try {
    for (const key in window.localStorage) {
      if (key.startsWith(appPrefix)) {
        const item = window.localStorage.getItem(key);
        if (item) {
          try {
            data[key] = JSON.parse(item);
          } catch {
            data[key] = item;
          }
        }
      }
    }
  } catch {
    // silently ignored
  }

  return data;
};

/**
 * Импортировать данные приложения в localStorage
 */
export const importAppData = (data: Record<string, unknown>): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    Object.entries(data).forEach(([key, value]) => {
      window.localStorage.setItem(key, JSON.stringify(value));
    });

    // Dispatch event для синхронизации
    window.dispatchEvent(new Event('storage'));

  } catch {
    // silently ignored
  }
};
