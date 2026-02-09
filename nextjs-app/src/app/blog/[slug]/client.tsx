'use client';

import { useAppContext } from '../../providers';
import { BlogPostPage } from '@/components/pages/blog-post-page';
import { useRouter } from 'next/navigation';

export function BlogPostClientWrapper({ slug }: { slug: string }) {
    const { dict, locale } = useAppContext();
    const router = useRouter();

    if (!dict) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    const handleBack = () => {
        router.push('/blog');
    };

    const handleNavigateToPost = (newSlug: string) => {
        router.push(`/blog/${newSlug}`);
    };

    return (
        <BlogPostPage
            slug={slug}
            dict={dict}
            locale={locale}
            onBack={handleBack}
            onNavigateToPost={handleNavigateToPost}
        />
    );
}
