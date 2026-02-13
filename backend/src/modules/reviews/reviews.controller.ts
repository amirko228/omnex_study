import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, Public } from '../../common/decorators';

@ApiTags('reviews')
@Controller()
export class ReviewsController {
    constructor(private reviewsService: ReviewsService) { }

    @Public()
    @Get('courses/:courseId/reviews')
    @ApiOperation({ summary: 'Отзывы на курс' })
    async getCourseReviews(
        @Param('courseId') courseId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.reviewsService.getCourseReviews(courseId, page, limit);
    }

    @UseGuards(JwtAuthGuard)
    @Post('courses/:courseId/reviews')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Оставить отзыв' })
    async create(
        @CurrentUser('id') userId: string,
        @Param('courseId') courseId: string,
        @Body() body: { rating: number; comment?: string },
    ) {
        return this.reviewsService.createReview(userId, courseId, body.rating, body.comment);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('reviews/:id')
    @ApiBearerAuth()
    async update(
        @CurrentUser('id') userId: string,
        @Param('id') id: string,
        @Body() body: { rating?: number; comment?: string },
    ) {
        return this.reviewsService.updateReview(id, userId, body.rating, body.comment);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('reviews/:id')
    @ApiBearerAuth()
    async delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
        return this.reviewsService.deleteReview(id, userId);
    }

    // POST /reviews/:id/helpful — Полезный отзыв
    @UseGuards(JwtAuthGuard)
    @Post('reviews/:id/helpful')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Отметить отзыв как полезный' })
    async markHelpful(
        @CurrentUser('id') userId: string,
        @Param('id') reviewId: string,
    ) {
        return this.reviewsService.markHelpful(reviewId, userId);
    }

    // POST /reviews/:id/report — Пожаловаться
    @UseGuards(JwtAuthGuard)
    @Post('reviews/:id/report')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Пожаловаться на отзыв' })
    async report(
        @CurrentUser('id') userId: string,
        @Param('id') reviewId: string,
        @Body() body: { reason?: string },
    ) {
        return this.reviewsService.reportReview(reviewId, userId, body.reason);
    }
}

