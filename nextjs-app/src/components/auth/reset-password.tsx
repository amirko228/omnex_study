'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, CheckCircle2, KeyRound, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import type { Dictionary } from '@/lib/i18n/dictionaries';

type ResetPasswordProps = {
  dict: Dictionary;
  onBack: () => void;
};

type Step = 'email' | 'code' | 'success';

export function ResetPassword({ dict, onBack }: ResetPasswordProps) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<Step>('email');
  const [isLoading, setIsLoading] = useState(false);

  const authSection = (dict as unknown as Record<string, Record<string, unknown>>)?.auth;
  const f = (authSection?.forgot || {}) as Record<string, string>;

  // Шаг 1: Отправка кода на email
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error(f.enter_email || 'Введите ваш email');
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiClient.post('/auth/password-reset/request', { email });

      if (result.success) {
        toast.success(f.code_sent || 'Код отправлен!');
        setStep('code');
      } else {
        toast.error(result.error?.message || f.error || 'Ошибка');
      }
    } catch {
      toast.error(f.error || 'Ошибка сброса пароля');
    } finally {
      setIsLoading(false);
    }
  };

  // Шаг 2: Подтверждение кода и установка нового пароля
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || !newPassword) {
      toast.error(f.fill_all_fields || 'Заполните все поля');
      return;
    }
    if (newPassword.length < 8) {
      toast.error(f.min_password || 'Пароль минимум 8 символов');
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiClient.post('/auth/password-reset/confirm', {
        email,
        code,
        newPassword,
      });

      if (result.success) {
        toast.success(f.success || 'Пароль успешно изменён!');
        setStep('success');
      } else {
        toast.error(result.error?.message || f.error || 'Ошибка');
      }
    } catch {
      toast.error(f.error || 'Ошибка сброса пароля');
    } finally {
      setIsLoading(false);
    }
  };

  // Шаг 3: Успех
  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <Card className="w-full max-w-md border-2">
            <CardHeader className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center"
              >
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </motion.div>
              <CardTitle className="text-2xl">{f.success || 'Пароль успешно изменён!'}</CardTitle>
              <CardDescription className="text-base">
                {f.success_desc || 'Теперь вы можете войти с новым паролем'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={onBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {f.back || 'Вернуться к входу'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Шаг 2: Ввод кода и нового пароля
  if (step === 'code') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-2">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep('email')}
                  className="p-2 -ml-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <CardTitle className="text-2xl">{f.enter_code || 'Введите код из письма'}</CardTitle>
                  <CardDescription>
                    {f.check_email || 'Мы отправили код сброса пароля на'} <strong>{email}</strong>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConfirmReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-code">{f.code || 'Код подтверждения'}</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reset-code"
                      type="text"
                      placeholder="123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="pl-9 text-center text-lg tracking-widest"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">{f.new_password || 'Новый пароль'}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-9"
                      minLength={8}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="mr-2 h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                      />
                      {f.resetting || 'Сброс...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {f.confirm_reset || 'Сбросить пароль'}
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  {f.check_spam || 'Если вы не видите письмо, проверьте папку спам'}
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Шаг 1: Ввод email
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-lg hover:bg-accent transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <CardTitle className="text-2xl">{f.title || 'Сброс пароля'}</CardTitle>
                <CardDescription>
                  {f.subtitle || 'Введите email для получения кода сброса'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">{f.email || 'Email'}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="mr-2 h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                    />
                    {f.sending || 'Отправка...'}
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    {f.submit || 'Отправить код'}
                  </>
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={onBack}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {f.back || 'Вернуться к входу'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}