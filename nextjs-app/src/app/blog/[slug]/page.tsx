'use client';

import { useAppContext } from '../../providers';
import { BlogPostPage as BlogPostPageComponent } from '@/components/pages/blog-post-page';
import { useRouter, useParams } from 'next/navigation';
import type { Metadata } from 'next';
import { blogPosts } from '../../../lib/ai/blog-data';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    // In a real app, fetch data from API
    const post = blogPosts.find((p: { slug: string }) => p.slug === params.slug);

    if (!post) {
        return {
            title: 'Post Not Found',
        };
    }

    return {
        title: `${post.title} | Omnex Study`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.date,
            authors: [post.author.name],
        },
    };
}

export default function BlogPostPage() {
    const { dict, locale } = useAppContext();
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;

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
        <BlogPostPageComponent
            slug={slug}
            dict={dict}
            locale={locale}
            onBack={handleBack}
            onNavigateToPost={handleNavigateToPost}
        />
    );
}
