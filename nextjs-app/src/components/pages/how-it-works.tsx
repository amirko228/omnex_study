'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FadeIn, SlideIn, StaggerContainer, StaggerItem } from '@/components/ui/page-transition';
import { 
  BookOpen, 
  Sparkles, 
  MessageSquare, 
  Award,
  Zap,
  Globe,
  BarChart3,
  Users,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import type { Dictionary } from '@/lib/i18n/dictionaries';

type HowItWorksProps = {
  onNavigate: (page: 'register' | 'catalog') => void;
  dict: Dictionary;
  isAuthenticated?: boolean; // Добавляем проп для статуса аутентификации
};

export function HowItWorks({ onNavigate, dict, isAuthenticated = false }: HowItWorksProps) {
  // Защита от undefined dict
  if (!dict || !dict.howItWorks || !dict.landing || !dict.landing.pricing || !dict.landing.features || !dict.auth || !dict.auth.register) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  // Функция для обработки клика на CTA кнопки
  const handleCTAClick = () => {
    if (isAuthenticated) {
      onNavigate('catalog'); // Если залогинен - в каталог
    } else {
      onNavigate('register'); // Если не залогинен - на регистрацию
    }
  };

  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: dict.howItWorks.features.ai_adaptation_title,
      description: dict.howItWorks.features.ai_adaptation_desc,
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: dict.howItWorks.features.ai_tutor_title,
      description: dict.howItWorks.features.ai_tutor_desc,
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: dict.howItWorks.features.formats_title,
      description: dict.howItWorks.features.formats_desc,
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: dict.howItWorks.features.progress_title,
      description: dict.howItWorks.features.progress_desc,
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: dict.howItWorks.features.languages_title,
      description: dict.howItWorks.features.languages_desc,
      color: "from-red-500 to-rose-500"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: dict.howItWorks.features.certificates_title,
      description: dict.howItWorks.features.certificates_desc,
      color: "from-indigo-500 to-blue-500"
    }
  ];

  const steps = [
    {
      number: "01",
      title: dict.howItWorks.steps.choose_title,
      description: dict.howItWorks.steps.choose_desc,
      action: dict.howItWorks.steps.choose_action
    },
    {
      number: "02",
      title: dict.howItWorks.steps.buy_title,
      description: dict.howItWorks.steps.buy_desc,
      action: null
    },
    {
      number: "03",
      title: dict.howItWorks.steps.format_title,
      description: dict.howItWorks.steps.format_desc,
      action: null
    },
    {
      number: "04",
      title: dict.howItWorks.steps.learn_title,
      description: dict.howItWorks.steps.learn_desc,
      action: null
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20 max-w-7xl">
        {/* Hero Section */}
        <FadeIn>
          <div className="text-center mb-20">
            <Badge className="mb-6" variant="outline">
              <Zap className="h-3 w-3 mr-1" />
              {dict.howItWorks.page_title}
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {dict.landing.hero.title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {dict.landing.hero.subtitle}
            </p>
          </div>
        </FadeIn>

        {/* How It Works Steps */}
        <SlideIn direction="up">
          <div className="mb-24">
            <h2 className="text-3xl font-bold text-center mb-16">{dict.howItWorks.how_to_start}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="relative h-full border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                    <div className="absolute -top-6 left-6">
                      <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg">
                        {step.number}
                      </div>
                    </div>
                    <CardHeader className="pt-10">
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{step.description}</p>
                      {step.action && (
                        <Button 
                          variant="link" 
                          className="p-0 h-auto"
                          onClick={() => onNavigate('catalog')}
                        >
                          {step.action}
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </SlideIn>

        {/* Key Features */}
        <div className="mb-24">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">{dict.landing.features.title}</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {dict.landing.features.subtitle}
              </p>
            </div>
          </FadeIn>

          <StaggerContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <StaggerItem key={index}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
                    <CardHeader>
                      <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        </div>

        {/* Pricing Model */}
        <SlideIn direction="up">
          <Card className="mb-24 border-2 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-12 bg-primary/5">
                <Badge className="mb-4">{dict.landing.pricing.badge}</Badge>
                <h3 className="text-3xl font-bold mb-4">{dict.landing.pricing.title}</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  {dict.landing.pricing.subtitle}
                </p>
                <ul className="space-y-3">
                  {dict.howItWorks.pricing_features.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-12 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    $29-$59
                  </div>
                  <p className="text-xl text-muted-foreground mb-8">
                    {dict.landing.pricing.per_course}
                  </p>
                  <Button 
                    size="lg" 
                    className="text-lg px-8"
                    onClick={() => onNavigate('catalog')}
                  >
                    {dict.landing.pricing.view_courses}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </SlideIn>

        {/* Stats */}
        <FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
            {[
              { value: '50,000+', label: dict.howItWorks.stats.students },
              { value: '200+', label: dict.howItWorks.stats.courses },
              { value: '4.8/5', label: dict.howItWorks.stats.rating },
              { value: '24/7', label: dict.howItWorks.stats.support }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </FadeIn>

        {/* CTA */}
        <SlideIn direction="up">
          <Card className="border-2 border-primary/20 overflow-hidden">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-6 text-primary" />
              <h2 className="text-3xl font-bold mb-4">
                {dict.howItWorks.ready_to_start}
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {dict.howItWorks.join_students}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="text-base md:text-lg px-6 md:px-8 whitespace-normal h-auto py-3 md:py-4"
                  onClick={() => onNavigate('catalog')}
                >
                  <span className="truncate">{dict.howItWorks.steps.choose_action}</span>
                  <ArrowRight className="h-5 w-5 ml-2 shrink-0" />
                </Button>
                {!isAuthenticated && (
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="text-base md:text-lg px-6 md:px-8 whitespace-normal h-auto py-3 md:py-4"
                    onClick={handleCTAClick}
                  >
                    <span className="truncate">{dict.auth.register.title}</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </SlideIn>
      </div>
    </div>
  );
}