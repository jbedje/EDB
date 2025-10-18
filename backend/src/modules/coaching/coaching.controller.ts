import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CoachingService } from './coaching.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, CoachingStatus } from '@prisma/client';


@Controller('coaching')
@UseGuards(JwtAuthGuard, RolesGuard)

export class CoachingController {
  constructor(private readonly coachingService: CoachingService) {}

  @Get()
  
  async findAll(
    @Query('userId') userId?: string,
    @Query('coachId') coachId?: string,
    @Query('status') status?: CoachingStatus,
  ) {
    return this.coachingService.findAll(userId, coachId, status);
  }

  @Get('my-sessions')
  
  async getMySessions(@CurrentUser('id') userId: string) {
    return this.coachingService.findAll(userId);
  }

  @Get('my-coaching')
  @Roles(UserRole.COACH)
  
  async getMyCoaching(@CurrentUser('id') coachId: string) {
    return this.coachingService.findAll(undefined, coachId);
  }

  @Get(':id')
  
  async findOne(@Param('id') id: string) {
    return this.coachingService.findOne(id);
  }

  @Put(':id/assign-coach')
  @Roles(UserRole.ADMIN)
  
  async assignCoach(
    @Param('id') sessionId: string,
    @Body('coachId') coachId: string,
  ) {
    return this.coachingService.assignCoach(sessionId, coachId);
  }

  @Put(':id/feedback')
  
  async addFeedback(
    @Param('id') sessionId: string,
    @Body('feedback') feedback: string,
    @CurrentUser() user: any,
  ) {
    const isCoach = user.role === UserRole.COACH;
    return this.coachingService.updateFeedback(sessionId, feedback, isCoach);
  }

  @Put(':id/status')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  
  async updateStatus(
    @Param('id') sessionId: string,
    @Body('status') status: CoachingStatus,
  ) {
    return this.coachingService.updateStatus(sessionId, status);
  }
}

