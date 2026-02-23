import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [AuthModule, NotificationsModule],
    controllers: [AIController],
    providers: [AIService],
    exports: [AIService],
})
export class AIModule { }
