'use client';

import { useAppContext } from '../providers';
import { ResetPassword as ResetPasswordComponent } from '@/components/auth/reset-password';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
    const { dict } = useAppContext();
    const router = useRouter();

    if (!dict) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    const handleBack = () => {
        router.push('/login');
    };

    return (
        <ResetPasswordComponent
            dict={dict}
            onBack={handleBack}
        />
    );
}
