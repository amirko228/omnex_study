// ============================================================================
// COURSES MODULE
// ============================================================================

import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { AuthModule } from '../auth/auth.module';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
    imports: [AuthModule, ReviewsModule],
    controllers: [CoursesController],
    providers: [CoursesService],
    exports: [CoursesService],
})
export class CoursesModule { }
