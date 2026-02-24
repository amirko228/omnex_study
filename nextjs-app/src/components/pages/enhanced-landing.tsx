'use client';

import { PageTransition } from '@/components/ui/page-transition';
import { TrustBadges } from '@/components/marketing/trust-badges';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { HeroSection } from '@/components/marketing/landing/hero-section';
import { StatsSection } from '@/components/marketing/landing/stats-section';
import { BlogPreviewSection } from '@/components/marketing/landing/blog-preview-section';
import { FeaturesSection } from '@/components/marketing/landing/features-section';
import { HowItWorksSection } from '@/components/marketing/landing/how-it-works-section';
import { CTASection } from '@/components/marketing/landing/cta-section';

type EnhancedLandingProps = {
  dict: Dictionary;
  onNavigate: (page: 'register' | 'catalog' | 'how-it-works' | 'blog') => void;
  isAuthenticated?: boolean;
};

export function EnhancedLanding({ dict, onNavigate, isAuthenticated = false }: EnhancedLandingProps) {

  // Функция для обработки клика на CTA кнопки
  const handleCTAClick = () => {
    if (isAuthenticated) {
      onNavigate('catalog'); // Если залогинен - в каталог
    } else {
      onNavigate('register'); // Если не залогинен - на регистрацию
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col w-full overflow-hidden">
        {/* Hero Section */}
        <HeroSection
          dict={dict}
          onNavigate={onNavigate}
          isAuthenticated={isAuthenticated}
          handleCTAClick={handleCTAClick}
        />

        {/* Stats Section */}
        <StatsSection dict={dict} />

        {/* Trust Badges Section */}
        <TrustBadges dict={dict} />

        {/* Blog Preview Section */}
        <BlogPreviewSection dict={dict} onNavigate={onNavigate} />

        {/* Features Section */}
        <FeaturesSection dict={dict} />

        {/* How It Works Section */}
        <HowItWorksSection dict={dict} />

        {/* CTA Section */}
        <CTASection dict={dict} handleCTAClick={handleCTAClick} />
      </div>
    </PageTransition>
  );
}