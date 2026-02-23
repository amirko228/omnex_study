'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Mail, Bell, Globe, Moon, Shield, Trash2, Key, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { localeNames, type Locale } from '@/lib/i18n/config';
import { useTheme } from '@/lib/theme/theme-provider';
import { FadeIn, SlideIn, StaggerContainer, StaggerItem } from '@/components/ui/page-transition';
import { AnimatedCard } from '@/components/ui/animated-elements';

type SettingsPageProps = {
  dict: Dictionary;
  locale: Locale;
  user: any;
  onDeleteAccount?: () => void;
  onLocaleChange?: (newLocale: Locale) => void;
  refetchUser?: () => void;
};

export function SettingsPage({ dict, locale, user, onDeleteAccount, onLocaleChange, refetchUser }: SettingsPageProps) {
  const { theme, setTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  console.log('[SettingsPage] Current User State:', {
    id: user?.id,
    hasPassword: user?.hasPassword,
    provider: user?.provider // if exists
  });

  const handleChangePassword = async () => {
    console.log('[SettingsPage] handleChangePassword started', { hasPassword: user?.hasPassword });
    if (user?.hasPassword && !currentPassword) {
      toast.error('Введите текущий пароль');
      return;
    }
    if (!newPassword) {
      toast.error('Введите новый пароль');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Новый пароль должен быть минимум 8 символов');
      return;
    }

    setIsChangingPassword(true);
    try {
      const result = await apiClient.post('/auth/change-password', { currentPassword, newPassword });

      if (result.success) {
        toast.success(dict.toasts.password_changed);
        setCurrentPassword('');
        setNewPassword('');
        if (refetchUser) refetchUser();
      } else {
        toast.error(result.error?.message || 'Ошибка смены пароля');
      }
    } catch (err) {
      toast.error('Ошибка смены пароля');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    console.log('[SettingsPage] handleDeleteAccount started', { hasPassword: user?.hasPassword, deletePasswordExist: !!deletePassword });
    if (user?.hasPassword && !deletePassword) {
      toast.error('Введите пароль для подтверждения удаления');
      return;
    }

    setIsDeleting(true);
    try {
      const result = await apiClient.delete('/users/me', { password: deletePassword });

      if (result.success) {
        toast.success(dict.toasts.account_deleted || 'Аккаунт успешно удален');
        apiClient.removeToken();
        if (onDeleteAccount) {
          setTimeout(onDeleteAccount, 2000);
        }
      } else {
        toast.error(result.error?.message || 'Ошибка удаления аккаунта. Проверьте пароль.');
      }
    } catch (err) {
      toast.error('Ошибка при удалении аккаунта');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <FadeIn>
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{dict.settings.title}</h1>
          <p className="text-muted-foreground text-lg">
            {dict.settings?.subtitle || 'Управляйте настройками вашего аккаунта и предпочтениями'}
          </p>
        </div>
      </FadeIn>

      <StaggerContainer className="space-y-6">
        {/* Appearance Settings */}
        <StaggerItem>
          <AnimatedCard hoverable>
            <CardHeader>
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="p-2 rounded-lg bg-primary/10"
                >
                  <Moon className="h-5 w-5 text-primary" />
                </motion.div>
                <div>
                  <CardTitle>{dict.settings.appearance}</CardTitle>
                  <CardDescription>{dict.settings?.appearance_desc || 'Настройте внешний вид платформы'}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Theme */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{dict.settings.theme}</Label>
                  <p className="text-sm text-muted-foreground">{dict.settings?.theme_desc || 'Выберите вашу тему'}</p>
                </div>
                <Select value={theme} onValueChange={(value: any) => {
                  setTheme(value);
                  const themeNames: Record<string, string> = {
                    light: dict.settings.theme_light,
                    dark: dict.settings.theme_dark,
                    system: dict.settings.theme_system
                  };
                  toast.success(dict.settings?.theme_changed_to?.replace('{theme}', themeNames[value]) || `Тема изменена на ${value === 'light' ? 'светлую' : value === 'dark' ? 'темную' : 'системную'}`);
                }}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{dict.settings.theme_light}</SelectItem>
                    <SelectItem value="dark">{dict.settings.theme_dark}</SelectItem>
                    <SelectItem value="system">{dict.settings.theme_system}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Language */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <Label>{dict.settings.language}</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">{dict.settings?.language_desc || 'Выберите предпочитаемый язык'}</p>
                </div>
                <Select value={locale} onValueChange={(value: any) => {
                  if (onLocaleChange) {
                    onLocaleChange(value);
                  }
                }}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(localeNames).map(([key, name]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </AnimatedCard>
        </StaggerItem>

        {/* Subscription Settings */}
        <StaggerItem>
          <AnimatedCard hoverable>
            <CardHeader>
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="p-2 rounded-lg bg-purple-500/10"
                >
                  <CreditCard className="h-5 w-5 text-purple-500" />
                </motion.div>
                <div>
                  <CardTitle>{dict.subscription?.title || 'Подписка'}</CardTitle>
                  <CardDescription>{dict.subscription?.manage || 'Управляйте вашей подпиской'}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{dict.subscription?.current_plan || 'Текущий план'}</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold capitalize">{user?.subscription || 'free'}</span>
                    {(user?.subscription === 'pro' || user?.subscription === 'enterprise') && (
                      <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">Active</span>
                    )}
                  </div>
                </div>
                <Button
                  variant={user?.subscription === 'free' ? 'default' : 'outline'}
                  onClick={() => window.location.href = '/pricing'}
                >
                  {user?.subscription === 'free' ? (dict.subscription?.upgrade || 'Upgrade Plan') : (dict.subscription?.manage || 'Manage')}
                </Button>
              </div>
            </CardContent>
          </AnimatedCard>
        </StaggerItem>

        {/* Notification Settings */}
        <StaggerItem>
          <AnimatedCard hoverable>
            <CardHeader>
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-2 rounded-lg bg-blue-500/10"
                >
                  <Bell className="h-5 w-5 text-blue-500" />
                </motion.div>
                <div>
                  <CardTitle>{dict.settings.notifications}</CardTitle>
                  <CardDescription>{dict.settings?.notifications_desc || 'Управляйте уведомлениями'}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label>{dict.settings.email_notifications}</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">{dict.settings?.email_notifications_desc || 'Получайте обновления по email'}</p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={(checked) => {
                    setEmailNotifications(checked);
                    toast.success(checked ? (dict.settings?.email_enabled || 'Email-уведомления включены') : (dict.settings?.email_disabled || 'Email-уведомления выключены'));
                  }}
                />
              </div>

              <Separator />

              {/* Push Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <Label>{dict.settings.push_notifications}</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">{dict.settings?.push_notifications_desc || 'Получайте push-уведомления'}</p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={(checked) => {
                    setPushNotifications(checked);
                    toast.success(checked ? (dict.settings?.push_enabled || 'Push-уведомления включены') : (dict.settings?.push_disabled || 'Push-уведомления выключены'));
                  }}
                />
              </div>
            </CardContent>
          </AnimatedCard>
        </StaggerItem>

        {/* Security Settings */}
        <StaggerItem>
          <AnimatedCard hoverable>
            <CardHeader>
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  className="p-2 rounded-lg bg-green-500/10"
                >
                  <Shield className="h-5 w-5 text-green-500" />
                </motion.div>
                <div>
                  <CardTitle>{dict.settings?.security || 'Безопасность'}</CardTitle>
                  <CardDescription>{dict.settings?.security_desc || 'Управляйте настройками безопасности аккаунта'}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Change Password */}
              <div>
                <Label className="mb-2 block">
                  {user?.hasPassword ? dict.settings.change_password : (dict.settings?.set_password || 'Установить пароль')}
                </Label>
                <div className="space-y-3">
                  {user?.hasPassword && (
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder={'Текущий пароль'}
                      className="flex-1"
                    />
                  )}
                  <div className="flex gap-3">
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={dict.settings?.new_password_placeholder || 'Новый пароль'}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                      className="gap-2"
                    >
                      <Key className="h-4 w-4" />
                      {isChangingPassword ? (dict.settings?.changing || 'Изменение...') : (user?.hasPassword ? (dict.settings?.change || 'Изменить') : (dict.settings?.set || 'Установить'))}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {user?.hasPassword
                    ? (dict.settings?.password_hint || 'Используйте надежный пароль из минимум 8 символов')
                    : 'Поскольку вы вошли через соцсети, вы можете установить пароль для входа по email'}
                </p>
              </div>
            </CardContent>
          </AnimatedCard>
        </StaggerItem>

        {/* Danger Zone */}
        <StaggerItem>
          <motion.div
            whileHover={{ scale: 1.01 }}
          >
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-2 rounded-lg bg-destructive/10"
                  >
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-destructive">{dict.settings?.danger_zone || 'Опасная зона'}</CardTitle>
                    <CardDescription>{dict.settings?.danger_zone_desc || 'Необратимые действия с аккаунтом'}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      {dict.settings.delete_account}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{dict.settings?.delete_confirm_title || 'Вы уверены?'}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {dict.settings?.delete_confirm_desc || 'Это действие необратимо. Это навсегда удалит ваш аккаунт и все связанные с ним данные с наших серверов. Для подтверждения введите ваш пароль.'}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    {user?.hasPassword ? (
                      <div className="py-4">
                        <Label htmlFor="delete-password">Ваш пароль</Label>
                        <Input
                          id="delete-password"
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="Введите пароль"
                          className="mt-2"
                        />
                      </div>
                    ) : (
                      <div className="py-4">
                        <p className="text-sm font-medium text-destructive">
                          Вы еще не установили пароль. Для удаления аккаунта просто нажмите кнопку подтверждения.
                        </p>
                      </div>
                    )}
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeletePassword('')}>
                        {dict.settings?.cancel || 'Отмена'}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteAccount();
                        }}
                        disabled={isDeleting || (user?.hasPassword && !deletePassword)}
                      >
                        {isDeleting ? 'Удаление...' : (dict.settings?.delete_account_confirm || 'Удалить аккаунт')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <p className="mt-3 text-sm text-muted-foreground">
                  {dict.settings?.delete_warning || 'Навсегда удалите ваш аккаунт и все связанные с ним данные'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}