import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';

import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, SubscriptionType, SubscriptionStatus } from '@prisma/client';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto';


@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)

export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(
    @CurrentUser('id') currentUserId: string,
    @Body() createDto: CreateSubscriptionDto,
  ) {
    const userId = createDto.userId || currentUserId;
    return this.subscriptionsService.create(userId, createDto.type, createDto.price, currentUserId);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(
    @Query('userId') userId?: string,
    @Query('status') status?: SubscriptionStatus,
  ) {
    return this.subscriptionsService.findAll(userId, status);
  }

  @Get('my-subscriptions')
  async getMySubscriptions(@CurrentUser('id') userId: string) {
    return this.subscriptionsService.findAll(userId);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN)
  async getStatistics() {
    return this.subscriptionsService.getStatistics();
  }

  @Get('expiring')
  @Roles(UserRole.ADMIN)
  async getExpiring() {
    return this.subscriptionsService.checkExpiring();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.update(id, updateDto.status, updateDto.autoRenew);
  }

  @Put(':id/cancel')
  async cancel(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.subscriptionsService.cancel(id, reason);
  }

  @Put(':id/activate')
  @Roles(UserRole.ADMIN)
  async activate(@Param('id') id: string) {
    return this.subscriptionsService.activate(id);
  }

  @Put(':id/renew')
  async renew(@Param('id') id: string) {
    return this.subscriptionsService.renew(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    return this.subscriptionsService.delete(id);
  }

  @Post('auto-renew')
  @Roles(UserRole.ADMIN)
  async autoRenew() {
    return this.subscriptionsService.autoRenewSubscriptions();
  }
}
