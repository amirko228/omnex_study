'use client';

import { useAppContext } from '../providers';
import { BlogPage as BlogPageComponent } from '@/components/pages/blog-page';
import { useRouter } from 'next/navigation';

export default function BlogPage() {
    const { dict, locale, isAuthenticated } = useAppContext();
    const router = useRouter();

    if (!dict) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    const handleNavigateToPost = (slug: string) => {
        router.push(`/blog/${slug}`);
    };

    const handleNavigateToRegister = () => {
        if (isAuthenticated) {
            router.push('/dashboard');
        } else {
            router.push('/register');
        }
    };

    return (
        <BlogPageComponent
            dict={dict}
            locale={locale}
            onNavigateToPost={handleNavigateToPost}
            onNavigateToRegister={handleNavigateToRegister}
            isAuthenticated={isAuthenticated}
        />
    );
}
