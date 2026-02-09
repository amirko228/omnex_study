'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { PageTransition, ScaleIn } from '@/components/ui/page-transition';
import type { Dictionary } from '@/lib/i18n/dictionaries';

interface RegisterPageProps {
    dict: Dictionary;
    onSubmit: (data: RegisterFormData) => void;
    setCurrentPage: (page: any) => void;
    isLoading?: boolean;
}

export const RegisterPage = ({ dict, onSubmit, setCurrentPage, isLoading }: RegisterPageProps) => {
    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    return (
        <PageTransition>
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-background to-muted/20">
                <ScaleIn>
                    <Card className="w-full max-w-md shadow-2xl border-2">
                        <CardHeader className="space-y-2 text-center">
                            <CardTitle className="text-2xl font-bold">{dict.auth.register.title}</CardTitle>
                            <CardDescription>{dict.auth.register.subtitle}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{dict.auth.register.name}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Alex Johnson" className="h-11" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{dict.auth.register.email}</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="alex@example.com" className="h-11" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{dict.auth.register.password}</FormLabel>
                                                <FormControl>
                                                    <Input type="password" className="h-11" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{dict.auth.register.confirm_password}</FormLabel>
                                                <FormControl>
                                                    <Input type="password" className="h-11" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <p className="text-xs text-muted-foreground">
                                        {dict.auth.register.terms}
                                    </p>
                                    <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                                        {isLoading ? '...' : dict.auth.register.submit}
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
                            </Form>
                        </CardContent>
                    </Card>
                </ScaleIn>
            </div>
        </PageTransition>
    );
};
