'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  BookOpen,
  Award,
  MessageSquare,
  X,
  Loader2
} from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { notificationsApi } from '@/lib/api/notifications';
import type { Notification } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';

type NotificationsPanelProps = {
  dict: Dictionary;
  locale?: string;
};

export function NotificationsPanel({ dict, locale = 'ru' }: NotificationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const dateLocale = locale === 'ru' ? ru : enUS;

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const [notifsRes, countRes] = await Promise.all([
        notificationsApi.getNotifications({ limit: 20 }),
        notificationsApi.getUnreadCount()
      ]);

      if (notifsRes.success && notifsRes.data) {
        setNotifications(notifsRes.data.data);
      }
      if (countRes.success && countRes.data) {
        setUnreadCount(countRes.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Первичная загрузка и интервал
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(async () => {
      const res = await notificationsApi.getUnreadCount();
      if (res.success && res.data) {
        setUnreadCount(res.data.count);
      }
    }, 60000); // Раз в минуту проверяем новые

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // При открытии панели обновляем список
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
      case 'course_update':
        return <CheckCheck className="h-5 w-5 text-green-500" />;
      case 'info':
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const markAsRead = async (id: string) => {
    const originalNotifs = [...notifications];
    // Оптимистичное обновление
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    const res = await notificationsApi.markAsRead(id);
    if (!res.success) {
      setNotifications(originalNotifs); // Откат при ошибке
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    const originalNotifs = [...notifications];
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);

    const res = await notificationsApi.markAllAsRead();
    if (!res.success) {
      setNotifications(originalNotifs);
      fetchNotifications();
    }
  };

  const removeNotification = async (id: string) => {
    const originalNotifs = [...notifications];
    const target = notifications.find(n => n.id === id);

    setNotifications(prev => prev.filter(n => n.id !== id));
    if (target && !target.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    const res = await notificationsApi.deleteNotification(id);
    if (!res.success) {
      setNotifications(originalNotifs);
      fetchNotifications();
    }
  };

  return (
    <div className="relative">
      {/* Notification Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative h-10 w-10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop для мобильных */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Desktop Panel - Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:block absolute right-0 top-12 w-[90vw] sm:w-[420px] xl:w-[480px] z-50"
            >
              <Card className="shadow-2xl border-2 max-h-[calc(100vh-100px)] flex flex-col">
                <CardHeader className="pb-3 shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{dict.notifications?.title || 'Уведомления'}</CardTitle>
                    <div className="flex items-center gap-2">
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7"
                          onClick={markAllAsRead}
                        >
                          {dict.notifications?.mark_all_read || 'Прочитать все'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <Separator />

                <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                  {notifications.length === 0 && !isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Bell className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">{dict.notifications?.no_notifications || 'Нет уведомлений'}</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer group relative ${!notification.isRead ? 'bg-primary/5' : ''
                            }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex gap-3">
                            <div className="shrink-0 mt-0.5">
                              {getIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-semibold text-sm leading-tight">
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: dateLocale })}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>

                {notifications.length > 0 && (
                  <>
                    <Separator />
                    <div className="p-2 shrink-0">
                      <Button
                        variant="ghost"
                        className="w-full text-sm h-8"
                        onClick={() => setIsOpen(false)}
                      >
                        {dict.notifications?.view_all || 'Закрыть'}
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            </motion.div>

            {/* Mobile Panel - Bottom Sheet */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col"
              style={{ maxHeight: '85vh' }}
            >
              <Card className="rounded-t-3xl rounded-b-none border-t-2 border-x-0 border-b-0 shadow-2xl flex flex-col h-full overflow-hidden">
                <div className="flex justify-center pt-3 pb-1 shrink-0 touch-none">
                  <div className="w-12 h-1.5 rounded-full bg-muted-foreground/20" />
                </div>

                <CardHeader className="pb-3 border-b shrink-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <CardTitle className="text-lg sm:text-xl truncate">{dict.notifications?.title || 'Уведомления'}</CardTitle>
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="h-5 sm:h-6 px-1.5 sm:px-2 text-xs shrink-0">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 shrink-0"
                        onClick={() => setIsOpen(false)}
                      >
                        <X className="h-4 sm:h-5 w-4 sm:w-5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1 min-h-0 overscroll-contain">
                  {notifications.length === 0 && !isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                      <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-center">{dict.notifications?.no_notifications || 'Нет уведомлений'}</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-3.5 sm:p-5 active:bg-muted/70 transition-colors relative ${!notification.isRead ? 'bg-primary/5' : ''
                            }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex gap-2.5 sm:gap-4">
                            <div className="shrink-0 mt-0.5 sm:mt-1">
                              {getIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-semibold text-sm sm:text-base leading-tight">
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground pt-0.5">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: dateLocale })}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>

                {notifications.length > 0 && (
                  <div className="p-3 sm:p-4 shrink-0 safe-area-inset-bottom border-t">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        className="flex-1 text-sm h-10"
                        onClick={markAllAsRead}
                      >
                        {dict.notifications?.mark_all_read || 'Прочитать все'}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 h-10"
                        onClick={() => setIsOpen(false)}
                      >
                        {dict.notifications?.view_all || 'Закрыть'}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}