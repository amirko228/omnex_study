'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, GraduationCap, Globe, Moon, Sun, User, LogOut, Settings, Menu, X } from 'lucide-react';
import { useTheme } from '@/lib/theme/theme-provider';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import { localeNames } from '@/lib/i18n/config';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationsPanel } from '@/components/layout/notifications-panel';
import { OmnexLogo } from '@/components/layout/omnex-logo';

type Page = string;

type NavbarProps = {
  dict: Dictionary;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  user?: any;
  isPublic?: boolean;
  onLogout: () => void;
};

export function Navbar({
  dict,
  locale,
  setLocale,
  currentPage,
  setCurrentPage,
  user,
  isPublic = false,
  onLogout
}: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setIsMenuOpen(false); // Close mobile menu
  };

  const handleFeaturesClick = () => {
    if (currentPage === 'landing') {
      const featuresElement = document.getElementById('features');
      if (featuresElement) {
        featuresElement.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setCurrentPage('');
      setTimeout(() => {
        const featuresElement = document.getElementById('features');
        if (featuresElement) {
          featuresElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setCurrentPage('')}
            className="hover:opacity-80 transition-opacity"
          >
            <OmnexLogo />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10">
            <button
              onClick={() => setCurrentPage('courses')}
              className={`text-sm transition-colors hover:text-foreground ${currentPage === 'courses' ? 'text-foreground font-semibold' : 'text-muted-foreground'
                }`}
            >
              {dict.nav.courses}
            </button>
            <button
              onClick={() => setCurrentPage('catalog')}
              className={`text-sm transition-colors hover:text-foreground ${currentPage === 'catalog' ? 'text-foreground font-semibold' : 'text-muted-foreground'
                }`}
            >
              {dict.nav.catalog}
            </button>
            <button
              onClick={() => setCurrentPage('blog')}
              className={`text-sm transition-colors hover:text-foreground ${currentPage === 'blog' || currentPage === 'blog-post' ? 'text-foreground font-semibold' : 'text-muted-foreground'
                }`}
            >
              {dict.nav.blog}
            </button>
            <button
              onClick={handleFeaturesClick}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {dict.nav.features}
            </button>
            <button
              onClick={() => setCurrentPage('help-center')}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {dict.nav.help_center}
            </button>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9 shrink-0"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Language switcher - hidden on small mobile */}
          <div className="hidden sm:flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 px-3 gap-2 shrink-0">
                  <Globe className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase">{locale}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>{dict.settings.language}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(localeNames).map(([key, name]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={(e) => {
                      e.preventDefault();
                      setLocale(key as Locale);
                      toast.success(`Language changed to ${name}`);
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{name}</span>
                      {locale === key && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Theme switcher - hidden on small mobile */}
          <div className="hidden sm:flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    setTheme('light');
                    toast.success('Light theme activated');
                  }}
                  className="cursor-pointer"
                >
                  <Sun className="mr-2 h-4 w-4" />
                  <span>{dict.settings.theme_light}</span>
                  {theme === 'light' && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    setTheme('dark');
                    toast.success('Dark theme activated');
                  }}
                  className="cursor-pointer"
                >
                  <Moon className="mr-2 h-4 w-4" />
                  <span>{dict.settings.theme_dark}</span>
                  {theme === 'dark' && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    setTheme('system');
                    toast.success('System theme activated');
                  }}
                  className="cursor-pointer"
                >
                  <Sun className="mr-2 h-4 w-4 dark:hidden" />
                  <Moon className="mr-2 h-4 w-4 hidden dark:block" />
                  <span>{dict.settings.theme_system}</span>
                  {theme === 'system' && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop auth buttons */}
          {user ? (
            <div className="hidden lg:flex items-center gap-2">
              {/* Notifications */}
              <NotificationsPanel dict={dict} />

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full shrink-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigate('profile');
                    }}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    {dict.nav.profile}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigate('settings');
                    }}
                    className="cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    {dict.nav.settings}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      onLogout();
                    }}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {dict.nav.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCurrentPage('login')} className="h-9 shrink-0">
                {dict.nav.login}
              </Button>
              <Button size="sm" onClick={() => setCurrentPage('register')} className="h-9 shrink-0">
                {dict.nav.signup}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              {/* Navigation Links */}
              <button
                onClick={() => handleNavigate('courses')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${currentPage === 'courses'
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'hover:bg-muted text-foreground'
                  }`}
              >
                {dict.nav.courses}
              </button>
              <button
                onClick={() => handleNavigate('catalog')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${currentPage === 'catalog'
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'hover:bg-muted text-foreground'
                  }`}
              >
                {dict.nav.catalog}
              </button>
              <button
                onClick={() => handleNavigate('blog')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${currentPage === 'blog' || currentPage === 'blog-post'
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'hover:bg-muted text-foreground'
                  }`}
              >
                {dict.nav.blog}
              </button>
              <button
                onClick={handleFeaturesClick}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted text-foreground transition-colors"
              >
                {dict.nav.features}
              </button>
              <button
                onClick={() => handleNavigate('help-center')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted text-foreground transition-colors"
              >
                {dict.nav.help_center}
              </button>

              <div className="pt-3 border-t border-border">
                {/* Mobile Language & Theme */}
                <div className="flex gap-2 mb-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex-1 gap-2">
                        <Globe className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase">{locale}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuLabel>{dict.settings.language}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {Object.entries(localeNames).map(([key, name]) => (
                        <DropdownMenuItem
                          key={key}
                          onClick={(e) => {
                            e.preventDefault();
                            setLocale(key as Locale);
                            toast.success(`Language changed to ${name}`);
                          }}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{name}</span>
                            {locale === key && <div className="h-2 w-2 rounded-full bg-primary" />}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          setTheme('light');
                          toast.success('Light theme activated');
                        }}
                        className="cursor-pointer"
                      >
                        <Sun className="mr-2 h-4 w-4" />
                        <span>{dict.settings.theme_light}</span>
                        {theme === 'light' && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          setTheme('dark');
                          toast.success('Dark theme activated');
                        }}
                        className="cursor-pointer"
                      >
                        <Moon className="mr-2 h-4 w-4" />
                        <span>{dict.settings.theme_dark}</span>
                        {theme === 'dark' && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          setTheme('system');
                          toast.success('System theme activated');
                        }}
                        className="cursor-pointer"
                      >
                        <Sun className="mr-2 h-4 w-4 dark:hidden" />
                        <Moon className="mr-2 h-4 w-4 hidden dark:block" />
                        <span>{dict.settings.theme_system}</span>
                        {theme === 'system' && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Auth Buttons / User Menu */}
                {user ? (
                  <div className="space-y-2">
                    {/* User Info */}
                    <div className="px-4 py-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Notifications - показываем на lg и ниже */}
                    <div className="lg:hidden px-2">
                      <NotificationsPanel dict={dict} />
                    </div>

                    {/* User Actions */}
                    <button
                      onClick={() => handleNavigate('profile')}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      {dict.nav.profile}
                    </button>
                    <button
                      onClick={() => handleNavigate('settings')}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      {dict.nav.settings}
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-destructive/10 text-destructive transition-colors flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      {dict.nav.logout}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleNavigate('login')}
                    >
                      {dict.nav.login}
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => handleNavigate('register')}
                    >
                      {dict.nav.signup}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}