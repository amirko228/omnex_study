'use client';

import { useEffect } from 'react';
import type { Locale } from '@/lib/i18n/config';

type SEOHeadProps = {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  locale?: Locale;
  type?: 'website' | 'article';
};

export function SEOHead({
  title = 'OMNEX STUDY - AI-Powered Learning Platform',
  description = 'Master new skills with AI-powered personalized courses. Learn coding, design, business and more with adaptive learning paths and 24/7 AI tutor support.',
  keywords = 'online learning, AI courses, personalized education, programming courses, online education platform, AI tutor, skill development',
  image = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&fit=crop',
  url = 'https://ailearning.com',
  locale = 'en',
  type = 'website'
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (property: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attribute}="${property}"]`);
      
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, property);
        document.head.appendChild(tag);
      }
      
      tag.setAttribute('content', content);
    };

    // Basic SEO tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('language', locale);
    updateMetaTag('author', 'OMNEX STUDY');

    // Open Graph tags for social sharing
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:locale', locale, true);
    updateMetaTag('og:site_name', 'OMNEX STUDY', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // Structured data for rich snippets
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'OMNEX STUDY',
      description: description,
      url: url,
      logo: image,
      sameAs: [
        'https://twitter.com/ailearning',
        'https://linkedin.com/company/ailearning',
        'https://instagram.com/ailearning'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-800-LEARN-AI',
        contactType: 'customer service',
        availableLanguage: ['en', 'ru', 'de', 'es', 'fr']
      },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: '0',
        highPrice: '19',
        offerCount: '1000+'
      }
    };

    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(structuredData);
  }, [title, description, keywords, image, url, locale, type]);

  return null;
}