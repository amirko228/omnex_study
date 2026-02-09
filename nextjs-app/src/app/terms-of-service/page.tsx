'use client';

import { useAppContext } from '../providers';
import { TermsOfService as TermsOfServiceComponent } from '@/components/pages/terms-of-service';

export default function TermsOfServicePage() {
    const { dict } = useAppContext();

    if (!dict) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return <TermsOfServiceComponent dict={dict} />;
}
