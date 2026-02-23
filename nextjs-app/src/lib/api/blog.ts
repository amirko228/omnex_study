import { apiClient } from '../api-client';

export interface BlogPost {
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
    published: boolean;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
        bio?: string;
    };
    _count?: {
        comments: number;
        userLikes: number;
        userBookmarks: number;
    };
    userLiked?: boolean;
    userBookmarked?: boolean;
}

export interface BlogComment {
    id: string;
    postId: string;
    userId: string;
    parentId?: string;
    content: string;
    likes: number;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        name: string;
        avatar?: string;
    };
    replies?: BlogComment[];
}

export interface CreateBlogPostDto {
    title: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    category: string;
    tags?: string[];
    readTime?: number;
    published?: boolean;
}

export interface UpdateBlogPostDto {
    title?: string;
    excerpt?: string;
    content?: string;
    coverImage?: string;
    category?: string;
    tags?: string[];
    readTime?: number;
    published?: boolean;
}

export interface CreateCommentDto {
    content: string;
    parentId?: string;
}

// Получить список постов
export async function getBlogPosts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    search?: string;
}) {
    const response = await apiClient.get<{
        data: BlogPost[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>('/blog', params as Record<string, string | number | boolean | undefined | null>);

    if (!response.success || !response.data) {
        return null;
    }
    return response.data;
}

// Получить популярные посты
export async function getPopularPosts(limit = 5) {
    const response = await apiClient.get<BlogPost[]>('/blog/popular', { limit });
    if (!response.success || !response.data) {
        return [];
    }
    return response.data;
}

// Получить избранные посты (лайки + закладки)
export async function getFavoritePosts() {
    const response = await apiClient.get<BlogPost[]>('/blog/favorites');
    if (!response.success || !response.data) {
        return [];
    }
    return response.data;
}

// Получить пост по slug
export async function getBlogPostBySlug(slug: string) {
    const response = await apiClient.get<BlogPost>(`/blog/${slug}`);
    if (!response.success || !response.data) {
        return null;
    }
    return response.data;
}

// Создать пост
export async function createBlogPost(data: CreateBlogPostDto) {
    const response = await apiClient.post<BlogPost>('/blog', data);
    if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to create post');
    }
    return response.data;
}

// Обновить пост
export async function updateBlogPost(id: string, data: UpdateBlogPostDto) {
    const response = await apiClient.put<BlogPost>(`/blog/${id}`, data);
    if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to update post');
    }
    return response.data;
}

// Удалить пост
export async function deleteBlogPost(id: string) {
    const response = await apiClient.delete<{ message: string }>(`/blog/${id}`);
    if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete post');
    }
    return response.data;
}

// Лайкнуть/убрать лайк
export async function toggleBlogLike(id: string) {
    return await apiClient.post<{ liked: boolean }>(`/blog/${id}/like`);
}

// Добавить/убрать закладку
export async function toggleBlogBookmark(id: string) {
    return await apiClient.post<{ bookmarked: boolean }>(`/blog/${id}/bookmark`);
}

// Отметить просмотр
export async function trackBlogView(id: string) {
    const response = await apiClient.post<{ success: boolean }>(`/blog/${id}/view`);
    return response.data;
}

// Получить комментарии
export async function getBlogComments(postId: string) {
    const response = await apiClient.get<BlogComment[]>(`/blog/${postId}/comments`);
    if (!response.success || !response.data) {
        return [];
    }
    return response.data;
}

// Добавить комментарий
export async function createBlogComment(postId: string, data: CreateCommentDto) {
    const response = await apiClient.post<BlogComment>(`/blog/${postId}/comments`, data);
    if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to create comment');
    }
    return response.data;
}

// Удалить комментарий
export async function deleteBlogComment(commentId: string) {
    const response = await apiClient.delete<{ message: string }>(`/blog/comments/${commentId}`);
    if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete comment');
    }
    return response.data;
}
