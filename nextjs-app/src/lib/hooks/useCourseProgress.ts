import { useLocalStorage } from './useLocalStorage';

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  timeSpent: number; // в минутах
  quizScore?: number;
}

export interface CourseProgress {
  courseId: string;
  enrolledAt: string;
  lastAccessedAt: string;
  completedLessons: string[];
  currentLessonId?: string;
  overallProgress: number; // процент 0-100
  totalTimeSpent: number; // в минутах
  lessons: Record<string, LessonProgress>;
}

export interface ProgressData {
  courses: Record<string, CourseProgress>;
  totalCoursesCompleted: number;
  totalTimeSpent: number;
  streak: number;
  lastActiveDate?: string;
}

const defaultProgressData: ProgressData = {
  courses: {},
  totalCoursesCompleted: 0,
  totalTimeSpent: 0,
  streak: 0,
};

/**
 * Хук для управления прогрессом обучения
 */
export function useCourseProgress() {
  const [progressData, setProgressData] = useLocalStorage<ProgressData>(
    'ai-learning-progress',
    defaultProgressData
  );

  /**
   * Получить прогресс по конкретному курсу
   */
  const getCourseProgress = (courseId: string): CourseProgress | null => {
    return progressData.courses[courseId] || null;
  };

  /**
   * Начать курс (записаться)
   */
  const enrollCourse = (courseId: string) => {
    const now = new Date().toISOString();

    setProgressData((prev) => ({
      ...prev,
      courses: {
        ...prev.courses,
        [courseId]: {
          courseId,
          enrolledAt: now,
          lastAccessedAt: now,
          completedLessons: [],
          overallProgress: 0,
          totalTimeSpent: 0,
          lessons: {},
        },
      },
    }));
  };

  /**
   * Обновить последнюю дату доступа к курсу
   */
  const updateLastAccessed = (courseId: string) => {
    setProgressData((prev) => {
      if (!prev.courses[courseId]) return prev;

      return {
        ...prev,
        courses: {
          ...prev.courses,
          [courseId]: {
            ...prev.courses[courseId],
            lastAccessedAt: new Date().toISOString(),
          },
        },
      };
    });
  };

  /**
   * Отметить урок как завершенный
   */
  const completeLesson = (
    courseId: string,
    lessonId: string,
    timeSpent: number = 0,
    quizScore?: number
  ) => {
    setProgressData((prev) => {
      const course = prev.courses[courseId];
      if (!course) return prev;

      const isAlreadyCompleted = course.completedLessons.includes(lessonId);
      const completedLessons = isAlreadyCompleted
        ? course.completedLessons
        : [...course.completedLessons, lessonId];

      const lessonProgress: LessonProgress = {
        lessonId,
        completed: true,
        completedAt: new Date().toISOString(),
        timeSpent,
        quizScore,
      };

      return {
        ...prev,
        totalTimeSpent: prev.totalTimeSpent + timeSpent,
        courses: {
          ...prev.courses,
          [courseId]: {
            ...course,
            completedLessons,
            lastAccessedAt: new Date().toISOString(),
            totalTimeSpent: course.totalTimeSpent + timeSpent,
            lessons: {
              ...course.lessons,
              [lessonId]: lessonProgress,
            },
          },
        },
      };
    });
  };

  /**
   * Установить текущий урок
   */
  const setCurrentLesson = (courseId: string, lessonId: string) => {
    setProgressData((prev) => {
      if (!prev.courses[courseId]) return prev;

      return {
        ...prev,
        courses: {
          ...prev.courses,
          [courseId]: {
            ...prev.courses[courseId],
            currentLessonId: lessonId,
            lastAccessedAt: new Date().toISOString(),
          },
        },
      };
    });
  };

  /**
   * Обновить общий прогресс курса
   */
  const updateCourseProgress = (courseId: string, progress: number) => {
    setProgressData((prev) => {
      if (!prev.courses[courseId]) return prev;

      // Проверяем, завершен ли курс (100%)
      const wasCompleted = prev.courses[courseId].overallProgress === 100;
      const isNowCompleted = progress === 100;
      const totalCompleted = isNowCompleted && !wasCompleted
        ? prev.totalCoursesCompleted + 1
        : prev.totalCoursesCompleted;

      return {
        ...prev,
        totalCoursesCompleted: totalCompleted,
        courses: {
          ...prev.courses,
          [courseId]: {
            ...prev.courses[courseId],
            overallProgress: progress,
            lastAccessedAt: new Date().toISOString(),
          },
        },
      };
    });
  };

  /**
   * Добавить время обучения
   */
  const addStudyTime = (courseId: string, minutes: number) => {
    setProgressData((prev) => {
      if (!prev.courses[courseId]) return prev;

      return {
        ...prev,
        totalTimeSpent: prev.totalTimeSpent + minutes,
        courses: {
          ...prev.courses,
          [courseId]: {
            ...prev.courses[courseId],
            totalTimeSpent: prev.courses[courseId].totalTimeSpent + minutes,
          },
        },
      };
    });
  };

  /**
   * Обновить streak (серию дней обучения)
   */
  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = progressData.lastActiveDate?.split('T')[0];

    if (!lastActive) {
      // Первый день
      setProgressData((prev) => ({
        ...prev,
        streak: 1,
        lastActiveDate: new Date().toISOString(),
      }));
      return;
    }

    if (lastActive === today) {
      // Уже учились сегодня
      return;
    }

    const lastDate = new Date(lastActive);
    const todayDate = new Date(today);
    const diffTime = todayDate.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Продолжаем streak
      setProgressData((prev) => ({
        ...prev,
        streak: prev.streak + 1,
        lastActiveDate: new Date().toISOString(),
      }));
    } else {
      // Streak прервался, начинаем заново
      setProgressData((prev) => ({
        ...prev,
        streak: 1,
        lastActiveDate: new Date().toISOString(),
      }));
    }
  };

  /**
   * Сбросить весь прогресс
   */
  const resetProgress = () => {
    setProgressData(defaultProgressData);
  };

  /**
   * Сбросить прогресс конкретного курса
   */
  const resetCourseProgress = (courseId: string) => {
    setProgressData((prev) => {
      const { [courseId]: _removed, ...remainingCourses } = prev.courses;
      return {
        ...prev,
        courses: remainingCourses,
      };
    });
  };

  return {
    progressData,
    getCourseProgress,
    enrollCourse,
    updateLastAccessed,
    completeLesson,
    setCurrentLesson,
    updateCourseProgress,
    addStudyTime,
    updateStreak,
    resetProgress,
    resetCourseProgress,
  };
}
