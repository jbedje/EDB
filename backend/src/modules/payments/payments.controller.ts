import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';

import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole, PaymentMethod, PaymentStatus } from '@prisma/client';


@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  
  
  async initiate(
    @CurrentUser('id') userId: string,
    @Body('subscriptionId') subscriptionId: string,
    @Body('amount') amount: number,
    @Body('method') method: PaymentMethod,
  ) {
    return this.paymentsService.initiate(userId, subscriptionId, amount, method);
  }

  @Post('callback/:provider')
  @Public()
  async handleCallback(
    @Param('provider') provider: string,
    @Body() callbackData: any,
  ) {
    return this.paymentsService.handleCallback(
      callbackData.paymentId,
      callbackData.providerReference,
      callbackData.status,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(
    @Query('userId') userId?: string,
    @Query('status') status?: PaymentStatus,
  ) {
    return this.paymentsService.findAll(userId, status);
  }

  @Get('my-payments')
  @UseGuards(JwtAuthGuard)
  
  
  async getMyPayments(@CurrentUser('id') userId: string) {
    return this.paymentsService.findAll(userId);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  
  
  async getStats() {
    return this.paymentsService.getStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  
  
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }
}

