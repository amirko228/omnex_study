'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Heart,
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  BookmarkPlus,
  Loader2,
} from 'lucide-react';
import {
  getBlogPostBySlug as getApiBlogPost,
  toggleBlogLike,
  toggleBlogBookmark,
  trackBlogView,
  getBlogComments,
  getPopularPosts,
  type BlogComment,
  type BlogPost as ApiBlogPost,
} from '@/lib/api/blog';
import { getBlogPostBySlug as getLocalBlogPost, getRelatedPosts, type BlogPost as LocalBlogPost } from '@/lib/api/blog-data';
import { BlogComments } from '@/components/blog/blog-comments';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/page-transition';
import { DictionaryFallback } from '@/components/ui/dictionary-fallback';
import { toast } from 'sonner';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import { getUserIdFromToken } from '@/lib/utils/auth-helpers';

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

// Unified post type for display
type DisplayPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: string;
  tags: string[];
  readTime: number;
  likes: number;
  views: number;
  bookmarks: number;
  publishedAt?: string;
  createdAt?: string;
  author: {
    name: string;
    avatar?: string;
    bio?: string;
    role?: string;
  };
  userLiked?: boolean;
  userBookmarked?: boolean;
  isFromApi: boolean;
};

export function BlogPostPage({ slug, dict, locale, onBack, onNavigateToPost }: BlogPostPageProps) {
  const [post, setPost] = useState<DisplayPost | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<(ApiBlogPost | LocalBlogPost)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const currentUserId = getUserIdFromToken();

  const loadPost = useCallback(async () => {
    try {
      setIsLoading(true);

      // Сначала пробуем API
      const apiPost = await getApiBlogPost(slug);

      if (apiPost) {
        // Пост найден в API
        const displayPost: DisplayPost = {
          id: apiPost.id,
          slug: apiPost.slug,
          title: apiPost.title,
          excerpt: apiPost.excerpt,
          content: apiPost.content,
          coverImage: apiPost.coverImage,
          category: apiPost.category,
          tags: apiPost.tags || [],
          readTime: apiPost.readTime || 5,
          likes: apiPost.likes || 0,
          views: apiPost.views || 0,
          bookmarks: apiPost.bookmarks || 0,
          publishedAt: apiPost.publishedAt,
          createdAt: apiPost.createdAt,
          author: {
            name: apiPost.author?.name || dict.blog.author,
            avatar: apiPost.author?.avatar,
            bio: apiPost.author?.bio,
          },
          userLiked: apiPost.userLiked || false,
          userBookmarked: apiPost.userBookmarked || false,
          isFromApi: true,
        };
        setPost(displayPost);

        // Track view
        trackBlogView(apiPost.id).catch(() => {});

        // Load comments from API
        loadComments(apiPost.id);

        // Load popular posts for sidebar
        try {
          const popular = await getPopularPosts(3);
          setRelatedPosts(popular || []);
        } catch {
          setRelatedPosts([]);
        }
      } else {
        // Fallback на локальные данные
        const localPost = getLocalBlogPost(slug, locale);
        if (localPost) {
          const displayPost: DisplayPost = {
            id: localPost.id,
            slug: localPost.slug,
            title: localPost.title,
            excerpt: localPost.excerpt,
            content: localPost.content,
            coverImage: localPost.coverImage,
            category: localPost.category,
            tags: localPost.tags || [],
            readTime: localPost.readTime,
            likes: localPost.likes,
            views: localPost.views,
            bookmarks: 0,
            publishedAt: localPost.publishedAt,
            author: {
              name: localPost.author.name,
              avatar: localPost.author.avatar,
              role: localPost.author.role,
            },
            userLiked: false,
            userBookmarked: false,
            isFromApi: false,
          };
          setPost(displayPost);

          // Get related local posts
          const related = getRelatedPosts(localPost.id, locale, 3);
          setRelatedPosts(related);
        }
      }
    } catch {

      // Fallback на локальные данные при ошибке
      const localPost = getLocalBlogPost(slug, locale);
      if (localPost) {
        const displayPost: DisplayPost = {
          id: localPost.id,
          slug: localPost.slug,
          title: localPost.title,
          excerpt: localPost.excerpt,
          content: localPost.content,
          coverImage: localPost.coverImage,
          category: localPost.category,
          tags: localPost.tags || [],
          readTime: localPost.readTime,
          likes: localPost.likes,
          views: localPost.views,
          bookmarks: 0,
          publishedAt: localPost.publishedAt,
          author: {
            name: localPost.author.name,
            avatar: localPost.author.avatar,
            role: localPost.author.role,
          },
          userLiked: false,
          userBookmarked: false,
          isFromApi: false,
        };
        setPost(displayPost);

        const related = getRelatedPosts(localPost.id, locale, 3);
        setRelatedPosts(related);
      }
    } finally {
      setIsLoading(false);
    }
  }, [slug, locale, dict]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const loadComments = async (postId: string) => {
    try {
      const commentsData = await getBlogComments(postId);
      setComments(commentsData || []);
    } catch {
      // Comments unavailable
    }
  };

  if (!dict?.blog) {
    return <DictionaryFallback />;
  }

  const handleLike = async () => {
    if (!post) return;
    if (!post.isFromApi) {
      // Для локальных постов — просто toggle UI
      setPost(prev => prev ? { ...prev, userLiked: !prev.userLiked, likes: prev.userLiked ? prev.likes - 1 : prev.likes + 1 } : null);
      toast.success(post.userLiked ? dict.blog.like_removed : dict.blog.like_added);
      return;
    }
    if (!currentUserId) {
      toast.error(dict.blog.login_to_like);
      return;
    }

    setIsLikeLoading(true);
    try {
      const result = await toggleBlogLike(post.id);

      if (!result.success || !result.data) {
        const message = result.error?.message || dict.blog.failed_like || 'Не удалось поставить лайк';
        toast.error(message);
        return;
      }

      setPost(prev => prev ? {
        ...prev,
        userLiked: result.data!.liked,
        likes: result.data!.liked ? prev.likes + 1 : prev.likes - 1,
      } : null);
      toast.success(result.data.liked ? dict.blog.like_added : dict.blog.like_removed);
    } catch {
      toast.error(dict.blog.failed_like || 'Не удалось поставить лайк');
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!post) return;
    if (!post.isFromApi) {
      setPost(prev => prev ? { ...prev, userBookmarked: !prev.userBookmarked, bookmarks: prev.userBookmarked ? prev.bookmarks - 1 : prev.bookmarks + 1 } : null);
      toast.success(post.userBookmarked ? dict.blog.bookmark_removed : dict.blog.bookmark_added);
      return;
    }
    if (!currentUserId) {
      toast.error(dict.blog.login_to_bookmark);
      return;
    }

    setIsBookmarkLoading(true);
    try {
      const result = await toggleBlogBookmark(post.id);

      if (!result.success || !result.data) {
        const message = result.error?.message || dict.blog.failed_bookmark || 'Не удалось сохранить в закладки';
        toast.error(message);
        return;
      }

      setPost(prev => prev ? {
        ...prev,
        userBookmarked: result.data!.bookmarked,
        bookmarks: result.data!.bookmarked ? prev.bookmarks + 1 : prev.bookmarks - 1,
      } : null);
      toast.success(result.data.bookmarked ? dict.blog.bookmark_added : dict.blog.bookmark_removed);
    } catch {
      toast.error(dict.blog.failed_bookmark || 'Не удалось сохранить в закладки');
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  const handleShare = (platform: string) => {
    if (!post) return;
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
        toast.success(dict.blog.link_copied);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <h3 className="text-2xl font-bold mb-2">{dict.blog.article_not_found}</h3>
            <p className="text-muted-foreground mb-6">{dict.blog.article_not_found_desc}</p>
            <Button onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {dict.blog.back_to_blog}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-10">
        <Button variant="ghost" className="mb-6 md:mb-8 -ml-2" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">{dict.blog.back_to_blog}</span>
          <span className="sm:hidden">{dict.blog.back}</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <FadeIn>
              <article>
                {/* Header */}
                <div className="mb-6 md:mb-8">
                  <Badge className={`${categoryColors[post.category] || ''} border mb-4`}>
                    {dict.blog.categories?.[post.category] || post.category}
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
                      <span>{new Date(post.publishedAt || post.createdAt || Date.now()).toLocaleDateString(locale, {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>{post.readTime} {dict.blog.read_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 shrink-0" />
                      <span>{(post.views || 0).toLocaleString()} {dict.blog.views}</span>
                    </div>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3 md:gap-4 p-4 md:p-6 rounded-xl bg-muted/50 border">
                    <div className="relative w-12 h-12 md:w-16 md:h-16 shrink-0">
                      <Image
                        src={post.author.avatar || '/default-avatar.png'}
                        alt={post.author.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base md:text-lg">{post.author.name}</p>
                      {(post.author.bio || post.author.role) && (
                        <p className="text-sm md:text-base text-muted-foreground">{post.author.bio || post.author.role}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cover Image */}
                {post.coverImage && (
                  <div className="mb-8 md:mb-12 aspect-video rounded-2xl overflow-hidden bg-muted shadow-xl relative">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      priority
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-12 pt-8 border-t">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs md:text-sm">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 md:p-6 rounded-xl bg-muted/50 border">
                  <div className="flex items-center gap-3 md:gap-4">
                    <Button
                      variant={post.userLiked ? 'default' : 'outline'}
                      size="sm"
                      onClick={handleLike}
                      disabled={isLikeLoading}
                      className="gap-2"
                    >
                      {isLikeLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Heart className={`h-4 w-4 ${post.userLiked ? 'fill-current' : ''}`} />
                      )}
                      <span>{post.likes}</span>
                    </Button>
                    <Button
                      variant={post.userBookmarked ? 'default' : 'outline'}
                      size="sm"
                      onClick={handleBookmark}
                      disabled={isBookmarkLoading}
                      className="gap-2"
                    >
                      {isBookmarkLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <BookmarkPlus className={`h-4 w-4 ${post.userBookmarked ? 'fill-current' : ''}`} />
                      )}
                      <span className="hidden sm:inline">{dict.blog.save}</span>
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground mr-2 hidden sm:inline">{dict.blog.share}</span>
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

            {/* Comments - only for API posts */}
            {post.isFromApi && (
              <BlogComments
                postId={post.id}
                comments={comments}
                currentUserId={currentUserId || undefined}
                locale={locale}
                onCommentAdded={() => loadComments(post.id)}
                dict={dict.blog.comments}
              />
            )}

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-16 md:mt-20">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">{dict.blog.related_posts}</h2>
                <StaggerContainer>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {relatedPosts.map((relatedPost) => (
                      <StaggerItem key={relatedPost.id}>
                        <Card
                          className="cursor-pointer hover:shadow-xl transition-all group overflow-hidden h-full flex flex-col"
                          onClick={() => onNavigateToPost(relatedPost.slug)}
                        >
                          <div className="relative aspect-video overflow-hidden bg-muted">
                            <Image
                              src={relatedPost.coverImage || '/placeholder-blog.jpg'}
                              alt={relatedPost.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
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
                              <span>{relatedPost.readTime} {dict.blog.read_time}</span>
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
              {/* Popular Posts */}
              {relatedPosts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📈 {dict.blog.popular_posts}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {relatedPosts.slice(0, 3).map((popularPost) => (
                      <div
                        key={popularPost.id}
                        className="flex gap-3 cursor-pointer group"
                        onClick={() => onNavigateToPost(popularPost.slug)}
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted relative">
                          <Image
                            src={popularPost.coverImage || '/placeholder-blog.jpg'}
                            alt={popularPost.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                            {popularPost.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {popularPost.readTime} {dict.blog.read_time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}