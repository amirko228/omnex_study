'use client';

import { useAppContext } from '../providers';
import { ProfileSettings } from '@/components/profile/profile-settings';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
    const { dict, isAuthenticated, locale, user } = useAppContext();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!dict || !isAuthenticated) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <ProfileSettings
            dict={dict}
            locale={locale}
            user={user ?? null}
        />
    );
}
