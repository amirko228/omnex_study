'use client';

import { motion } from 'motion/react';
import { ScaleIn } from '@/components/ui/page-transition';
import { Button } from '@/components/ui/button';
import { Sparkles, Target, ArrowRight } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/dictionaries';

type CTASectionProps = {
    dict: Dictionary;
    handleCTAClick: () => void;
};

export function CTASection({ dict, handleCTAClick }: CTASectionProps) {
    return (
        <section className="border-t bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16 relative overflow-hidden">
            {/* Multiple animated layers */}
            <motion.div
                className="absolute inset-0"
                animate={{
                    background: [
                        'radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.15) 0%, transparent 50%)',
                        'radial-gradient(circle at 80% 50%, hsl(var(--primary) / 0.15) 0%, transparent 50%)',
                        'radial-gradient(circle at 50% 80%, hsl(var(--primary) / 0.15) 0%, transparent 50%)',
                        'radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.15) 0%, transparent 50%)',
                    ]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            <div className="container mx-auto px-4 relative z-10">
                <ScaleIn>
                    <div className="mx-auto max-w-4xl text-center">
                        <motion.div
                            className="mb-10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-2 border-primary/30 backdrop-blur-md shadow-xl">
                                <motion.div
                                    animate={{
                                        rotate: [0, 10, -10, 0],
                                        scale: [1, 1.2, 1]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <Sparkles className="h-6 w-6 text-primary" />
                                </motion.div>
                                <div className="text-left">
                                    <div className="text-xs font-semibold text-primary/70 uppercase tracking-wider mb-1">
                                        Присоединяйтесь к нам
                                    </div>
                                    <div className="text-lg font-bold text-primary">
                                        {dict.landing.cta_footer?.title || 'Ready to Transform?'}
                                    </div>
                                </div>
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: 1
                                    }}
                                >
                                    <Target className="h-6 w-6 text-primary" />
                                </motion.div>
                            </div>
                        </motion.div>
                        <motion.h2
                            className="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
                            animate={{
                                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                            }}
                            style={{
                                backgroundImage: 'linear-gradient(90deg, currentColor 0%, hsl(var(--primary)) 50%, currentColor 100%)',
                                backgroundSize: '200% 100%',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        >
                            {dict.landing.cta_footer?.subtitle.split('.')[0] || 'Start your learning journey'}
                        </motion.h2>
                        <motion.p
                            className="mb-12 text-xl md:text-2xl text-muted-foreground leading-relaxed"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            {dict.landing.cta_footer?.subtitle || 'Join 50,000+ students already learning with AI.'}
                        </motion.p>
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: [0, -2, 2, 0] }}
                            whileTap={{ scale: 0.9 }}
                            animate={{
                                y: [0, -10, 0],
                            }}
                            transition={{
                                y: { duration: 2, repeat: Infinity }
                            }}
                            className="inline-block"
                        >
                            <Button
                                size="lg"
                                onClick={handleCTAClick}
                                className="px-12 h-16 text-xl shadow-2xl shadow-primary/30 rounded-full font-bold relative overflow-hidden group"
                            >
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                    animate={{
                                        x: ['-200%', '200%']
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatDelay: 0.5
                                    }}
                                />
                                <span className="relative z-10">{dict.landing.hero.cta}</span>
                                <motion.div
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="relative z-10"
                                >
                                    <ArrowRight className="ml-3 h-6 w-6" />
                                </motion.div>
                            </Button>
                        </motion.div>
                        <motion.p
                            className="mt-8 text-muted-foreground font-medium"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            {dict.landing.cta_footer?.note || 'Start learning in under 2 minutes • Cancel anytime'}
                        </motion.p>
                    </div>
                </ScaleIn>
            </div>
        </section>
    );
}
