'use client';

import { useAppContext } from './providers';
import { EnhancedLanding } from '@/components/pages/enhanced-landing';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { dict, isAuthenticated } = useAppContext();
  const router = useRouter();

  if (!dict) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-primary">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
        Загрузка платформы...
      </div>
    );
  }

  const handleNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  return (
    <EnhancedLanding
      dict={dict}
      onNavigate={handleNavigate}
      isAuthenticated={isAuthenticated}
    />
  );
}
