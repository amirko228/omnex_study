/**
 * Конфигурация лимитов подписки для AI-генерации курсов
 */

export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

export interface SubscriptionLimits {
    coursesPerMonth: number;
    maxCourseDuration: number; // в часах
    formats: ('text' | 'quiz' | 'chat' | 'practice')[];
    aiChatEnabled: boolean;
    maxLessonsPerCourse: number;
    prioritySupport: boolean;
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionPlan, SubscriptionLimits> = {
    free: {
        coursesPerMonth: 1,
        maxCourseDuration: 5,
        formats: ['text'],
        aiChatEnabled: false,
        maxLessonsPerCourse: 10,
        prioritySupport: false
    },
    pro: {
        coursesPerMonth: 10,
        maxCourseDuration: 50,
        formats: ['text', 'quiz', 'practice'],
        aiChatEnabled: true,
        maxLessonsPerCourse: 50,
        prioritySupport: false
    },
    enterprise: {
        coursesPerMonth: Infinity,
        maxCourseDuration: Infinity,
        formats: ['text', 'quiz', 'chat', 'practice'],
        aiChatEnabled: true,
        maxLessonsPerCourse: Infinity,
        prioritySupport: true
    }
};

export const PLAN_NAMES: Record<SubscriptionPlan, Record<string, string>> = {
    free: {
        ru: 'Бесплатный',
        en: 'Free'
    },
    pro: {
        ru: 'Профессиональный',
        en: 'Pro'
    },
    enterprise: {
        ru: 'Корпоративный',
        en: 'Enterprise'
    }
};

export const PLAN_PRICES: Record<SubscriptionPlan, number> = {
    free: 0,
    pro: 19,
    enterprise: 99
};

/**
 * Проверка, можно ли использовать определённый формат урока
 */
export function canUseFormat(
    plan: SubscriptionPlan,
    format: 'text' | 'quiz' | 'chat' | 'practice'
): boolean {
    return SUBSCRIPTION_LIMITS[plan].formats.includes(format);
}

/**
 * Получить лимиты для плана
 */
export function getSubscriptionLimits(plan: SubscriptionPlan): SubscriptionLimits {
    return SUBSCRIPTION_LIMITS[plan];
}

/**
 * Проверка, превышен ли лимит курсов
 */
export function isCourseLimitExceeded(
    plan: SubscriptionPlan,
    currentCourseCount: number
): boolean {
    const limits = SUBSCRIPTION_LIMITS[plan];
    return currentCourseCount >= limits.coursesPerMonth;
}
