import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
    constructor(private notificationsService: NotificationsService) { }

    // GET /notifications
    @Get()
    @ApiOperation({ summary: 'Все уведомления' })
    async findAll(
        @CurrentUser('id') userId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.notificationsService.findAll(userId, page, limit);
    }

    // GET /notifications/unread/count
    @Get('unread/count')
    @ApiOperation({ summary: 'Количество непрочитанных' })
    async getUnreadCount(@CurrentUser('id') userId: string) {
        return this.notificationsService.getUnreadCount(userId);
    }

    // GET /notifications/preferences
    @Get('preferences')
    @ApiOperation({ summary: 'Настройки уведомлений' })
    async getPreferences(@CurrentUser('id') userId: string) {
        return this.notificationsService.getPreferences(userId);
    }

    // PATCH /notifications/preferences
    @Patch('preferences')
    @ApiOperation({ summary: 'Обновить настройки уведомлений' })
    async updatePreferences(
        @CurrentUser('id') userId: string,
        @Body() body: Record<string, boolean>,
    ) {
        return this.notificationsService.updatePreferences(userId, body);
    }

    // PATCH /notifications/:id/read
    @Patch(':id/read')
    @ApiOperation({ summary: 'Отметить как прочитанное' })
    async markAsRead(
        @CurrentUser('id') userId: string,
        @Param('id') id: string,
    ) {
        return this.notificationsService.markAsRead(id, userId);
    }

    // PATCH /notifications/read-all
    @Patch('read-all')
    @ApiOperation({ summary: 'Отметить все как прочитанные' })
    async markAllAsRead(@CurrentUser('id') userId: string) {
        return this.notificationsService.markAllAsRead(userId);
    }

    // POST /notifications/push/subscribe
    @Post('push/subscribe')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Подписка на push-уведомления' })
    async subscribePush(
        @CurrentUser('id') userId: string,
        @Body() body: { subscription: any },
    ) {
        return this.notificationsService.subscribePush(userId, body.subscription);
    }

    // POST /notifications/push/unsubscribe
    @Post('push/unsubscribe')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Отписка от push-уведомлений' })
    async unsubscribePush(@CurrentUser('id') userId: string) {
        return this.notificationsService.unsubscribePush(userId);
    }

    // POST /notifications/test
    @Post('test')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Тестовое уведомление' })
    async sendTestNotification(@CurrentUser('id') userId: string) {
        return this.notificationsService.sendTestNotification(userId);
    }

    // DELETE /notifications/:id
    @Delete(':id')
    @ApiOperation({ summary: 'Удалить уведомление' })
    async delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
        return this.notificationsService.delete(id, userId);
    }

    // DELETE /notifications/all
    @Delete('all')
    @ApiOperation({ summary: 'Удалить все уведомления' })
    async deleteAll(@CurrentUser('id') userId: string) {
        return this.notificationsService.deleteAll(userId);
    }

    // POST /notifications/support — отправка email в поддержку (Help Center)
    @Post('support')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Отправить email в поддержку' })
    async sendSupportEmail(
        @CurrentUser('id') userId: string,
        @Body() body: { subject: string; message: string },
    ) {
        return this.notificationsService.sendSupportEmail(userId, body.subject, body.message);
    }
}

