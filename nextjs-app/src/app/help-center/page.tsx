'use client';

import { useAppContext } from '../providers';
import { HelpCenter as HelpCenterComponent } from '@/components/pages/help-center';

export default function HelpCenterPage() {
    const { dict } = useAppContext();

    if (!dict) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return <HelpCenterComponent dict={dict} />;
}
