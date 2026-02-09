'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, can't be disabled
    analytics: true,
    marketing: true,
    personalization: true
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after 2 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      ...preferences,
      analytics: true,
      marketing: true,
      personalization: true,
      timestamp: Date.now()
    }));
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
      timestamp: Date.now()
    }));
    setIsVisible(false);
    setShowSettings(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      ...preferences,
      timestamp: Date.now()
    }));
    setIsVisible(false);
    setShowSettings(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop for mobile settings */}
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-black/60 z-50 md:hidden"
            />
          )}

          {/* Desktop version */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 hidden md:block"
          >
            <div className="mx-auto max-w-7xl">
              <div className="relative bg-background/95 backdrop-blur-lg border-2 border-border rounded-2xl shadow-2xl overflow-hidden">
                {/* Decorative gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

                <div className="relative p-6 sm:p-8">
                  {!showSettings ? (
                    // Simple view
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex gap-4 flex-1">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Cookie className="h-6 w-6 text-primary" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg mb-1">
                            Мы используем cookies 🍪
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Мы используем файлы cookie для улучшения вашего опыта, персонализации контента и анализа трафика. 
                            Продолжая использовать сайт, вы соглашаетесь с нашей{' '}
                            <button className="text-primary hover:underline font-medium">
                              Политикой конфиденциальности
                            </button>.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 sm:flex-nowrap w-full sm:w-auto">
                        <Button
                          variant="outline"
                          onClick={() => setShowSettings(true)}
                          className="gap-2 flex-1 sm:flex-initial"
                        >
                          <Settings className="h-4 w-4" />
                          Настроить
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={handleRejectAll}
                          className="flex-1 sm:flex-initial"
                        >
                          Отклонить
                        </Button>
                        <Button
                          onClick={handleAcceptAll}
                          className="flex-1 sm:flex-initial"
                        >
                          Принять все
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Detailed settings view
                    <div>
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h3 className="font-bold text-xl mb-2">
                            Настройки конфиденциальности
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Выберите, какие cookie вы хотите разрешить
                          </p>
                        </div>
                        <button
                          onClick={() => setShowSettings(false)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="space-y-4 mb-6">
                        {/* Necessary cookies */}
                        <div className="flex items-start justify-between p-4 rounded-lg bg-muted/30">
                          <div className="flex-1 pr-4">
                            <Label className="font-semibold text-base cursor-pointer">
                              Необходимые cookie
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Необходимы для работы сайта. Не могут быть отключены.
                            </p>
                          </div>
                          <Switch checked={true} disabled className="mt-1" />
                        </div>

                        {/* Analytics cookies */}
                        <div className="flex items-start justify-between p-4 rounded-lg border border-border">
                          <div className="flex-1 pr-4">
                            <Label htmlFor="analytics" className="font-semibold text-base cursor-pointer">
                              Аналитика
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Помогают понять, как посетители взаимодействуют с сайтом.
                            </p>
                          </div>
                          <Switch
                            id="analytics"
                            checked={preferences.analytics}
                            onCheckedChange={(checked) => 
                              setPreferences(prev => ({ ...prev, analytics: checked }))
                            }
                            className="mt-1"
                          />
                        </div>

                        {/* Marketing cookies */}
                        <div className="flex items-start justify-between p-4 rounded-lg border border-border">
                          <div className="flex-1 pr-4">
                            <Label htmlFor="marketing" className="font-semibold text-base cursor-pointer">
                              Маркетинг
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Используются для отображения релевантной рекламы.
                            </p>
                          </div>
                          <Switch
                            id="marketing"
                            checked={preferences.marketing}
                            onCheckedChange={(checked) => 
                              setPreferences(prev => ({ ...prev, marketing: checked }))
                            }
                            className="mt-1"
                          />
                        </div>

                        {/* Personalization cookies */}
                        <div className="flex items-start justify-between p-4 rounded-lg border border-border">
                          <div className="flex-1 pr-4">
                            <Label htmlFor="personalization" className="font-semibold text-base cursor-pointer">
                              Персонализация
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Позволяют запоминать ваши предпочтения и настройки.
                            </p>
                          </div>
                          <Switch
                            id="personalization"
                            checked={preferences.personalization}
                            onCheckedChange={(checked) => 
                              setPreferences(prev => ({ ...prev, personalization: checked }))
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={handleRejectAll}
                          className="flex-1"
                        >
                          Отклонить все
                        </Button>
                        <Button
                          onClick={handleSavePreferences}
                          className="flex-1"
                        >
                          Сохранить настройки
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mobile version - Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 md:hidden"
          >
            <div className="bg-background border-t-2 border-border rounded-t-3xl shadow-2xl flex flex-col" style={{ maxHeight: '80vh' }}>
              {!showSettings ? (
                // Simple view - Mobile
                <div className="p-4">
                  <div className="flex gap-3 mb-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Cookie className="h-5 w-5 text-primary" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm mb-1">
                        Мы используем cookies 🍪
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Мы используем файлы cookie для улучшения вашего опыта. Продолжая использовать сайт, вы соглашаетесь с нашей{' '}
                        <button className="text-primary hover:underline font-medium">
                          Политикой
                        </button>
                        .
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowSettings(true)}
                      className="w-full gap-2 h-10 text-sm"
                    >
                      <Settings className="h-4 w-4" />
                      Настроить
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        onClick={handleRejectAll}
                        className="flex-1 h-10 text-sm"
                      >
                        Отклонить
                      </Button>
                      <Button
                        onClick={handleAcceptAll}
                        className="flex-1 h-10 text-sm"
                      >
                        Принять
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // Settings view - Mobile with proper scroll
                <div className="flex flex-col h-full" style={{ maxHeight: '80vh' }}>
                  {/* Header - Fixed */}
                  <div className="p-4 border-b border-border flex-shrink-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-2">
                        <h3 className="font-bold text-base mb-1">
                          Настройки конфиденциальности
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Выберите, какие cookie разрешить
                        </p>
                      </div>
                      <button
                        onClick={() => setShowSettings(false)}
                        className="p-1.5 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Scrollable content */}
                  <div className="flex-1 overflow-y-auto overscroll-contain">
                    <div className="p-4 space-y-3 pb-2">
                      {/* Necessary cookies */}
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="flex-1 min-w-0">
                          <Label className="font-semibold text-sm block mb-1">
                            Необходимые cookie
                          </Label>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Необходимы для работы сайта.
                          </p>
                        </div>
                        <Switch checked={true} disabled className="flex-shrink-0" />
                      </div>

                      {/* Analytics cookies */}
                      <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                        <div className="flex-1 min-w-0">
                          <Label htmlFor="analytics-mobile" className="font-semibold text-sm block mb-1">
                            Аналитика
                          </Label>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Помогают понять, как посетители взаимодействуют с сайтом.
                          </p>
                        </div>
                        <Switch
                          id="analytics-mobile"
                          checked={preferences.analytics}
                          onCheckedChange={(checked) => 
                            setPreferences(prev => ({ ...prev, analytics: checked }))
                          }
                          className="flex-shrink-0"
                        />
                      </div>

                      {/* Marketing cookies */}
                      <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                        <div className="flex-1 min-w-0">
                          <Label htmlFor="marketing-mobile" className="font-semibold text-sm block mb-1">
                            Маркетинг
                          </Label>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Используются для рекламы.
                          </p>
                        </div>
                        <Switch
                          id="marketing-mobile"
                          checked={preferences.marketing}
                          onCheckedChange={(checked) => 
                            setPreferences(prev => ({ ...prev, marketing: checked }))
                          }
                          className="flex-shrink-0"
                        />
                      </div>

                      {/* Personalization cookies */}
                      <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                        <div className="flex-1 min-w-0">
                          <Label htmlFor="personalization-mobile" className="font-semibold text-sm block mb-1">
                            Персонализация
                          </Label>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Запоминают ваши настройки.
                          </p>
                        </div>
                        <Switch
                          id="personalization-mobile"
                          checked={preferences.personalization}
                          onCheckedChange={(checked) => 
                            setPreferences(prev => ({ ...prev, personalization: checked }))
                          }
                          className="flex-shrink-0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer buttons - Fixed */}
                  <div className="p-4 border-t border-border flex gap-2 flex-shrink-0 bg-background">
                    <Button
                      variant="outline"
                      onClick={handleRejectAll}
                      className="flex-1 h-10 text-sm"
                    >
                      Отклонить все
                    </Button>
                    <Button
                      onClick={handleSavePreferences}
                      className="flex-1 h-10 text-sm"
                    >
                      Сохранить
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
