'use client';

import { motion } from 'motion/react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/page-transition';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, BarChart3, Globe } from 'lucide-react';
import { AnimatedCard } from '@/components/ui/animated-elements';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { Dictionary } from '@/lib/i18n/dictionaries';

type FeaturesSectionProps = {
    dict: Dictionary;
};

export function FeaturesSection({ dict }: FeaturesSectionProps) {
    return (
        <section id="features" className="py-16 relative overflow-hidden">
            {/* Animated grid background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }} />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <FadeIn>
                    <div className="mb-12 text-center">
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                            className="inline-block"
                        >
                            <Badge className="mb-4" variant="outline">Features</Badge>
                        </motion.div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">{dict.landing.features.title}</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            {dict.landing.features.subtitle}
                        </p>
                    </div>
                </FadeIn>

                <StaggerContainer>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            { icon: Brain, color: 'from-primary to-primary/50', title: dict.landing.features.ai_tutor.title, desc: dict.landing.features.ai_tutor.description },
                            { icon: Sparkles, color: 'from-purple-500 to-purple-500/50', title: dict.landing.features.personalized.title, desc: dict.landing.features.personalized.description },
                            { icon: BarChart3, color: 'from-blue-500 to-blue-500/50', title: dict.landing.features.progress.title, desc: dict.landing.features.progress.description },
                            { icon: Globe, color: 'from-green-500 to-green-500/50', title: dict.landing.features.multilingual.title, desc: dict.landing.features.multilingual.description }
                        ].map((feature, i) => (
                            <StaggerItem key={i}>
                                <AnimatedCard hoverable className="h-full border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors group overflow-hidden">
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        initial={{ scale: 0, borderRadius: '100%' }}
                                        whileHover={{ scale: 2, borderRadius: '0%' }}
                                        transition={{ duration: 0.5 }}
                                    />
                                    <CardHeader className="relative z-10">
                                        <motion.div
                                            whileHover={{
                                                rotate: 360,
                                                scale: 1.2,
                                                y: [-5, 5, -5]
                                            }}
                                            transition={{
                                                rotate: { duration: 0.6 },
                                                y: { duration: 0.3, repeat: Infinity }
                                            }}
                                            className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg text-white relative`}
                                        >
                                            <motion.div
                                                animate={{
                                                    boxShadow: [
                                                        '0 0 0 0 rgba(var(--primary), 0.4)',
                                                        '0 0 0 20px rgba(var(--primary), 0)',
                                                    ]
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                }}
                                                className="absolute inset-0 rounded-2xl"
                                            />
                                            <feature.icon className="h-7 w-7 relative z-10" />
                                        </motion.div>
                                        <CardTitle className="text-xl mb-3 leading-tight overflow-wrap-anywhere hyphens-auto">
                                            {feature.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="relative z-10">
                                        <p className="text-muted-foreground leading-relaxed text-base">
                                            {feature.desc}
                                        </p>
                                    </CardContent>
                                </AnimatedCard>
                            </StaggerItem>
                        ))}
                    </div>
                </StaggerContainer>
            </div>
        </section>
    );
}
