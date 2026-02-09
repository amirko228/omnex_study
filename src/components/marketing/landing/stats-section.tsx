'use client';

import { motion } from 'motion/react';
import { StaggerContainer, StaggerItem } from '@/components/ui/page-transition';
import type { Dictionary } from '@/lib/i18n/dictionaries';

type StatsSectionProps = {
    dict: Dictionary;
};

export function StatsSection({ dict }: StatsSectionProps) {
    return (
        <section className="border-b border-border py-16 bg-muted/30 relative overflow-hidden">
            {/* Animated background */}
            <motion.div
                className="absolute inset-0 opacity-30"
                animate={{
                    backgroundPosition: ['0% 0%', '100% 100%']
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: "reverse"
                }}
                style={{
                    backgroundImage: 'radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, hsl(var(--primary) / 0.1) 0%, transparent 50%)'
                }}
            />

            <div className="container mx-auto px-4 relative z-10">
                <StaggerContainer>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {[
                            { value: '50K+', label: dict.landing.stats.students, delay: 0 },
                            { value: '1,200+', label: dict.landing.stats.courses, delay: 0.1 },
                            { value: '94%', label: dict.landing.stats.completion, delay: 0.2 },
                            { value: '4.9', label: 'Average Rating', delay: 0.3 }
                        ].map((stat, i) => (
                            <StaggerItem key={i}>
                                <motion.div
                                    whileHover={{ y: -10, scale: 1.05, rotate: [0, -2, 2, 0] }}
                                    transition={{ duration: 0.3 }}
                                    className="text-center p-4 md:p-6 rounded-2xl bg-background border shadow-sm hover:shadow-xl transition-all overflow-hidden"
                                >
                                    <motion.p
                                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ type: "spring", stiffness: 100, delay: stat.delay }}
                                        whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
                                        className="mb-2 text-3xl md:text-4xl lg:text-5xl font-bold text-primary tracking-tighter cursor-default"
                                    >
                                        {stat.value}
                                    </motion.p>
                                    <p className="text-muted-foreground font-medium text-xs md:text-sm lg:text-base break-words leading-tight px-1">
                                        {stat.label}
                                    </p>
                                </motion.div>
                            </StaggerItem>
                        ))}
                    </div>
                </StaggerContainer>
            </div>
        </section>
    );
}
