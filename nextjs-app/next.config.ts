import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,

  // Конфигурация оптимизации изображений
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.githubusercontent.com',
        pathname: '/**',
      },
    ],
    // Форматы изображений для оптимизации
    formats: ['image/avif', 'image/webp'],
    // Размеры изображений для генерации
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Экспериментальные функции отключены для стабильности
  // Экспериментальные функции отключены для стабильности
  experimental: {
    // optimizeCss: true, // Вызывает задержки в dev режиме
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Заголовки безопасности
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

