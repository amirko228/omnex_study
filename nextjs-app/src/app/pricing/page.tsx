'use client';

import { useAppContext } from '../providers';
import { PricingPage as PricingPageComponent } from '@/components/pages/pricing-page';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
    const { dict } = useAppContext();
    const router = useRouter();

    if (!dict) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    const handleNavigate = (page: string) => {
        router.push(`/${page}`);
    };

    return (
        <PricingPageComponent
            dict={dict}
            onNavigate={handleNavigate}
        />
    );
}
