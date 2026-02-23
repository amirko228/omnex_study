import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateBlogPostDto, UpdateBlogPostDto, CreateCommentDto } from './dto/blog.dto';

@Injectable()
export class BlogService {
    constructor(private prisma: PrismaService) { }

    // Получить список постов с фильтрами и пагинацией
    async getPosts(params: {
        page?: number;
        limit?: number;
        category?: string;
        tag?: string;
        search?: string;
        published?: boolean;
    }) {
        const { page = 1, limit = 10, category, tag, search, published } = params;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (category) where.category = category;
        if (published !== undefined) where.published = published;
        if (tag) where.tags = { has: tag };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { excerpt: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [posts, total] = await Promise.all([
            this.prisma.blogPost.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: { select: { id: true, name: true, avatar: true } },
                    _count: { select: { userLikes: true, userBookmarks: true } },
                },
            }),
            this.prisma.blogPost.count({ where }),
        ]);

        return {
            data: posts.map(post => ({
                ...post,
                likes: post._count.userLikes,
                bookmarks: post._count.userBookmarks,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    // Популярные посты
    async getPopularPosts(limit = 5) {
        const posts = await this.prisma.blogPost.findMany({
            where: { published: true },
            take: limit,
            orderBy: { views: 'desc' },
            include: {
                author: { select: { id: true, name: true, avatar: true } },
                _count: { select: { userLikes: true, userBookmarks: true } },
            },
        });
        return posts.map(post => ({
            ...post,
            likes: post._count.userLikes,
            bookmarks: post._count.userBookmarks,
        }));
    }

    // Избранные посты пользователя
    async getFavoritePosts(userId: string) {
        const [likes, bookmarks] = await Promise.all([
            this.prisma.blogLike.findMany({
                where: { userId },
                include: {
                    post: {
                        include: {
                            author: true,
                            _count: { select: { userLikes: true, userBookmarks: true } }
                        }
                    }
                },
            }),
            this.prisma.blogBookmark.findMany({
                where: { userId },
                include: {
                    post: {
                        include: {
                            author: true,
                            _count: { select: { userLikes: true, userBookmarks: true } }
                        }
                    }
                },
            }),
        ]);

        const likedPosts = likes.map(l => ({
            ...l.post,
            likes: (l.post as any)._count.userLikes,
            bookmarks: (l.post as any)._count.userBookmarks,
        }));
        const bookmarkedPosts = bookmarks.map(b => ({
            ...b.post,
            likes: (b.post as any)._count.userLikes,
            bookmarks: (b.post as any)._count.userBookmarks,
        }));

        // Объединяем и удаляем дубликаты
        const allPosts = [...likedPosts, ...bookmarkedPosts];
        const uniqueIds = new Set();
        return allPosts.filter(post => {
            if (uniqueIds.has(post.id)) return false;
            uniqueIds.add(post.id);
            return true;
        });
    }

    // Получить пост по slug
    async getPostBySlug(slug: string, userId?: string) {
        const post = await this.prisma.blogPost.findUnique({
            where: { slug },
            include: {
                author: { select: { id: true, name: true, avatar: true, bio: true } },
                _count: { select: { userLikes: true, userBookmarks: true } },
            },
        });

        if (!post) throw new NotFoundException('Пост не найден');

        let userLiked = false;
        let userBookmarked = false;

        if (userId) {
            const [like, bookmark] = await Promise.all([
                this.prisma.blogLike.findFirst({
                    where: { userId, postId: post.id },
                }),
                this.prisma.blogBookmark.findFirst({
                    where: { userId, postId: post.id },
                }),
            ]);
            userLiked = !!like;
            userBookmarked = !!bookmark;
        }

        return {
            ...post,
            likes: post._count.userLikes,
            bookmarks: post._count.userBookmarks,
            userLiked,
            userBookmarked,
        };
    }

    // Создать пост
    async createPost(userId: string, dto: CreateBlogPostDto) {
        const slug = dto.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        // Проверка на дубликат slug
        const existing = await this.prisma.blogPost.findUnique({ where: { slug } });
        const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

        return this.prisma.blogPost.create({
            data: {
                ...dto,
                slug: finalSlug,
                authorId: userId,
                publishedAt: dto.published ? new Date() : null,
            },
        });
    }

    // Обновить пост
    async updatePost(postId: string, userId: string, dto: UpdateBlogPostDto) {
        const post = await this.prisma.blogPost.findUnique({ where: { id: postId } });
        if (!post) throw new NotFoundException('Пост не найден');
        if (post.authorId !== userId) throw new ForbiddenException('Нет прав на редактирование');

        return this.prisma.blogPost.update({
            where: { id: postId },
            data: {
                ...dto,
                publishedAt: dto.published && !post.published ? new Date() : post.publishedAt,
            },
        });
    }

    // Удалить пост
    async deletePost(postId: string, userId: string) {
        const post = await this.prisma.blogPost.findUnique({ where: { id: postId } });
        if (!post) throw new NotFoundException('Пост не найден');
        if (post.authorId !== userId) throw new ForbiddenException('Нет прав на удаление');

        await this.prisma.blogPost.delete({ where: { id: postId } });
        return { message: 'Пост удален' };
    }

    // Лайкнуть пост
    async likePost(postId: string, userId: string) {
        console.log(`[BlogService] likePost called: postId=${postId}, userId=${userId}`);

        const post = await this.prisma.blogPost.findUnique({ where: { id: postId } });
        if (!post) {
            console.error(`[BlogService] likePost failed: Post ${postId} not found`);
            throw new NotFoundException('Пост не найден');
        }

        const existing = await this.prisma.blogLike.findFirst({
            where: { userId, postId },
        });

        if (existing) {
            console.log(`[BlogService] Removing like for post ${postId}`);
            await this.prisma.blogLike.deleteMany({
                where: { userId, postId },
            });
            return { liked: false };
        }

        console.log(`[BlogService] Adding like for post ${postId}`);
        await this.prisma.blogLike.create({
            data: { userId, postId },
        });
        return { liked: true };
    }

    // В закладки
    async bookmarkPost(postId: string, userId: string) {
        console.log(`[BlogService] bookmarkPost called: postId=${postId}, userId=${userId}`);

        const post = await this.prisma.blogPost.findUnique({ where: { id: postId } });
        if (!post) {
            console.error(`[BlogService] bookmarkPost failed: Post ${postId} not found`);
            throw new NotFoundException('Пост не найден');
        }

        const existing = await this.prisma.blogBookmark.findFirst({
            where: { userId, postId },
        });

        if (existing) {
            console.log(`[BlogService] Removing bookmark for post ${postId}`);
            await this.prisma.blogBookmark.deleteMany({
                where: { userId, postId },
            });
            return { bookmarked: false };
        }

        console.log(`[BlogService] Adding bookmark for post ${postId}`);
        await this.prisma.blogBookmark.create({
            data: { userId, postId },
        });
        return { bookmarked: true };
    }

    // Отметить просмотр
    async trackView(postId: string, userId: string | undefined, ip: string, userAgent: string) {
        await Promise.all([
            this.prisma.blogPost.update({
                where: { id: postId },
                data: { views: { increment: 1 } },
            }),
            this.prisma.analyticsEvent.create({
                data: {
                    userId,
                    eventType: 'blog_view',
                    eventData: { postId, userAgent } as any,
                    ipAddress: ip,
                },
            }),
        ]);
        return { success: true };
    }

    // Получить комментарии (вложенные)
    async getComments(postId: string) {
        return this.prisma.blogComment.findMany({
            where: { postId, parentId: null },
            include: {
                user: { select: { id: true, name: true, avatar: true } },
                replies: {
                    include: {
                        user: { select: { id: true, name: true, avatar: true } },
                        replies: {
                            include: {
                                user: { select: { id: true, name: true, avatar: true } },
                            }
                        }
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Создать комментарий
    async createComment(postId: string, userId: string, dto: CreateCommentDto) {
        return this.prisma.blogComment.create({
            data: {
                content: dto.content,
                postId,
                userId,
                parentId: dto.parentId,
            },
            include: {
                user: { select: { id: true, name: true, avatar: true } },
            },
        });
    }

    // Удалить комментарий (Hard Delete для каскада)
    async deleteComment(commentId: string, userId: string) {
        const comment = await this.prisma.blogComment.findUnique({ where: { id: commentId } });

        if (!comment) {
            throw new NotFoundException('Комментарий не найден');
        }

        if (comment.userId !== userId) {
            throw new ForbiddenException('Нет прав для удаления');
        }

        // Hard delete для срабатывания Cascade (удаление ответов)
        await this.prisma.blogComment.delete({
            where: { id: commentId },
        });

        return { message: 'Комментарий удален' };
    }
}
