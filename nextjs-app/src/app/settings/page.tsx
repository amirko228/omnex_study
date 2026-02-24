'use client';

import { useAppContext } from '../providers';
import { SettingsPage as SettingsPageComponent } from '@/components/pages/settings-page';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SettingsPage() {
    const { dict, isAuthenticated, locale, user, setLocale, logout, refetchUser } = useAppContext();
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
        <SettingsPageComponent
            dict={dict}
            locale={locale}
            user={user ?? null}
            onDeleteAccount={logout}
            onLocaleChange={setLocale}
            refetchUser={refetchUser}
        />
    );
}
