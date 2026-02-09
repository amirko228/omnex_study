'use client';

import { motion } from 'motion/react';
import { FadeIn, SlideIn } from '@/components/ui/page-transition';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/dictionaries';

type HeroSectionProps = {
    dict: Dictionary;
    onNavigate: (page: 'register' | 'catalog' | 'how-it-works' | 'blog') => void;
    isAuthenticated: boolean;
    handleCTAClick: () => void;
};

export function HeroSection({ dict, onNavigate, isAuthenticated, handleCTAClick }: HeroSectionProps) {
    return (
        <section className="relative overflow-hidden border-b border-border py-20 md:py-32 bg-gradient-to-br from-background via-primary/5 to-background">
            {/* Animated background elements with MORE motion */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                {/* Multiple floating blobs - Red theme */}
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, 180, 360],
                        x: [0, 100, 0],
                        y: [0, 50, 0]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [360, 180, 0],
                        x: [0, -50, 0],
                        y: [0, -80, 0]
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/15 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.4, 1],
                        x: [-100, 100, -100],
                        y: [50, -50, 50]
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-1/2 left-1/2 w-72 h-72 bg-primary/10 rounded-full blur-[100px]"
                />
            </div>

            {/* Floating particles - Red theme */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -1000],
                            x: [0, Math.random() * 200 - 100],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: Math.random() * 10 + 10,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                            ease: "linear"
                        }}
                        className="absolute w-1 h-1 bg-primary/40 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            bottom: -10,
                        }}
                    />
                ))}
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="mx-auto max-w-5xl text-center">
                    <FadeIn delay={0.1}>
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
                            transition={{ duration: 0.3 }}
                            className="inline-block"
                        >
                            <Badge className="mb-4 px-4 py-2 text-sm shadow-lg backdrop-blur-sm hover:shadow-primary/50 transition-shadow" variant="secondary">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Sparkles className="mr-2 h-4 w-4 text-primary" />
                                </motion.div>
                                AI-Powered Learning Platform
                            </Badge>
                        </motion.div>
                    </FadeIn>

                    <SlideIn delay={0.2}>
                        <motion.h1
                            className="mb-4 text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text leading-[1.1]"
                            animate={{
                                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        >
                            {dict.landing.hero.title}
                        </motion.h1>
                    </SlideIn>

                    <SlideIn delay={0.3}>
                        <motion.p
                            className="mb-10 text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                            {dict.landing.hero.subtitle}
                        </motion.p>
                    </SlideIn>

                    <SlideIn delay={0.4}>
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center mb-12">
                            <motion.div
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                            >
                                <Button size="lg" onClick={handleCTAClick} className="px-10 h-14 text-lg shadow-xl shadow-primary/20 rounded-full font-semibold relative overflow-hidden group">
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0"
                                        animate={{ x: ['-200%', '200%'] }}
                                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                                    />
                                    <span className="relative z-10">{dict.landing.hero.cta}</span>
                                    <motion.div
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    >
                                        <ArrowRight className="ml-2 h-5 w-5 relative z-10" />
                                    </motion.div>
                                </Button>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button size="lg" variant="outline" onClick={() => onNavigate('how-it-works')} className="px-10 h-14 text-lg rounded-full">
                                    {dict.landing.hero.cta_secondary}
                                </Button>
                            </motion.div>
                        </div>
                    </SlideIn>

                    <FadeIn delay={0.5}>
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground font-medium">
                            {[
                                'No credit card required',
                                '14-day free trial',
                                'Cancel anytime'
                            ].map((text, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-background/50 border shadow-sm"
                                >
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                    >
                                        <Check className="h-4 w-4 text-green-500" />
                                    </motion.div>
                                    <span>{text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
}
