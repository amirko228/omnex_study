'use client';

import { motion } from 'motion/react';
import { FadeIn, SlideIn } from '@/components/ui/page-transition';
import { Badge } from '@/components/ui/badge';
import { MousePointer2, Rocket, Trophy } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/dictionaries';

type HowItWorksSectionProps = {
    dict: Dictionary;
};

export function HowItWorksSection({ dict }: HowItWorksSectionProps) {
    return (
        <section className="py-16 bg-muted/30 border-y relative overflow-hidden">
            {/* Animated wave background */}
            <motion.div
                className="absolute inset-0 opacity-5"
                animate={{
                    x: ['-100%', '0%'],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                }}
                style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, hsl(var(--primary)) 0, hsl(var(--primary)) 10px, transparent 10px, transparent 20px)',
                }}
            />

            <div className="container mx-auto px-4 relative z-10">
                <FadeIn>
                    <div className="mb-12 text-center">
                        <Badge className="mb-4" variant="outline">
                            {dict.landing.how_it_works?.badge || 'Process'}
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">{dict.landing.how_it_works?.title || 'How It Works'}</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            {dict.landing.how_it_works?.subtitle || 'Get started in minutes and accelerate your learning journey'}
                        </p>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                    {[
                        { icon: MousePointer2, step: dict.landing.how_it_works?.steps[0], color: 'from-blue-500 to-blue-600' },
                        { icon: Rocket, step: dict.landing.how_it_works?.steps[1], color: 'from-purple-500 to-purple-600' },
                        { icon: Trophy, step: dict.landing.how_it_works?.steps[2], color: 'from-amber-500 to-amber-600' }
                    ].map((item, index) => (
                        <SlideIn key={index} direction="up" delay={0.1 * (index + 1)}>
                            <motion.div
                                className="text-center group"
                                whileHover={{ scale: 1.05 }}
                            >
                                <motion.div
                                    whileHover={{
                                        scale: 1.15,
                                        rotate: [0, -10, 10, 0],
                                        y: -10
                                    }}
                                    animate={{
                                        y: [0, -10, 0]
                                    }}
                                    transition={{
                                        y: { duration: 2, repeat: Infinity, delay: index * 0.3 }
                                    }}
                                    className={`mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-2xl transition-transform relative overflow-hidden`}
                                >
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"
                                        animate={{
                                            x: ['-100%', '100%']
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatDelay: 1
                                        }}
                                    />
                                    <item.icon className="h-10 w-10 text-white relative z-10" strokeWidth={2.5} />
                                </motion.div>
                                <motion.h3
                                    className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors"
                                    animate={{ opacity: [0.8, 1, 0.8] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                                >
                                    {item.step?.title}
                                </motion.h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {item.step?.description}
                                </p>
                            </motion.div>
                        </SlideIn>
                    ))}
                </div>
            </div>
        </section>
    );
}
