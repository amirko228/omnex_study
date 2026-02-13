import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';

@ApiTags('progress')
@Controller('progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProgressController {
    constructor(private progressService: ProgressService) { }

    @Get()
    @ApiOperation({ summary: 'Общий прогресс обучения' })
    async getProgress(@CurrentUser('id') userId: string) {
        return this.progressService.getUserProgress(userId);
    }
}
