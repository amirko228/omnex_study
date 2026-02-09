'use client';

import { useAppContext } from '../providers';
import { PrivacyPolicy as PrivacyPolicyComponent } from '@/components/pages/privacy-policy';

export default function PrivacyPolicyPage() {
    const { dict } = useAppContext();

    if (!dict) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return <PrivacyPolicyComponent dict={dict} />;
}
