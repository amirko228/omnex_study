'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageTransition, ScaleIn } from '@/components/ui/page-transition';
import type { Dictionary } from '@/lib/i18n/dictionaries';

interface RegisterPageProps {
    dict: Dictionary;
    handleRegister: (e: React.FormEvent) => void;
    setCurrentPage: (page: any) => void;
}

export const RegisterPage = ({ dict, handleRegister, setCurrentPage }: RegisterPageProps) => (
    <PageTransition>
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-background to-muted/20">
            <ScaleIn>
                <Card className="w-full max-w-md shadow-2xl border-2">
                    <CardHeader className="space-y-2 text-center">
                        <CardTitle className="text-2xl font-bold">{dict.auth.register.title}</CardTitle>
                        <CardDescription>{dict.auth.register.subtitle}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="reg-name">{dict.auth.register.name}</Label>
                                <Input id="reg-name" placeholder="Alex Johnson" required className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reg-email">{dict.auth.register.email}</Label>
                                <Input id="reg-email" type="email" placeholder="alex@example.com" required className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reg-password">{dict.auth.register.password}</Label>
                                <Input id="reg-password" type="password" required className="h-11" />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                By creating an account, you agree to our Terms of Service and Privacy Policy.
                            </p>
                            <Button type="submit" className="w-full h-11 text-base">
                                {dict.auth.register.submit}
                            </Button>
                            <p className="text-center text-sm text-muted-foreground pt-2">
                                {dict.auth.register.have_account}{' '}
                                <button
                                    type="button"
                                    className="text-primary font-medium hover:underline"
                                    onClick={() => setCurrentPage('login')}
                                >
                                    {dict.auth.register.login_link}
                                </button>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </ScaleIn>
        </div>
    </PageTransition>
);
