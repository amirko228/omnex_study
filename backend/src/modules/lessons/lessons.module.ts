import { Module } from '@nestjs/common';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [AuthModule, NotificationsModule],
    controllers: [LessonsController],
    providers: [LessonsService],
    exports: [LessonsService],
})
export class LessonsModule { }
