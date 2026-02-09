'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Heart,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  BookmarkPlus,
  ThumbsUp
} from 'lucide-react';
import { getBlogPostBySlug, getRelatedPosts, type BlogPost } from '@/lib/api/blog-data';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/page-transition';
import { DictionaryFallback } from '@/components/ui/dictionary-fallback';
import { toast } from 'sonner';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';

type BlogPostPageProps = {
  slug: string;
  dict: Dictionary;
  locale: Locale;
  onBack: () => void;
  onNavigateToPost: (slug: string) => void;
};

const categoryColors: Record<string, string> = {
  AI: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  Programming: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  Career: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  Design: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20',
  Business: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
  Learning: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
};

export function BlogPostPage({ slug, dict, locale, onBack, onNavigateToPost }: BlogPostPageProps) {
  // Null-safety проверка словаря
  if (!dict?.blog) {
    return <DictionaryFallback />;
  }

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const blogPost = getBlogPostBySlug(slug, locale);
    if (blogPost) {
      setPost(blogPost);
      setRelatedPosts(getRelatedPosts(blogPost.id, locale));
    }
  }, [slug, locale]);

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <h3 className="text-2xl font-bold mb-2">Статья не найдена</h3>
            <p className="text-muted-foreground mb-6">Запрошенная статья не существует</p>
            <Button onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться к блогу
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = post.title;

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Ссылка скопирована в буфер обмена');
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Лайк убран' : 'Спасибо за лайк! ❤️');
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Удалено из закладок' : 'Добавлено в закладки 📚');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-10">
        <Button variant="ghost" className="mb-6 md:mb-8 -ml-2" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Вернуться к блогу</span>
          <span className="sm:hidden">Назад</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <FadeIn>
              <article>
                {/* Header */}
                <div className="mb-6 md:mb-8">
                  <Badge className={`${categoryColors[post.category]} border mb-4`}>
                    {post.category}
                  </Badge>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">
                    {post.title}
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
                    {post.excerpt}
                  </p>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm md:text-base text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>{new Date(post.publishedAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>{post.readTime} мин чтения</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 shrink-0" />
                      <span>{post.views.toLocaleString()} просмотров</span>
                    </div>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3 md:gap-4 p-4 md:p-6 rounded-xl bg-muted/50 border">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base md:text-lg">{post.author.name}</p>
                      <p className="text-sm md:text-base text-muted-foreground">{post.author.role}</p>
                    </div>
                  </div>
                </div>

                {/* Cover Image */}
                <div className="mb-8 md:mb-12 aspect-video rounded-2xl overflow-hidden bg-muted shadow-xl">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div
                  className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none
                    prose-headings:font-bold prose-headings:tracking-tight
                    prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                    prose-h3:text-xl md:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                    prose-p:leading-relaxed prose-p:text-foreground/90
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-foreground prose-strong:font-semibold
                    prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                    prose-pre:bg-muted prose-pre:border prose-pre:rounded-xl
                    prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 
                    prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic
                    prose-ul:list-disc prose-ol:list-decimal
                    prose-li:text-foreground/90 prose-li:marker:text-primary"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Tags */}
                <div className="mt-12 pt-8 border-t">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs md:text-sm">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 md:p-6 rounded-xl bg-muted/50 border">
                  <div className="flex items-center gap-3 md:gap-4">
                    <Button
                      variant={isLiked ? 'default' : 'outline'}
                      size="sm"
                      onClick={handleLike}
                      className="gap-2"
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{post.likes + (isLiked ? 1 : 0)}</span>
                    </Button>
                    <Button
                      variant={isBookmarked ? 'default' : 'outline'}
                      size="sm"
                      onClick={handleBookmark}
                      className="gap-2"
                    >
                      <BookmarkPlus className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                      <span className="hidden sm:inline">Сохранить</span>
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground mr-2 hidden sm:inline">Поделиться:</span>
                    <Button variant="outline" size="icon" onClick={() => handleShare('twitter')}>
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleShare('facebook')}>
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleShare('linkedin')}>
                      <Linkedin className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleShare('copy')}>
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </article>
            </FadeIn>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-16 md:mt-20">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Похожие статьи</h2>
                <StaggerContainer>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {relatedPosts.map((relatedPost) => (
                      <StaggerItem key={relatedPost.id}>
                        <Card
                          className="cursor-pointer hover:shadow-xl transition-all group overflow-hidden h-full flex flex-col"
                          onClick={() => onNavigateToPost(relatedPost.slug)}
                        >
                          <div className="relative aspect-video overflow-hidden bg-muted">
                            <img
                              src={relatedPost.coverImage}
                              alt={relatedPost.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <CardHeader className="pb-2 flex-1">
                            <CardTitle className="text-base md:text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                              {relatedPost.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{relatedPost.readTime} мин</span>
                            </div>
                          </CardContent>
                        </Card>
                      </StaggerItem>
                    ))}
                  </div>
                </StaggerContainer>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Share Card */}
              <Card className="hidden lg:block">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Поделиться
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-3" onClick={() => handleShare('twitter')}>
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3" onClick={() => handleShare('facebook')}>
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3" onClick={() => handleShare('linkedin')}>
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3" onClick={() => handleShare('copy')}>
                    <Link2 className="h-4 w-4" />
                    Копировать ссылку
                  </Button>
                </CardContent>
              </Card>

              {/* Popular Posts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📈 Популярное</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedPosts.slice(0, 3).map((popularPost, index) => (
                    <div
                      key={popularPost.id}
                      className="flex gap-3 cursor-pointer group"
                      onClick={() => onNavigateToPost(popularPost.slug)}
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={popularPost.coverImage}
                          alt={popularPost.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {popularPost.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {popularPost.readTime} мин
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}