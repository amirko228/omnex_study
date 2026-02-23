'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    Calendar,
    Clock,
    Eye,
    Heart,
    ArrowRight,
    TrendingUp,
    Sparkles,
    BookOpen,
    Loader2,
    Bookmark,
    FileText
} from 'lucide-react';
import { getBlogPosts, getPopularPosts, getFavoritePosts, type BlogPost } from '@/lib/api/blog';
import { getBlogPosts as getLocalBlogPosts, getFeaturedPosts, type BlogCategory } from '@/lib/api/blog-data';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/page-transition';
import { DictionaryFallback } from '@/components/ui/dictionary-fallback';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';

type BlogPageProps = {
    dict: Dictionary;
    locale: Locale;
    onNavigateToPost: (slug: string) => void;
    onNavigateToRegister?: () => void;
    isAuthenticated?: boolean;
};

const categoryColors: Record<string, string> = {
    AI: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    Programming: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    Career: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    Design: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20',
    Business: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
    Learning: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
};

export function BlogPage({ dict, locale, onNavigateToPost, onNavigateToRegister, isAuthenticated }: BlogPageProps) {
    // Null-safety проверка словаря
    if (!dict?.blog) {
        return <DictionaryFallback />;
    }

    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<BlogCategory | 'all'>('all');
    const [apiPosts, setApiPosts] = useState<BlogPost[]>([]);
    const [featuredApiPosts, setFeaturedApiPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [useApi, setUseApi] = useState(true);
    const [showFavorites, setShowFavorites] = useState(false);
    const [favoritePosts, setFavoritePosts] = useState<BlogPost[]>([]);
    const [favoritesLoading, setFavoritesLoading] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Close search dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper: get a snippet around the match
    const getSnippet = useCallback((text: string, q: string, maxLen = 120): string => {
        if (!text || !q) return text?.slice(0, maxLen) || '';
        const lowerText = text.toLowerCase();
        const lowerQuery = q.toLowerCase();
        const idx = lowerText.indexOf(lowerQuery);
        if (idx === -1) return text.slice(0, maxLen) + (text.length > maxLen ? '...' : '');
        const start = Math.max(0, idx - 40);
        const end = Math.min(text.length, idx + q.length + 70);
        let snippet = '';
        if (start > 0) snippet += '...';
        snippet += text.slice(start, end);
        if (end < text.length) snippet += '...';
        return snippet;
    }, []);

    // Live search results for dropdown
    const liveSearchResults = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (q.length < 1) return [];
        const posts: any[] = useApi ? apiPosts : localPosts;
        return posts
            .filter(post =>
                post.title.toLowerCase().includes(q) ||
                (post.excerpt || '').toLowerCase().includes(q) ||
                (post.tags || []).some((tag: string) => tag.toLowerCase().includes(q))
            )
            .slice(0, 8)
            .map(post => ({
                ...post,
                snippet: getSnippet(post.excerpt || '', searchQuery.trim()),
            }));
    }, [searchQuery, apiPosts, useApi, getSnippet]);

    // Загрузка постов из API
    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            setIsLoading(true);
            const [postsResult, popularResult] = await Promise.all([
                getBlogPosts({ limit: 50 }),
                getPopularPosts(2),
            ]);

            if (postsResult && postsResult.data && postsResult.data.length > 0) {
                setApiPosts(postsResult.data);
                setFeaturedApiPosts(popularResult || []);
                setUseApi(true);
            } else {
                // Если API пусто или ошибка — используем локальные данные
                setUseApi(false);
            }
        } catch (error) {
            console.log('Blog API not available, using local data');
            setUseApi(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Локальные данные как fallback
    const localFeaturedPosts = getFeaturedPosts(locale);
    const localPosts = getLocalBlogPosts(locale);

    const filteredPosts = useMemo(() => {
        let posts: any[] = useApi ? apiPosts : localPosts;

        // Filter by category
        if (selectedCategory !== 'all') {
            posts = posts.filter(post => post.category === selectedCategory);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            posts = posts.filter(post =>
                post.title.toLowerCase().includes(query) ||
                post.excerpt.toLowerCase().includes(query) ||
                (post.tags || []).some((tag: string) => tag.toLowerCase().includes(query))
            );
        }

        return posts;
    }, [searchQuery, selectedCategory, apiPosts, localPosts, useApi]);

    const featuredPosts = useApi ? featuredApiPosts : localFeaturedPosts;

    const categories: Array<BlogCategory | 'all'> = ['all', 'AI', 'Programming', 'Career', 'Design', 'Business', 'Learning'];

    // Загрузка избранных постов
    const loadFavorites = async () => {
        if (!isAuthenticated) return;
        try {
            setFavoritesLoading(true);
            const result = await getFavoritePosts();
            setFavoritePosts(result);
        } catch (error) {
            console.log('Failed to load favorites');
        } finally {
            setFavoritesLoading(false);
        }
    };

    const handleToggleFavorites = () => {
        if (showFavorites) {
            setShowFavorites(false);
        } else {
            setShowFavorites(true);
            setSelectedCategory('all');
            setSearchQuery('');
            loadFavorites();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
            <div className="container mx-auto px-4 py-8 md:py-16">
                {/* Header */}
                <FadeIn>
                    <div className="text-center mb-12 md:mb-16">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6"
                        >
                            <Sparkles className="h-4 w-4" />
                            <span className="text-sm font-semibold">{dict.blog.title}</span>
                        </motion.div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
                            {dict.blog.subtitle}
                        </h1>
                        <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
                            {dict.blog.description}
                        </p>
                    </div>
                </FadeIn>

                {/* Search and Filter */}
                <FadeIn delay={0.1}>
                    <div className="max-w-4xl mx-auto mb-12 md:mb-16 space-y-6">
                        <div className="relative" ref={searchContainerRef}>
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                            <Input
                                type="text"
                                placeholder={dict.blog.search_placeholder}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSearchResults(true);
                                }}
                                onFocus={() => setShowSearchResults(true)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                        setShowSearchResults(false);
                                        (e.target as HTMLInputElement).blur();
                                    }
                                    if (e.key === 'Enter' && liveSearchResults.length > 0) {
                                        onNavigateToPost(liveSearchResults[0].slug);
                                        setShowSearchResults(false);
                                        setSearchQuery('');
                                    }
                                }}
                                className="pl-12 pr-10 h-12 md:h-14 text-base rounded-xl border-2 focus:border-primary"
                            />
                            {searchQuery.trim().length > 0 && (
                                <button
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                                    onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                                >
                                    ✕
                                </button>
                            )}

                            {/* Search Results Dropdown */}
                            <AnimatePresence>
                                {showSearchResults && liveSearchResults.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-card border-2 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto"
                                    >
                                        {liveSearchResults.map((post: any) => (
                                            <button
                                                key={post.id || post.slug}
                                                className="w-full text-left px-5 py-3 hover:bg-muted/50 transition-colors flex items-start gap-3 border-b last:border-0"
                                                onClick={() => {
                                                    onNavigateToPost(post.slug);
                                                    setShowSearchResults(false);
                                                    setSearchQuery('');
                                                }}
                                            >
                                                <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-sm truncate">{post.title}</p>
                                                    <p className="text-xs text-muted-foreground line-clamp-1">{post.snippet}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {post.category && (
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${categoryColors[post.category] || 'bg-gray-100 text-gray-600'}`}>
                                                                {post.category}
                                                            </span>
                                                        )}
                                                        {post.readTime && (
                                                            <span className="text-[10px] text-muted-foreground/60 flex items-center gap-0.5">
                                                                <Clock className="h-2.5 w-2.5" />{post.readTime}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                        {filteredPosts.length > 8 && searchQuery.trim().length >= 1 && (
                                            <div className="px-5 py-2 text-xs text-center text-muted-foreground border-t">
                                                + {filteredPosts.length - 8} more
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                                {showSearchResults && searchQuery.trim().length >= 1 && liveSearchResults.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-card border-2 rounded-xl shadow-2xl overflow-hidden z-50"
                                    >
                                        <div className="px-5 py-4 text-sm text-muted-foreground text-center">
                                            <Search className="h-5 w-5 mx-auto mb-2 opacity-40" />
                                            No results found
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Category Filters */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            {categories.map((category) => (
                                <Button
                                    key={category}
                                    variant={!showFavorites && selectedCategory === category ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => { setShowFavorites(false); setSelectedCategory(category); }}
                                    className="text-xs md:text-sm"
                                >
                                    {category === 'all' ? dict.blog.all_posts : (dict.blog.categories?.[category] || category)}
                                </Button>
                            ))}
                            <Button
                                variant={showFavorites ? 'default' : 'outline'}
                                size="sm"
                                onClick={handleToggleFavorites}
                                className={`text-xs md:text-sm gap-1.5 ${showFavorites ? 'bg-rose-500 hover:bg-rose-600 border-rose-500' : 'border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-950'}`}
                            >
                                <Heart className={`h-3.5 w-3.5 ${showFavorites ? 'fill-white' : 'fill-rose-500'}`} />
                                {(dict.blog as any).my_favorites || 'My Favorites'}
                            </Button>
                        </div>
                    </div>
                </FadeIn>

                {/* Loading */}
                {isLoading && (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                {/* Favorites Section */}
                {showFavorites && !isLoading && (
                    <div className="mb-16 md:mb-20">
                        <div className="flex items-center gap-2 mb-6 md:mb-8">
                            <Heart className="h-5 w-5 md:h-6 md:w-6 text-rose-500 fill-rose-500" />
                            <h2 className="text-2xl md:text-3xl font-bold">{(dict.blog as any).my_favorites || 'My Favorites'}</h2>
                        </div>

                        {!isAuthenticated ? (
                            <FadeIn>
                                <Card className="border-2 border-dashed border-rose-200 dark:border-rose-800">
                                    <CardContent className="flex flex-col items-center justify-center py-16 md:py-20">
                                        <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-4 md:mb-6">
                                            <Heart className="h-7 w-7 md:h-8 md:w-8 text-rose-500" />
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-bold mb-2 text-center px-4">{(dict.blog as any).favorites_login_required || 'Log in to see your favorite posts'}</h3>
                                    </CardContent>
                                </Card>
                            </FadeIn>
                        ) : favoritesLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                            </div>
                        ) : favoritePosts.length === 0 ? (
                            <FadeIn>
                                <Card className="border-2 border-dashed border-rose-200 dark:border-rose-800">
                                    <CardContent className="flex flex-col items-center justify-center py-16 md:py-20">
                                        <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-4 md:mb-6">
                                            <Bookmark className="h-7 w-7 md:h-8 md:w-8 text-rose-500" />
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-bold mb-2 text-center px-4">{(dict.blog as any).favorites_empty || 'No favorites yet'}</h3>
                                    </CardContent>
                                </Card>
                            </FadeIn>
                        ) : (
                            <StaggerContainer>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                    {favoritePosts.map((post: any) => (
                                        <StaggerItem key={post.id}>
                                            <motion.div
                                                whileHover={{ y: -8 }}
                                                transition={{ duration: 0.3 }}
                                                className="h-full"
                                            >
                                                <Card
                                                    className="overflow-hidden cursor-pointer hover:shadow-xl transition-all group h-full flex flex-col"
                                                    onClick={() => onNavigateToPost(post.slug)}
                                                >
                                                    <div className="relative aspect-video overflow-hidden bg-muted">
                                                        <img
                                                            src={post.coverImage}
                                                            alt={post.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                        <div className="absolute top-3 left-3">
                                                            <Badge className={`${categoryColors[post.category] || ''} border text-xs`}>
                                                                {dict.blog.categories?.[post.category] || post.category}
                                                            </Badge>
                                                        </div>
                                                        <div className="absolute top-3 right-3">
                                                            {post.userLiked && <Heart className="h-5 w-5 text-rose-500 fill-rose-500 drop-shadow" />}
                                                            {post.userBookmarked && <Bookmark className="h-5 w-5 text-blue-500 fill-blue-500 drop-shadow ml-1" />}
                                                        </div>
                                                    </div>
                                                    <CardHeader className="pb-3 flex-1">
                                                        <CardTitle className="text-lg md:text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                            {post.title}
                                                        </CardTitle>
                                                        <CardDescription className="text-xs md:text-sm line-clamp-2 leading-relaxed mt-2">
                                                            {post.excerpt}
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="pt-0">
                                                        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs text-muted-foreground mb-4">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                                                <span>{post.readTime} {dict.blog.read_time}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Eye className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                                                <span>{((post.views || 0) / 1000).toFixed(1)}k</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Heart className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                                                <span>{post.likes || 0}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 md:gap-3">
                                                            <img
                                                                src={post.author?.avatar || '/default-avatar.png'}
                                                                alt={post.author?.name || ''}
                                                                className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold text-xs md:text-sm truncate">{post.author?.name}</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        </StaggerItem>
                                    ))}
                                </div>
                            </StaggerContainer>
                        )}
                    </div>
                )}

                {/* Featured Posts */}
                {!isLoading && !showFavorites && searchQuery === '' && selectedCategory === 'all' && featuredPosts.length > 0 && (
                    <div className="mb-16 md:mb-20">
                        <div className="flex items-center gap-2 mb-6 md:mb-8">
                            <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                            <h2 className="text-2xl md:text-3xl font-bold">{dict.blog.featured}</h2>
                        </div>

                        <StaggerContainer>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {featuredPosts.slice(0, 3).map((post: any, index: number) => (
                                    <StaggerItem key={post.id}>
                                        <motion.div
                                            whileHover={{ y: -6 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Card
                                                className="overflow-hidden cursor-pointer border-2 hover:border-primary/50 transition-all group h-full"
                                                onClick={() => onNavigateToPost(post.slug)}
                                            >
                                                <div className="relative aspect-[3/2] overflow-hidden bg-muted">
                                                    <img
                                                        src={post.coverImage}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                    <div className="absolute top-3 left-3">
                                                        <Badge className={`${categoryColors[post.category] || ''} border text-xs`}>
                                                            {dict.blog.categories?.[post.category] || post.category}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <CardHeader className="pb-2 pt-3 px-4">
                                                    <CardTitle className="text-base md:text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                        {post.title}
                                                    </CardTitle>
                                                    <CardDescription className="text-xs md:text-sm line-clamp-2 leading-relaxed mt-1">
                                                        {post.excerpt}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="pt-0 px-4 pb-4">
                                                    <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs text-muted-foreground mb-3">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString(locale, {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{post.readTime} {dict.blog.read_time}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Eye className="h-3 w-3" />
                                                            <span>{(post.views || 0).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Heart className="h-3 w-3" />
                                                            <span>{post.likes || 0}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <img
                                                            src={post.author?.avatar || '/default-avatar.png'}
                                                            alt={post.author?.name || ''}
                                                            className="w-7 h-7 rounded-full object-cover"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-xs md:text-sm truncate">{post.author?.name}</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    </StaggerItem>
                                ))}
                            </div>
                        </StaggerContainer>
                    </div>
                )}

                {/* All Posts Grid */}
                {!isLoading && !showFavorites && (
                    <div>
                        <div className="flex items-center justify-between mb-6 md:mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold">
                                {searchQuery ? dict.blog.results : selectedCategory === 'all' ? dict.blog.all_posts : `${dict.blog.all_posts}: ${selectedCategory}`}
                            </h2>
                            <Badge variant="secondary" className="text-xs md:text-sm">
                                {filteredPosts.length} {dict.blog.post_count_many}
                            </Badge>
                        </div>

                        {filteredPosts.length === 0 ? (
                            <FadeIn>
                                <Card className="border-2 border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-16 md:py-20">
                                        <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-muted flex items-center justify-center mb-4 md:mb-6">
                                            <Search className="h-7 w-7 md:h-8 md:w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-bold mb-2 text-center px-4">{dict.blog.no_results}</h3>
                                        <p className="text-sm md:text-base text-muted-foreground text-center max-w-md px-4">
                                            {dict.blog.no_results_description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </FadeIn>
                        ) : (
                            <StaggerContainer key={`stagger-${selectedCategory}-${searchQuery}`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                    {filteredPosts.map((post: any) => (
                                        <StaggerItem key={`${post.id}-${selectedCategory}-${searchQuery}`}>
                                            <motion.div
                                                whileHover={{ y: -8 }}
                                                transition={{ duration: 0.3 }}
                                                className="h-full"
                                            >
                                                <Card
                                                    className="overflow-hidden cursor-pointer hover:shadow-xl transition-all group h-full flex flex-col"
                                                    onClick={() => onNavigateToPost(post.slug)}
                                                >
                                                    <div className="relative aspect-video overflow-hidden bg-muted">
                                                        <img
                                                            src={post.coverImage}
                                                            alt={post.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                        <div className="absolute top-3 left-3">
                                                            <Badge className={`${categoryColors[post.category] || ''} border text-xs`}>
                                                                {dict.blog.categories?.[post.category] || post.category}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <CardHeader className="pb-3 flex-1">
                                                        <CardTitle className="text-lg md:text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                            {post.title}
                                                        </CardTitle>
                                                        <CardDescription className="text-xs md:text-sm line-clamp-2 leading-relaxed mt-2">
                                                            {post.excerpt}
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="pt-0">
                                                        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs text-muted-foreground mb-4">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                                                <span>{post.readTime} {dict.blog.read_time}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Eye className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                                                <span>{((post.views || 0) / 1000).toFixed(1)}k</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Heart className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                                                <span>{post.likes || 0}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 md:gap-3">
                                                            <img
                                                                src={post.author?.avatar || '/default-avatar.png'}
                                                                alt={post.author?.name || ''}
                                                                className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold text-xs md:text-sm truncate">{post.author?.name}</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        </StaggerItem>
                                    ))}
                                </div>
                            </StaggerContainer>
                        )}
                    </div>
                )}

                {/* CTA Section */}
                {!showFavorites && filteredPosts.length > 0 && (
                    <FadeIn delay={0.3}>
                        <Card className="mt-16 md:mt-20 border-2 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
                            <CardContent className="p-8 md:p-12 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ type: 'spring', duration: 0.6 }}
                                    className="inline-flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 mb-6 shadow-lg"
                                >
                                    <BookOpen className="h-7 w-7 md:h-8 md:w-8 text-white" />
                                </motion.div>
                                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                                    {dict.blog.cta_title}
                                </h2>
                                <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-4">
                                    {dict.blog.cta_description}
                                </p>
                                <Button size="lg" className="h-11 md:h-14 px-6 md:px-8 text-sm md:text-lg" onClick={onNavigateToRegister}>
                                    {dict.blog.cta_button}
                                    <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                                </Button>
                            </CardContent>
                        </Card>
                    </FadeIn>
                )}
            </div>
        </div>
    );
}
