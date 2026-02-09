'use client';

import { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/dictionaries';

type Notification = {
  id: string;
  type: 'info' | 'success' | 'warning' | 'message';
  title: string;
  description: string;
  time: string;
  read: boolean;
};

type NotificationsPanelProps = {
  dict: Dictionary;
};

export function NotificationsPanel({ dict }: NotificationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Обновляем уведомления при изменении словаря (языка)
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        title: dict?.notifications?.lesson_completed || 'Lesson completed!',
        description: dict?.notifications?.lesson_completed_desc || 'Congratulations! You completed a lesson',
        time: dict?.notifications?.time_5min || '5 minutes ago',
        read: false
      },
      {
        id: '2',
        type: 'message',
        title: dict?.notifications?.ai_message || 'New message from AI mentor',
        description: dict?.notifications?.ai_message_desc || 'You have a new answer',
        time: dict?.notifications?.time_1hour || '1 hour ago',
        read: false
      },
      {
        id: '3',
        type: 'info',
        title: dict?.notifications?.new_course || 'New course available',
        description: dict?.notifications?.new_course_desc || 'A new course is available',
        time: dict?.notifications?.time_2hours || '2 hours ago',
        read: true
      },
      {
        id: '4',
        type: 'warning',
        title: dict?.notifications?.deadline_reminder || 'Deadline reminder',
        description: dict?.notifications?.deadline_reminder_desc || 'Deadline approaching',
        time: dict?.notifications?.time_5hours || '5 hours ago',
        read: true
      },
      // Дополнительные уведомления для демонстрации прокрутки
      {
        id: '5',
        type: 'success',
        title: dict?.notifications?.lesson_completed || 'Lesson completed!',
        description: 'Great job on completing "JavaScript Advanced Concepts"',
        time: '1 day ago',
        read: true
      },
      {
        id: '6',
        type: 'message',
        title: dict?.notifications?.ai_message || 'New message from AI mentor',
        description: 'Your question about React Hooks has been answered',
        time: '1 day ago',
        read: true
      },
      {
        id: '7',
        type: 'info',
        title: 'New feature available',
        description: 'Try our new interactive coding playground!',
        time: '2 days ago',
        read: true
      },
      {
        id: '8',
        type: 'success',
        title: 'Certificate earned!',
        description: 'You earned a certificate for completing Python Basics',
        time: '3 days ago',
        read: true
      }
    ];
    setNotifications(mockNotifications);
  }, [dict]); // Пересоздаем уведомления при изменении словаря

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
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

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
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
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white"
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
                    <CardTitle className="text-lg">{dict.notifications.title}</CardTitle>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7"
                        onClick={markAllAsRead}
                      >
                        {dict.notifications.mark_all_read}
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <Separator />

                <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Bell className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">{dict.notifications.no_notifications}</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer group relative ${
                            !notification.read ? 'bg-primary/5' : ''
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
                                {!notification.read && (
                                  <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {notification.description}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{notification.time}</span>
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
                        {dict.notifications.view_all}
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
              style={{ maxHeight: 'min(85vh, calc(100vh - 60px))' }}
            >
              <Card className="rounded-t-3xl rounded-b-none border-t-2 border-x-0 border-b-0 shadow-2xl flex flex-col h-full overflow-hidden">
                {/* Drag Handle */}
                <div className="flex justify-center pt-3 pb-1 shrink-0 touch-none">
                  <div className="w-12 h-1.5 rounded-full bg-muted-foreground/20" />
                </div>

                {/* Header */}
                <CardHeader className="pb-3 border-b shrink-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <CardTitle className="text-lg sm:text-xl truncate">{dict.notifications.title}</CardTitle>
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="h-5 sm:h-6 px-1.5 sm:px-2 text-xs shrink-0">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 sm:h-8 px-1.5 sm:px-2"
                          onClick={markAllAsRead}
                        >
                          <CheckCheck className="h-3.5 sm:h-4 w-3.5 sm:w-4 sm:mr-1" />
                          <span className="hidden xs:inline text-xs">{dict.notifications.mark_all_read}</span>
                        </Button>
                      )}
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

                {/* Content - Scrollable with improved scroll */}
                <CardContent className="p-0 overflow-y-auto overflow-x-hidden custom-scrollbar flex-1 min-h-0 overscroll-contain -webkit-overflow-scrolling-touch">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-muted flex items-center justify-center mb-3 sm:mb-4">
                        <Bell className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                      </div>
                      <p className="text-sm sm:text-base text-muted-foreground text-center">{dict.notifications.no_notifications}</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-3.5 sm:p-5 active:bg-muted/70 transition-colors relative touch-manipulation ${
                            !notification.read ? 'bg-primary/5' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex gap-2.5 sm:gap-4">
                            <div className="shrink-0 mt-0.5 sm:mt-1">
                              {getIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-semibold text-sm sm:text-base leading-tight pr-1">
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <div className="h-2 sm:h-2.5 w-2 sm:w-2.5 rounded-full bg-primary shrink-0 mt-1 sm:mt-1.5" />
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pr-6 sm:pr-0">
                                {notification.description}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground pt-0.5">
                                <Clock className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                                <span>{notification.time}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 sm:h-9 sm:w-9 shrink-0 touch-manipulation active:bg-muted"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                            >
                              <X className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>

                {/* Footer */}
                {notifications.length > 0 && (
                  <>
                    <Separator />
                    <div className="p-3 sm:p-4 shrink-0 safe-area-inset-bottom">
                      <Button
                        variant="outline"
                        className="w-full h-10 sm:h-11 text-sm sm:text-base"
                        onClick={() => setIsOpen(false)}
                      >
                        {dict.notifications.view_all}
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}