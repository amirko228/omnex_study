'use client';

import { motion } from 'motion/react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/page-transition';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { AnimatedCard } from '@/components/ui/animated-elements';
import type { Dictionary } from '@/lib/i18n/dictionaries';

type TestimonialsSectionProps = {
    dict: Dictionary;
};

export function TestimonialsSection({ dict }: TestimonialsSectionProps) {
    return (
        <section className="py-16 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <FadeIn>
                    <div className="mb-12 text-center">
                        <Badge className="mb-4" variant="outline">Testimonials</Badge>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">{dict.landing.testimonials?.title || 'Loved by Learners'}</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            {dict.landing.testimonials?.subtitle || 'Join thousands of successful students transforming their careers'}
                        </p>
                    </div>
                </FadeIn>

                <StaggerContainer>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {dict.landing.testimonials?.items.map((testimonial: { name: string; role: string; text: string }, i: number) => (
                            <StaggerItem key={i}>
                                <motion.div
                                    whileHover={{
                                        y: -10,
                                        scale: 1.02,
                                        rotate: [0, -1, 1, 0]
                                    }}
                                    className="h-full"
                                >
                                    <AnimatedCard className="h-full p-8 hover:shadow-2xl transition-shadow border-none bg-card/80 backdrop-blur-sm ring-1 ring-border/50">
                                        <motion.div
                                            className="flex items-center gap-4 mb-6"
                                            whileHover={{ x: 5 }}
                                        >
                                            <motion.div
                                                className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md"
                                                whileHover={{ rotate: 360, scale: 1.1 }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                {testimonial.name.charAt(0)}
                                            </motion.div>
                                            <div>
                                                <div className="font-bold text-lg">{testimonial.name}</div>
                                                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                                            </div>
                                        </motion.div>
                                        <div className="flex gap-1 mb-4">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <motion.div
                                                    key={star}
                                                    initial={{ scale: 0, rotate: -180 }}
                                                    whileInView={{ scale: 1, rotate: 0 }}
                                                    transition={{ delay: star * 0.1, type: "spring" }}
                                                    viewport={{ once: true }}
                                                    whileHover={{ scale: 1.2, rotate: 15 }}
                                                >
                                                    <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                                                </motion.div>
                                            ))}
                                        </div>
                                        <motion.p
                                            className="text-muted-foreground leading-relaxed italic"
                                            whileHover={{ x: 5 }}
                                        >
                                            "{testimonial.text}"
                                        </motion.p>
                                    </AnimatedCard>
                                </motion.div>
                            </StaggerItem>
                        ))}
                    </div>
                </StaggerContainer>
            </div>
        </section>
    );
}
