'use client';

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Calendar,
  Clock,
  Eye,
  Heart,
  ArrowRight,
  TrendingUp,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { getBlogPosts, getFeaturedPosts, type BlogCategory } from '@/lib/api/blog-data';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/page-transition';
import { DictionaryFallback } from '@/components/ui/dictionary-fallback';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';

type BlogPageProps = {
  dict: Dictionary;
  locale: Locale;
  onNavigateToPost: (slug: string) => void;
  onNavigateToRegister?: () => void; // Добавляем опциональный callback для навигации на регистрацию
};

const categoryColors: Record<BlogCategory, string> = {
  AI: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  Programming: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  Career: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  Design: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20',
  Business: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
  Learning: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
};

export function BlogPage({ dict, locale, onNavigateToPost, onNavigateToRegister }: BlogPageProps) {
  // Null-safety проверка словаря
  if (!dict?.blog) {
    return <DictionaryFallback />;
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | 'all'>('all');

  const featuredPosts = getFeaturedPosts(locale);

  const filteredPosts = useMemo(() => {
    let posts = getBlogPosts(locale);

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
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return posts;
  }, [searchQuery, selectedCategory, locale]);

  const categories: Array<BlogCategory | 'all'> = ['all', 'AI', 'Programming', 'Career', 'Design', 'Business', 'Learning'];

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
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={dict.blog.search_placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 md:h-14 text-base"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs md:text-sm"
                >
                  {category === 'all' ? dict.blog.all_posts : category}
                </Button>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Featured Posts */}
        {searchQuery === '' && selectedCategory === 'all' && featuredPosts.length > 0 && (
          <div className="mb-16 md:mb-20">
            <div className="flex items-center gap-2 mb-6 md:mb-8">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold">{dict.blog.featured}</h2>
            </div>

            <StaggerContainer>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {featuredPosts.slice(0, 2).map((post, index) => (
                  <StaggerItem key={post.id}>
                    <motion.div
                      whileHover={{ y: -8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card
                        className="overflow-hidden cursor-pointer border-2 hover:border-primary/50 transition-all group h-full"
                        onClick={() => onNavigateToPost(post.slug)}
                      >
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-4 left-4">
                            <Badge className={`${categoryColors[post.category]} border`}>
                              {post.category}
                            </Badge>
                          </div>
                        </div>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-xl md:text-2xl leading-tight group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </CardTitle>
                          <CardDescription className="text-sm md:text-base line-clamp-2 leading-relaxed mt-2">
                            {post.excerpt}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              <span>{new Date(post.publishedAt).toLocaleDateString(locale, {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              <span>{post.readTime} {dict.blog.read_time}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              <span>{post.views.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Heart className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              <span>{post.likes}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <img
                              src={post.author.avatar}
                              alt={post.author.name}
                              className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm md:text-base truncate">{post.author.name}</p>
                              <p className="text-xs md:text-sm text-muted-foreground truncate">{post.author.role}</p>
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
            <StaggerContainer>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredPosts.map((post) => (
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
                            <Badge className={`${categoryColors[post.category]} border text-xs`}>
                              {post.category}
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
                              <span>{(post.views / 1000).toFixed(1)}k</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3 md:h-3.5 md:w-3.5" />
                              <span>{post.likes}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 md:gap-3">
                            <img
                              src={post.author.avatar}
                              alt={post.author.name}
                              className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs md:text-sm truncate">{post.author.name}</p>
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

        {/* CTA Section */}
        {filteredPosts.length > 0 && (
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