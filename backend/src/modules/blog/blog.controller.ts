import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
    Ip,
    Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { CreateBlogPostDto, UpdateBlogPostDto, CreateCommentDto } from './dto/blog.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { CurrentUser } from '../../common/decorators';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
    constructor(private blogService: BlogService) { }

    @Get()
    @ApiOperation({ summary: 'Получить список постов блога' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    @ApiQuery({ name: 'category', required: false })
    @ApiQuery({ name: 'tag', required: false })
    @ApiQuery({ name: 'search', required: false })
    async getPosts(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('category') category?: string,
        @Query('tag') tag?: string,
        @Query('search') search?: string,
    ) {
        return this.blogService.getPosts({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
            category,
            tag,
            search,
            published: true,
        });
    }

    @Get('popular')
    @ApiOperation({ summary: 'Получить популярные посты' })
    @ApiQuery({ name: 'limit', required: false, example: 5 })
    async getPopularPosts(@Query('limit') limit?: string) {
        return this.blogService.getPopularPosts(limit ? parseInt(limit, 10) : 5);
    }

    @Get('favorites')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Получить избранные посты (лайки + закладки)' })
    async getFavoritePosts(@CurrentUser('id') userId: string) {
        return this.blogService.getFavoritePosts(userId);
    }

    @Get(':slug')
    @UseGuards(OptionalAuthGuard)
    @ApiOperation({ summary: 'Получить пост по slug' })
    async getPost(@Param('slug') slug: string, @CurrentUser('id') userId?: string) {
        return this.blogService.getPostBySlug(slug, userId);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Создать пост блога' })
    async createPost(@CurrentUser('id') userId: string, @Body() dto: CreateBlogPostDto) {
        return this.blogService.createPost(userId, dto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Обновить пост' })
    async updatePost(
        @Param('id') postId: string,
        @CurrentUser('id') userId: string,
        @Body() dto: UpdateBlogPostDto,
    ) {
        return this.blogService.updatePost(postId, userId, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Удалить пост' })
    async deletePost(@Param('id') postId: string, @CurrentUser('id') userId: string) {
        return this.blogService.deletePost(postId, userId);
    }

    @Post(':id/like')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Лайкнуть/убрать лайк поста' })
    async likePost(@Param('id') postId: string, @CurrentUser('id') userId: string) {
        return this.blogService.likePost(postId, userId);
    }

    @Post(':id/bookmark')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Добавить/убрать из закладок' })
    async bookmarkPost(@Param('id') postId: string, @CurrentUser('id') userId: string) {
        return this.blogService.bookmarkPost(postId, userId);
    }

    @Post(':id/view')
    @UseGuards(OptionalAuthGuard)
    @ApiOperation({ summary: 'Отметить просмотр поста' })
    async trackView(
        @Param('id') postId: string,
        @CurrentUser('id') userId: string | undefined,
        @Ip() ip: string,
        @Headers('user-agent') userAgent: string,
    ) {
        return this.blogService.trackView(postId, userId, ip, userAgent);
    }

    @Get(':id/comments')
    @ApiOperation({ summary: 'Получить комментарии к посту' })
    async getComments(@Param('id') postId: string) {
        return this.blogService.getComments(postId);
    }

    @Post(':id/comments')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Добавить комментарий' })
    async createComment(
        @Param('id') postId: string,
        @CurrentUser('id') userId: string,
        @Body() dto: CreateCommentDto,
    ) {
        return this.blogService.createComment(postId, userId, dto);
    }

    @Delete('comments/:commentId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Удалить комментарий' })
    async deleteComment(@Param('commentId') commentId: string, @CurrentUser('id') userId: string) {
        return this.blogService.deleteComment(commentId, userId);
    }
}
