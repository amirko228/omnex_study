'use client';

import { motion } from 'motion/react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/page-transition';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Sparkles, ArrowRight } from 'lucide-react';
import { AnimatedCard } from '@/components/ui/animated-elements';
import { CardHeader, CardTitle } from '@/components/ui/card';
import type { Dictionary } from '@/lib/i18n/dictionaries';

type BlogPreviewSectionProps = {
    dict: Dictionary;
    onNavigate: (page: 'blog') => void;
};

export function BlogPreviewSection({ dict, onNavigate }: BlogPreviewSectionProps) {
    return (
        <section className="py-16 md:py-20 bg-gradient-to-b from-background to-muted/20">
            <div className="container mx-auto px-4">
                <FadeIn>
                    <div className="text-center mb-12">
                        <Badge variant="secondary" className="mb-4">
                            <Sparkles className="h-3 w-3 mr-1.5" />
                            {dict.landingBlog.badge}
                        </Badge>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            {dict.landingBlog.title}
                        </h2>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                            {dict.landingBlog.subtitle}
                        </p>
                    </div>
                </FadeIn>

                <StaggerContainer>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-10">
                        {/* Preview articles - mock data */}
                        {[
                            {
                                title: dict.landingBlog.article1_title,
                                excerpt: dict.landingBlog.article1_excerpt,
                                image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
                                category: dict.landingBlog.article1_category
                            },
                            {
                                title: dict.landingBlog.article2_title,
                                excerpt: dict.landingBlog.article2_excerpt,
                                image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&h=400&fit=crop',
                                category: dict.landingBlog.article2_category
                            },
                            {
                                title: dict.landingBlog.article3_title,
                                excerpt: dict.landingBlog.article3_excerpt,
                                image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop',
                                category: dict.landingBlog.article3_category
                            }
                        ].map((article, index) => (
                            <StaggerItem key={index}>
                                <motion.div
                                    whileHover={{ y: -8 }}
                                    transition={{ duration: 0.3 }}
                                    className="h-full"
                                >
                                    <AnimatedCard hoverable className="overflow-hidden cursor-pointer h-full flex flex-col" onClick={() => onNavigate('blog')}>
                                        <div className="relative aspect-video overflow-hidden bg-muted">
                                            <Image
                                                src={article.image || '/placeholder-blog.jpg'}
                                                alt={article.title}
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute top-3 left-3">
                                                <Badge variant="secondary" className="text-xs">
                                                    {article.category}
                                                </Badge>
                                            </div>
                                        </div>
                                        <CardHeader className="flex-1">
                                            <CardTitle className="text-lg md:text-xl leading-tight line-clamp-2">
                                                {article.title}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                                {article.excerpt}
                                            </p>
                                        </CardHeader>
                                    </AnimatedCard>
                                </motion.div>
                            </StaggerItem>
                        ))}
                    </div>
                </StaggerContainer>

                <div className="text-center">
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={() => onNavigate('blog')}
                        className="group"
                    >
                        {dict.landingBlog.read_all}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>
        </section>
    );
}
