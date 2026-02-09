'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/page-transition';
import { toast } from 'sonner';

interface PricingPageProps {
    dict: any;
    onNavigate: (page: string) => void;
}

export function PricingPage({ dict, onNavigate }: PricingPageProps) {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    const handleSelectPlan = (plan: string) => {
        setSelectedPlan(plan);
        toast.success(`${plan} plan selected! Proceed to registration.`);
        setTimeout(() => onNavigate('register'), 1000);
    };

    return (
        <PageTransition>
            <div className="container mx-auto px-4 py-20">
                <FadeIn>
                    <div className="mb-16 text-center">
                        <h1 className="text-4xl font-bold mb-4">{dict.pricing.title}</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{dict.pricing.subtitle}</p>
                    </div>
                </FadeIn>

                <StaggerContainer>
                    <div className="grid grid-cols-1 gap-10 md:grid-cols-3 items-stretch">
                        {/* Free Plan */}
                        <StaggerItem>
                            <Card className={`h-full border-2 transition-all ${selectedPlan === 'Free' ? 'border-primary ring-2 ring-primary/20' : 'border-transparent shadow-md'}`}>
                                <CardHeader className="text-center">
                                    <CardTitle className="text-2xl font-bold">{dict.pricing.free.name}</CardTitle>
                                    <div className="mt-4">
                                        <span className="text-5xl font-bold">{dict.pricing.free.price}</span>
                                        <span className="text-muted-foreground text-lg">/{dict.pricing.free.period}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex flex-col h-[calc(100%-8rem)]">
                                    <ul className="mb-8 space-y-4 flex-1">
                                        {dict.pricing.free.features.map((feature: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Check className="h-3 w-3 text-primary font-bold" />
                                                </div>
                                                <span className="text-foreground/80">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        variant={selectedPlan === 'Free' ? 'default' : 'outline'}
                                        className="w-full h-12 text-base font-medium mt-auto"
                                        onClick={() => handleSelectPlan('Free')}
                                    >
                                        {dict.pricing.free.cta}
                                    </Button>
                                </CardContent>
                            </Card>
                        </StaggerItem>

                        {/* Pro Plan */}
                        <StaggerItem>
                            <Card className={`h-full border-2 transition-all relative overflow-hidden ${selectedPlan === 'Pro' ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-primary/20 shadow-2xl scale-105 bg-card'}`}>
                                <div className="absolute top-0 right-0">
                                    <div className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-tighter py-1 px-8 rotate-45 translate-x-[25px] translate-y-[10px] shadow-sm">
                                        Most Popular
                                    </div>
                                </div>
                                <CardHeader className="text-center pb-8">
                                    <Badge className="w-fit mx-auto mb-4 bg-primary text-primary-foreground">Recommended</Badge>
                                    <CardTitle className="text-3xl font-bold">{dict.pricing.pro.name}</CardTitle>
                                    <div className="mt-4">
                                        <span className="text-5xl font-bold">{dict.pricing.pro.price}</span>
                                        <span className="text-muted-foreground text-lg">/{dict.pricing.pro.period}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex flex-col h-[calc(100%-10rem)]">
                                    <ul className="mb-10 space-y-4 flex-1">
                                        {dict.pricing.pro.features.map((feature: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                                                    <Check className="h-3 w-3 text-white font-bold" />
                                                </div>
                                                <span className="text-foreground font-medium">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 mt-auto"
                                        onClick={() => handleSelectPlan('Pro')}
                                    >
                                        {dict.pricing.pro.cta}
                                    </Button>
                                </CardContent>
                            </Card>
                        </StaggerItem>

                        {/* Enterprise Plan */}
                        <StaggerItem>
                            <Card className={`h-full border-2 transition-all ${selectedPlan === 'Enterprise' ? 'border-primary ring-2 ring-primary/20' : 'border-transparent shadow-md'}`}>
                                <CardHeader className="text-center">
                                    <CardTitle className="text-2xl font-bold">{dict.pricing.enterprise.name}</CardTitle>
                                    <div className="mt-4">
                                        <span className="text-5xl font-bold">{dict.pricing.enterprise.price}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex flex-col h-[calc(100%-8rem)]">
                                    <ul className="mb-8 space-y-4 flex-1">
                                        {dict.pricing.enterprise.features.map((feature: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Check className="h-3 w-3 text-primary font-bold" />
                                                </div>
                                                <span className="text-foreground/80">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        variant={selectedPlan === 'Enterprise' ? 'default' : 'outline'}
                                        className="w-full h-12 text-base font-medium mt-auto"
                                        onClick={() => handleSelectPlan('Enterprise')}
                                    >
                                        {dict.pricing.enterprise.cta}
                                    </Button>
                                </CardContent>
                            </Card>
                        </StaggerItem>
                    </div>
                </StaggerContainer>
            </div>
        </PageTransition>
    );
}
