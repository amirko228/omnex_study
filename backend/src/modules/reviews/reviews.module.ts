// ============================================================================
// REVIEWS MODULE — Отзывы на курсы
// ============================================================================

import { Module } from '@nestjs/common';
import { ReviewActionsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [ReviewActionsController],
    providers: [ReviewsService],
    exports: [ReviewsService],
})
export class ReviewsModule { }
