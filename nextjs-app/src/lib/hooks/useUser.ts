import { useLocalStorage } from './useLocalStorage';
import { mockUser } from '@/lib/api/mock-data';
import { useCourseProgress } from './useCourseProgress';
import { useUserPreferences } from './useUserPreferences';

export interface UserData {
    id: string;
    name: string;
    email: string;
    avatar: string;
    createdAt: string;
}

const defaultUserData: UserData = {
    id: mockUser.id,
    name: mockUser.name,
    email: mockUser.email,
    avatar: mockUser.avatar || '',
    createdAt: new Date().toISOString(),
};

export function useUser(isAuthenticated: boolean) {
    const [userData, setUserData] = useLocalStorage<UserData>(
        'ai-learning-user',
        defaultUserData
    );

    const [purchasedCourses] = useLocalStorage<string[]>(
        'ai-learning-purchased-courses',
        mockUser.purchasedCourses ?? []
    );

    const courseProgress = useCourseProgress();
    const userPreferences = useUserPreferences();

    const updateProfile = (updates: Partial<UserData>) => {
        setUserData((prev) => ({
            ...prev,
            ...updates,
        }));
    };

    const getFullUserData = () => {
        if (!isAuthenticated) return null;

        return {
            ...userData,
            purchasedCourses,
            role: 'user' as const,
            progress: courseProgress.progressData,
            preferences: userPreferences.preferences,
        };
    };

    return {
        userData,
        updateProfile,
        getFullUserData,
    };
}
