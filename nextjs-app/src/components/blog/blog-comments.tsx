'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    MessageCircle,
    Send,
    Reply,
    Trash2,
    MoreVertical,
    MessageSquare
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import { toast } from 'sonner';
import { createBlogComment, deleteBlogComment, type BlogComment } from '@/lib/api/blog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BlogCommentsProps {
    postId: string;
    comments: BlogComment[];
    currentUserId?: string;
    locale: string;
    onCommentAdded: () => void;
    dict: Record<string, string>;
}

export function BlogComments({
    postId,
    comments,
    currentUserId,
    locale,
    onCommentAdded,
    dict
}: BlogCommentsProps) {
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyTo, setReplyTo] = useState<string | null>(null);

    const dateLocale = locale === 'ru' ? ru : enUS;

    // Recursive function to count all comments including replies
    const countTotalComments = (items: BlogComment[]): number => {
        let count = items.length;
        items.forEach((item) => {
            if (item.replies && item.replies.length > 0) {
                count += countTotalComments(item.replies);
            }
        });
        return count;
    };

    const totalComments = countTotalComments(comments);

    const handleSubmit = async (parentId?: string) => {
        const content = parentId ? (document.getElementById(`reply-${parentId}`) as HTMLTextAreaElement)?.value : newComment;

        if (!content?.trim()) return;

        if (!currentUserId) {
            toast.error(dict.login_required || 'Please login to comment');
            return;
        }

        setIsSubmitting(true);
        try {
            await createBlogComment(postId, {
                content: content.trim(),
                parentId
            });

            if (parentId) {
                setReplyTo(null);
            } else {
                setNewComment('');
            }

            onCommentAdded();
            toast.success(dict.comment_added || 'Comment added');
        } catch {
            toast.error(dict.error_adding || 'Failed to add comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        try {
            await deleteBlogComment(commentId);
            onCommentAdded();
            toast.success(dict.comment_deleted || 'Comment deleted');
        } catch {
            toast.error(dict.error_deleting || 'Failed to delete comment');
        }
    };

    return (
        <div className="mt-12 md:mt-16 bg-card rounded-2xl border p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <MessageSquare className="h-5 w-5" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">
                    {dict.title || 'Comments'} ({totalComments})
                </h2>
            </div>

            {/* Main Comment Input */}
            <div className="flex gap-4 mb-10">
                <Avatar className="h-10 w-10 shrink-0 border">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                        {currentUserId ? 'U' : '?'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                    <Textarea
                        placeholder={dict.placeholder || 'Write a comment...'}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[100px] resize-none focus:border-primary border-2 rounded-xl"
                    />
                    <div className="flex justify-end">
                        <Button
                            onClick={() => handleSubmit()}
                            disabled={isSubmitting || !newComment.trim()}
                            className="rounded-full px-6"
                        >
                            {isSubmitting ? '...' : dict.post_button || 'Post Comment'}
                            <Send className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            currentUserId={currentUserId}
                            dateLocale={dateLocale}
                            onReply={(id) => setReplyTo(id)}
                            onDelete={handleDelete}
                            onCancelReply={() => setReplyTo(null)}
                            isReplying={replyTo === comment.id}
                            onReplySubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                            dict={dict}
                        />
                    ))
                ) : (
                    <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-xl border-2 border-dashed">
                        <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>{dict.no_comments || 'No comments yet. Be the first to share your thoughts!'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

interface CommentItemProps {
    comment: BlogComment;
    currentUserId?: string;
    dateLocale: Locale;
    onReply: (id: string) => void;
    onDelete: (id: string) => void;
    onCancelReply: () => void;
    isReplying: boolean;
    onReplySubmit: (parentId: string) => void;
    isSubmitting: boolean;
    isReply?: boolean;
    dict: Record<string, string>;
}

function CommentItem({
    comment,
    currentUserId,
    dateLocale,
    onReply,
    onDelete,
    onCancelReply,
    isReplying,
    onReplySubmit,
    isSubmitting,
    isReply = false,
    dict
}: CommentItemProps) {
    return (
        <div className={`flex gap-4 ${isReply ? 'mt-4 border-l-2 pl-4 md:pl-6' : ''}`}>
            <Avatar className={`${isReply ? 'h-8 w-8' : 'h-10 w-10'} border`}>
                <AvatarImage src={comment.user.avatar} />
                <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <div className="bg-muted/40 rounded-2xl px-5 py-4 hover:bg-muted/60 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <span className="font-bold text-sm md:text-base mr-3">{comment.user.name}</span>
                            <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.createdAt), {
                                    addSuffix: true,
                                    locale: dateLocale
                                })}
                            </span>
                        </div>

                        {currentUserId === comment.userId && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive gap-2"
                                        onClick={() => onDelete(comment.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        {dict.delete || 'Delete'}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                    </p>
                </div>

                <div className="flex items-center gap-4 mt-2 px-2">
                    {!isReply && (
                        <button
                            onClick={() => onReply(comment.id)}
                            className="text-xs font-semibold text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors"
                        >
                            <Reply className="h-3 w-3" />
                            {dict.reply || 'Reply'}
                        </button>
                    )}
                </div>

                {/* Reply Input */}
                {isReplying && (
                    <div className="mt-4 space-y-3">
                        <Textarea
                            id={`reply-${comment.id}`}
                            placeholder={dict.reply_placeholder || 'Write a reply...'}
                            className="min-h-[80px] resize-none border-2 focus:border-primary rounded-xl"
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onCancelReply}
                                className="rounded-full"
                            >
                                {dict.cancel || 'Cancel'}
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => onReplySubmit(comment.id)}
                                disabled={isSubmitting}
                                className="rounded-full px-4"
                            >
                                {isSubmitting ? '...' : dict.reply_button || 'Reply'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-2 space-y-1">
                        {comment.replies.map((reply) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                currentUserId={currentUserId}
                                dateLocale={dateLocale}
                                onReply={onReply}
                                onDelete={onDelete}
                                onCancelReply={onCancelReply}
                                isReplying={isReplying && reply.id === 'NOT_POSSIBLE'} // We don't support nesting beyond 1 level for replies input for now to keep it simple
                                onReplySubmit={onReplySubmit}
                                isSubmitting={isSubmitting}
                                isReply={true}
                                dict={dict}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
