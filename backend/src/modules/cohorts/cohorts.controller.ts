import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CohortsService } from './cohorts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, CohortStatus, FormationType } from '@prisma/client';


@Controller('cohorts')
@UseGuards(JwtAuthGuard, RolesGuard)

export class CohortsController {
  constructor(private readonly cohortsService: CohortsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  
  async create(@Body() createData: any) {
    return this.cohortsService.create(createData);
  }

  @Get()
  
  async findAll(
    @Query('status') status?: CohortStatus,
    @Query('type') type?: FormationType,
  ) {
    return this.cohortsService.findAll(status, type);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  
  async getStats() {
    return this.cohortsService.getStats();
  }

  @Get(':id')
  
  async findOne(@Param('id') id: string) {
    return this.cohortsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  
  async update(@Param('id') id: string, @Body() updateData: any) {
    return this.cohortsService.update(id, updateData);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  
  async delete(@Param('id') id: string) {
    return this.cohortsService.delete(id);
  }

  @Post(':id/members')
  @Roles(UserRole.ADMIN)
  
  async addMember(
    @Param('id') cohortId: string,
    @Body('userId') userId: string,
  ) {
    return this.cohortsService.addMember(cohortId, userId);
  }

  @Delete(':id/members/:userId')
  @Roles(UserRole.ADMIN)
  
  async removeMember(
    @Param('id') cohortId: string,
    @Param('userId') userId: string,
  ) {
    return this.cohortsService.removeMember(cohortId, userId);
  }

  @Put(':id/members/:userId/progress')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  
  async updateProgress(
    @Param('id') cohortId: string,
    @Param('userId') userId: string,
    @Body('progress') progress: number,
  ) {
    return this.cohortsService.updateMemberProgress(cohortId, userId, progress);
  }
}

