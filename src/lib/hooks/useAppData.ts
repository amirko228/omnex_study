import { useLocalStorage } from './useLocalStorage';
import { useCourseProgress } from './useCourseProgress';
import { useUserPreferences } from './useUserPreferences';
import { useAuth } from './useAuth';
import { useUser } from './useUser';
import { useCourses } from './useCourses';
import type { Locale } from '@/lib/i18n/config';

/**
 * Центральный хук для управления всеми данными приложения
 * Теперь делегирует работу специализированным хукам для повышения модульности
 */
export function useAppData() {
  const { isAuthenticated, login, logout } = useAuth();
  const { userData, updateProfile, getFullUserData } = useUser(isAuthenticated);
  const {
    purchasedCourses,
    purchaseCourse,
    hasPurchasedCourse,
    selectedFormat,
    setSelectedFormat
  } = useCourses();

  const [locale, setLocale] = useLocalStorage<Locale>(
    'ai-learning-locale',
    'ru'
  );

  const courseProgress = useCourseProgress();
  const userPreferences = useUserPreferences();

  const getStats = () => {
    const progress = courseProgress.progressData;

    return {
      totalCourses: purchasedCourses.length,
      completedCourses: progress.totalCoursesCompleted,
      totalHours: Math.round(progress.totalTimeSpent / 60),
      streak: progress.streak,
      enrolledCourses: Object.keys(progress.courses).length,
    };
  };

  const exportAllData = () => {
    return {
      user: userData,
      authenticated: isAuthenticated,
      purchasedCourses,
      selectedFormat,
      locale,
      progress: courseProgress.progressData,
      preferences: userPreferences.preferences,
      exportedAt: new Date().toISOString(),
    };
  };

  const resetAllData = () => {
    logout();
    courseProgress.resetProgress();
    userPreferences.resetPreferences();
    // Refresh page or manual state reset might be needed for some storages
  };

  return {
    // Аутентификация
    isAuthenticated,
    login,
    logout,

    // Пользователь
    userData,
    updateProfile,
    getFullUserData,

    // Курсы
    purchasedCourses,
    purchaseCourse,
    hasPurchasedCourse,
    selectedFormat,
    setSelectedFormat,

    // Локализация
    locale,
    setLocale,

    // Прогресс
    ...courseProgress,

    // Настройки
    ...userPreferences,

    // Утилиты
    getStats,
    exportAllData,
    resetAllData,
  };
}
