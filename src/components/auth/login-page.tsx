'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { Loader2 } from 'lucide-react';
import { useAppContext } from '@/app/providers';

interface LoginPageProps {
  dict: Dictionary;
  handleLogin?: (e: React.FormEvent) => void; // Deprecated
  setCurrentPage: (page: string) => void;
}

export const LoginPage = ({ dict, setCurrentPage }: LoginPageProps) => {
  const { login } = useAppContext();
  // We don't have access to isLoggingIn from context easily unless we expose it, using basic login fn for now
  // Ideally context should expose loading state too.

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-background to-muted/20">
      <Card className="w-full max-w-md shadow-2xl border-2">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">{dict.auth.login.title}</CardTitle>
          <CardDescription>{dict.auth.login.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">{dict.auth.login.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="alex@example.com"
                {...register('email')}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{dict.auth.login.password}</Label>
                <button
                  type="button"
                  onClick={() => setCurrentPage('reset-password')}
                  className="text-xs text-primary hover:underline"
                >
                  {dict.auth.login.forgot}
                </button>
              </div>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="remember" className="rounded border-input h-4 w-4 accent-primary" />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                {dict.auth.login.remember}
              </Label>
            </div>
            <Button type="submit" className="w-full h-11 text-base" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {dict.auth.login.submit}...
                </>
              ) : (
                dict.auth.login.submit
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" type="button" className="h-11">Google</Button>
              <Button variant="outline" type="button" className="h-11">VK</Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Button variant="outline" type="button" className="h-11">Yandex</Button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {dict.auth.login.no_account}{' '}
              <button
                type="button"
                className="text-primary font-medium hover:underline"
                onClick={() => setCurrentPage('register')}
              >
                {dict.auth.login.signup_link}
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
