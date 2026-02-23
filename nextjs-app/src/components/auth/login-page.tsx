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
import { config } from '@/lib/config';

interface LoginPageProps {
  dict: Dictionary;
  handleLogin?: (e: React.FormEvent) => void; // Deprecated
  setCurrentPage: (page: string) => void;
}

export const LoginPage = ({ dict, setCurrentPage }: LoginPageProps) => {
  const { login } = useAppContext();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login({ ...data, rememberMe: data.rememberMe });
  };

  // OAuth — редирект на провайдера через бэкенд
  const handleOAuth = async (provider: 'google' | 'vk' | 'yandex') => {
    // Callback ведёт на /auth/callback, где code обменивается на токены
    const redirectUri = `${window.location.origin}/auth/callback?provider=${provider}`;
    const apiBase = config.api.baseUrl;
    try {
      const res = await fetch(`${apiBase}/auth/oauth/${provider}?redirectUri=${encodeURIComponent(redirectUri)}`);
      const data = await res.json();
      // Бэкенд возвращает { success, data: { url, provider } }
      const oauthUrl = data?.data?.url || data?.url;
      if (oauthUrl) {
        window.location.href = oauthUrl;
      } else {
        console.error('OAuth: URL не получен', data);
      }
    } catch (err) {
      console.error('OAuth error:', err);
    }
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
              <input
                type="checkbox"
                id="remember"
                className="rounded border-input h-4 w-4 accent-primary"
                {...register('rememberMe')}
              />
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
              <Button variant="outline" type="button" className="h-11" onClick={() => handleOAuth('google')}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                Google
              </Button>
              <Button variant="outline" type="button" className="h-11" onClick={() => handleOAuth('vk')}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="#4C75A3"><path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.525-2.049-1.714-1.033-1.01-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.12-5.335-3.202C4.624 10.857 4 8.57 4 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.847 2.49 2.27 4.676 2.853 4.676.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.253-1.406 2.15-3.574 2.15-3.574.119-.254.322-.491.762-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.78 1.203 1.253.745.847 1.32 1.558 1.473 2.049.17.474-.085.72-.576.72z" /></svg>
                VK
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Button variant="outline" type="button" className="h-11" onClick={() => handleOAuth('yandex')}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="#FF0000"><path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12zm10.5-6h-1.3c-2.23 0-4.2 1.24-4.2 3.95 0 1.67.88 2.78 2.33 3.49L6.6 18h2.1l2.53-4.34V18h1.8V6h-.53z" /></svg>
                Yandex
              </Button>
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
