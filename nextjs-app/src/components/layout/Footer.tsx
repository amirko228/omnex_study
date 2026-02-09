'use client';

import { OmnexLogo } from '@/components/layout/omnex-logo';
import type { Dictionary } from '@/lib/i18n/dictionaries';

interface FooterProps {
    dict: Dictionary;
    onNavigate: (page: string) => void;
}

export const Footer = ({ dict, onNavigate }: FooterProps) => {
    return (
        <footer className="border-t py-12 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-2 md:col-span-1">
                        <OmnexLogo className="mb-4" />
                        <p className="text-sm text-muted-foreground">{dict?.footer?.tagline || 'AI-powered learning platform'}</p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">{dict?.footer?.support || 'Support'}</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <button
                                    onClick={() => onNavigate('blog')}
                                    className="hover:text-primary transition-colors cursor-pointer text-left"
                                >
                                    {dict?.nav?.blog || 'Blog'}
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onNavigate('help-center')}
                                    className="hover:text-primary transition-colors cursor-pointer text-left"
                                >
                                    {dict?.footer?.help_center || 'Help Center'}
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onNavigate('privacy-policy')}
                                    className="hover:text-primary transition-colors cursor-pointer text-left"
                                >
                                    {dict?.footer?.privacy || 'Privacy Policy'}
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onNavigate('terms-of-service')}
                                    className="hover:text-primary transition-colors cursor-pointer text-left"
                                >
                                    {dict?.footer?.terms || 'Terms of Service'}
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">{dict?.footer?.social || 'Social'}</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a
                                    href="https://twitter.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary transition-colors"
                                >
                                    {dict?.footer?.twitter || 'Twitter'}
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://linkedin.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary transition-colors"
                                >
                                    {dict?.footer?.linkedin || 'LinkedIn'}
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://instagram.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary transition-colors"
                                >
                                    {dict?.footer?.instagram || 'Instagram'}
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">{dict?.footer?.platform || 'Platform'}</h4>
                        <p className="text-sm text-muted-foreground">
                            {dict?.footer?.version || 'Version 1.0'}
                        </p>
                    </div>
                </div>
                <div className="text-center text-sm text-muted-foreground border-t pt-8">
                    © {new Date().getFullYear()} {dict?.footer?.copyright || 'OMNEX STUDY'}
                </div>
            </div>
        </footer>
    );
};
