import { Controller, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, Public } from '../../common/decorators';

// Выносим вспомогательные эндпоинты, которые не зависят от courseId в URL (или зависят по-другому)
@ApiTags('reviews')
@Controller('reviews')
export class ReviewActionsController {
    constructor(private reviewsService: ReviewsService) { }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    @ApiBearerAuth()
    async update(
        @CurrentUser('id') userId: string,
        @Param('id') id: string,
        @Body() body: { rating?: number; comment?: string },
    ) {
        return this.reviewsService.updateReview(id, userId, body.rating, body.comment);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @ApiBearerAuth()
    async delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
        return this.reviewsService.deleteReview(id, userId);
    }
}
