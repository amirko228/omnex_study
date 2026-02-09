'use client';

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { getDictionary, type Dictionary } from '@/lib/i18n/dictionaries';
import { mockCourses } from '@/lib/api/mock-data';
import { useAppData } from '@/lib/hooks/useAppData';
import { toast } from 'sonner';

// Layout & Animation
import { MainLayout } from '@/components/layout/MainLayout';

// Page Components (Extracted)
import { EnhancedLanding } from '@/components/pages/enhanced-landing';
import { LoginPage } from '@/components/auth/login-page';
import { RegisterPage } from '@/components/auth/register-page';
import { DashboardPage } from '@/components/pages/dashboard-page';
import { CoursesPage } from '@/components/pages/courses-page';
import { CourseDetailPage } from '@/components/pages/course-detail-page';
import { LessonPage } from '@/components/pages/lesson-page';
import { SettingsPage } from '@/components/pages/settings-page';
import { ResetPassword } from '@/components/auth/reset-password';
import { HowItWorks } from '@/components/pages/how-it-works';
import { BlogPage } from '@/components/pages/blog-page';
import { BlogPostPage } from '@/components/pages/blog-post-page';
import { HelpCenter } from '@/components/pages/help-center';
import { PrivacyPolicy } from '@/components/pages/privacy-policy';
import { TermsOfService } from '@/components/pages/terms-of-service';
import { NotFoundPage } from '@/components/pages/error-pages';
import { FormatSelection } from '@/components/course/format-selection';
import { CoursesCatalog } from '@/components/pages/courses-catalog';
import { PricingPage } from '@/components/pages/pricing-page';
import { ProgressPage } from '@/components/pages/progress-page';
import { ProfileSettings } from '@/components/profile/profile-settings';

/**
 * Внутренний компонент для доступа к хукам роутера
 */
function AppRoutes({
  dict,
  user,
  isAuthenticated,
  handleLogin,
  handleRegister,
  handleLogout,
  locale,
  setLocale,
  purchasedCourses,
  purchaseCourse,
  selectedFormat,
  setSelectedFormat,
  selectedCourse,
  setSelectedCourse,
  selectedBlogSlug,
  setSelectedBlogSlug
}: any) {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToPage = (page: string) => {
    navigate(`/${page}`);
  };

  return (
    <MainLayout
      dict={dict}
      locale={locale}
      setLocale={setLocale}
      currentPage={location.pathname.substring(1) || 'landing'}
      navigateToPage={navigateToPage}
      user={user}
      isAuthenticated={isAuthenticated}
      handleLogout={handleLogout}
    >
      <Routes>
        <Route path="/" element={<EnhancedLanding dict={dict} onNavigate={navigateToPage} isAuthenticated={isAuthenticated} />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage dict={dict} handleLogin={(e) => { handleLogin(e); navigate('/dashboard'); }} setCurrentPage={navigateToPage} />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage dict={dict} handleRegister={(e) => { handleRegister(e); navigate('/dashboard'); }} setCurrentPage={navigateToPage} />} />
        <Route path="/dashboard" element={isAuthenticated ? <DashboardPage dict={dict} user={user} setCurrentPage={navigateToPage} /> : <Navigate to="/login" />} />
        <Route path="/courses" element={<CoursesPage dict={dict} locale={locale} purchasedCourses={purchasedCourses} setCurrentPage={navigateToPage} setSelectedCourse={setSelectedCourse} />} />
        <Route path="/course-detail" element={<CourseDetailPage dict={dict} selectedCourse={selectedCourse} setCurrentPage={navigateToPage} />} />
        <Route path="/lesson" element={<LessonPage dict={dict} selectedCourse={selectedCourse} selectedFormat={selectedFormat} setSelectedFormat={setSelectedFormat} setCurrentPage={navigateToPage} />} />
        <Route path="/catalog" element={<CoursesCatalog courses={mockCourses} purchasedCourses={purchasedCourses} onPurchaseCourse={purchaseCourse} onViewCourse={(c) => { setSelectedCourse(c); navigate('/course-detail'); }} dict={dict} />} />
        <Route path="/settings" element={isAuthenticated ? <SettingsPage dict={dict} locale={locale} user={user} onDeleteAccount={handleLogout} onLocaleChange={setLocale} /> : <Navigate to="/login" />} />
        <Route path="/pricing" element={<PricingPage dict={dict} onNavigate={navigateToPage} />} />
        <Route path="/progress" element={isAuthenticated ? <ProgressPage dict={dict} locale={locale} onNavigate={navigateToPage} setSelectedCourse={setSelectedCourse} /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <ProfileSettings dict={dict} locale={locale} user={user} /> : <Navigate to="/login" />} />
        <Route path="/blog" element={<BlogPage dict={dict} locale={locale} onNavigateToPost={(slug) => { setSelectedBlogSlug(slug); navigate(`/blog/${slug}`); }} onNavigateToRegister={() => navigateToPage('register')} />} />
        <Route path="/blog/:slug" element={<BlogPostPage slug={selectedBlogSlug} dict={dict} locale={locale} onBack={() => navigate('/blog')} onNavigateToPost={(slug) => { setSelectedBlogSlug(slug); navigate(`/blog/${slug}`); }} />} />
        <Route path="/how-it-works" element={<HowItWorks dict={dict} onNavigate={navigateToPage} isAuthenticated={isAuthenticated} />} />
        <Route path="/help-center" element={<HelpCenter dict={dict} />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy dict={dict} />} />
        <Route path="/terms-of-service" element={<TermsOfService dict={dict} />} />
        <Route path="/reset-password" element={<ResetPassword dict={dict} onBack={() => navigate('/login')} />} />
        <Route path="/format-selection" element={<FormatSelection dict={dict} courseTitle={selectedCourse.title} onBack={() => navigate('/course-detail')} onSelectFormat={(format) => { setSelectedFormat(format); navigate('/lesson'); }} />} />
        {/* Fallback */}
        <Route path="*" element={<NotFoundPage onNavigate={navigateToPage} />} />
      </Routes>
    </MainLayout>
  );
}

export default function App() {
  const appData = useAppData();
  const [dict, setDict] = useState<Dictionary | null>(null);
  const [selectedCourse, setSelectedCourse] = useState(mockCourses[0]);
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const {
    isAuthenticated,
    login,
    logout,
    locale,
    setLocale,
    purchasedCourses,
    purchaseCourse,
    selectedFormat,
    setSelectedFormat,
    getFullUserData
  } = appData;

  const user = getFullUserData();

  // Load dictionary
  useEffect(() => {
    const loadDictionary = async () => {
      const dictionary = await getDictionary(locale);
      setDict(dictionary);
      setIsLoading(false);
    };
    loadDictionary();
  }, [locale]);

  const handleLogout = () => {
    logout();
    toast.success(dict?.toasts?.logout_success);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    login();
  };

  if (!dict || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-primary">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
        Загрузка платформы...
      </div>
    );
  }

  return (
    <Router>
      <AppRoutes
        dict={dict}
        user={user}
        isAuthenticated={isAuthenticated}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
        handleLogout={handleLogout}
        locale={locale}
        setLocale={setLocale}
        purchasedCourses={purchasedCourses}
        purchaseCourse={purchaseCourse}
        selectedFormat={selectedFormat}
        setSelectedFormat={setSelectedFormat}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        selectedBlogSlug={selectedBlogSlug}
        setSelectedBlogSlug={setSelectedBlogSlug}
      />
    </Router>
  );
}