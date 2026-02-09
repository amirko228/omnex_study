import { useLocalStorage } from './useLocalStorage';

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  courseUpdates: boolean;
  achievements: boolean;
  newsletter: boolean;
}

export interface UserPreferences {
  // Настройки уведомлений
  notifications: NotificationSettings;
  
  // Настройки отображения
  compactMode: boolean;
  showProgressBar: boolean;
  autoplayVideos: boolean;
  
  // Настройки обучения
  dailyGoalMinutes: number;
  preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night' | null;
  
  // Настройки доступности
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  highContrast: boolean;
  
  // Другое
  cookiesAccepted: boolean;
  lastSeenWhatsNew?: string;
}

const defaultPreferences: UserPreferences = {
  notifications: {
    email: true,
    push: true,
    courseUpdates: true,
    achievements: true,
    newsletter: false,
  },
  compactMode: false,
  showProgressBar: true,
  autoplayVideos: false,
  dailyGoalMinutes: 30,
  preferredStudyTime: null,
  fontSize: 'medium',
  reducedMotion: false,
  highContrast: false,
  cookiesAccepted: false,
};

/**
 * Хук для управления настройками пользователя
 */
export function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
    'ai-learning-preferences',
    defaultPreferences
  );

  /**
   * Обновить настройки уведомлений
   */
  const updateNotifications = (
    updates: Partial<NotificationSettings>
  ) => {
    setPreferences((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        ...updates,
      },
    }));
  };

  /**
   * Обновить одну настройку
   */
  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /**
   * Обновить несколько настроек одновременно
   */
  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  /**
   * Принять cookies
   */
  const acceptCookies = () => {
    updatePreference('cookiesAccepted', true);
  };

  /**
   * Установить дневную цель
   */
  const setDailyGoal = (minutes: number) => {
    updatePreference('dailyGoalMinutes', minutes);
  };

  /**
   * Установить предпочтительное время обучения
   */
  const setPreferredStudyTime = (
    time: 'morning' | 'afternoon' | 'evening' | 'night' | null
  ) => {
    updatePreference('preferredStudyTime', time);
  };

  /**
   * Переключить компактный режим
   */
  const toggleCompactMode = () => {
    setPreferences((prev) => ({
      ...prev,
      compactMode: !prev.compactMode,
    }));
  };

  /**
   * Сбросить все настройки к значениям по умолчанию
   */
  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  return {
    preferences,
    updateNotifications,
    updatePreference,
    updatePreferences,
    acceptCookies,
    setDailyGoal,
    setPreferredStudyTime,
    toggleCompactMode,
    resetPreferences,
  };
}
