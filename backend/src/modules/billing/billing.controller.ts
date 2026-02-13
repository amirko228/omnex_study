import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, Public } from '../../common/decorators';

@ApiTags('billing')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BillingController {
    constructor(private billingService: BillingService) { }

    // POST /payments/subscribe — Подписка
    @Post('subscribe')
    @ApiOperation({ summary: 'Оформить подписку' })
    async subscribe(
        @CurrentUser('id') userId: string,
        @Body() body: { plan: string },
    ) {
        return this.billingService.subscribe(userId, body.plan);
    }

    // POST /payments/courses/:id/purchase — Купить курс
    @Post('courses/:id/purchase')
    @ApiOperation({ summary: 'Купить курс' })
    async purchaseCourse(
        @CurrentUser('id') userId: string,
        @Param('id') courseId: string,
    ) {
        return this.billingService.purchaseCourse(userId, courseId);
    }

    // GET /payments/history — История
    @Get('history')
    @ApiOperation({ summary: 'История платежей' })
    async getHistory(@CurrentUser('id') userId: string) {
        return this.billingService.getPaymentHistory(userId);
    }

    // POST /payments/promo-codes/validate — Валидация промокода
    @Public()
    @Post('promo-codes/validate')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Проверить промокод' })
    async validatePromo(@Body() body: { code: string }) {
        return this.billingService.validatePromoCode(body.code);
    }

    // ==========================================
    // НОВЫЕ ЭНДПОИНТЫ
    // ==========================================

    // POST /payments/create — Создать платёж
    @Post('create')
    @ApiOperation({ summary: 'Создать платёж' })
    async createPayment(
        @CurrentUser('id') userId: string,
        @Body() body: { amount: number; currency?: string; courseId?: string; provider?: string },
    ) {
        return this.billingService.createPayment(userId, body);
    }

    // POST /payments/:id/confirm — Подтвердить платёж
    @Post(':id/confirm')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Подтвердить платёж' })
    async confirmPayment(
        @Param('id') paymentId: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.billingService.confirmPayment(paymentId, userId);
    }

    // GET /payments/:id — Получить платёж
    @Get(':id')
    @ApiOperation({ summary: 'Получить платёж по ID' })
    async getPayment(
        @Param('id') paymentId: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.billingService.getPaymentById(paymentId, userId);
    }

    // POST /payments/:id/refund — Возврат платежа
    @Post(':id/refund')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Запросить возврат' })
    async refundPayment(
        @Param('id') paymentId: string,
        @CurrentUser('id') userId: string,
        @Body() body: { reason?: string },
    ) {
        return this.billingService.refundPayment(paymentId, userId, body.reason);
    }

    // GET /payments/methods — Методы оплаты
    @Get('methods')
    @ApiOperation({ summary: 'Получить методы оплаты' })
    async getPaymentMethods(@CurrentUser('id') userId: string) {
        return this.billingService.getPaymentMethods(userId);
    }

    // POST /payments/methods/update — Обновить метод оплаты
    @Post('methods/update')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Обновить метод оплаты' })
    async updatePaymentMethod(
        @CurrentUser('id') userId: string,
        @Body() body: any,
    ) {
        return this.billingService.updatePaymentMethod(userId, body);
    }

    // DELETE /payments/methods/:id — Удалить метод оплаты
    @Delete('methods/:id')
    @ApiOperation({ summary: 'Удалить метод оплаты' })
    async removePaymentMethod(
        @CurrentUser('id') userId: string,
        @Param('id') methodId: string,
    ) {
        return this.billingService.removePaymentMethod(userId, methodId);
    }

    // GET /payments/transactions — Транзакции (пагинация)
    @Get('transactions')
    @ApiOperation({ summary: 'Список транзакций' })
    async getTransactions(
        @CurrentUser('id') userId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.billingService.getTransactions(userId, {
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });
    }

    // GET /payments/transactions/:id/invoice — Инвойс
    @Get('transactions/:id/invoice')
    @ApiOperation({ summary: 'Получить инвойс' })
    async getInvoice(
        @Param('id') transactionId: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.billingService.getInvoice(transactionId, userId);
    }

    // POST /payments/promo-codes/apply — Применить промокод
    @Post('promo-codes/apply')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Применить промокод' })
    async applyPromoCode(
        @CurrentUser('id') userId: string,
        @Body() body: { code: string },
    ) {
        return this.billingService.applyPromoCode(body.code, userId);
    }
}

