import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminDashboard() {
    const [
      users,
      cohorts,
      subscriptions,
      revenue,
      recentPayments,
      activeSessions,
    ] = await Promise.all([
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      this.prisma.cohort.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.prisma.payment.findMany({
        take: 5,
        where: { status: 'COMPLETED' },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { paidAt: 'desc' },
      }),
      this.prisma.coachingSession.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      users,
      cohorts,
      activeSubscriptions: subscriptions,
      totalRevenue: revenue._sum.amount || 0,
      recentPayments,
      activeSessions,
    };
  }

  async getCoachDashboard(coachId: string) {
    const [sessions, students, cohorts] = await Promise.all([
      this.prisma.coachingSession.findMany({
        where: { coachId, status: 'ACTIVE' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          cohort: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.coachingSession.count({ where: { coachId } }),
      this.prisma.cohort.findMany({
        where: {
          sessions: {
            some: { coachId },
          },
        },
        include: {
          _count: {
            select: { members: true },
          },
        },
      }),
    ]);

    return {
      activeSessions: sessions,
      totalStudents: students,
      cohorts,
    };
  }

  async getApprenantDashboard(userId: string) {
    const [cohorts, coaching, subscriptions, progress] = await Promise.all([
      this.prisma.cohortMember.findMany({
        where: { userId },
        include: {
          cohort: {
            select: {
              id: true,
              name: true,
              type: true,
              startDate: true,
              endDate: true,
            },
          },
        },
      }),
      this.prisma.coachingSession.findFirst({
        where: { userId, status: 'ACTIVE' },
        include: {
          coach: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.subscription.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 1,
      }),
      this.prisma.cohortMember.aggregate({
        where: { userId },
        _avg: { progress: true },
      }),
    ]);

    return {
      cohorts,
      activeCoaching: coaching,
      currentSubscription: subscriptions[0] || null,
      averageProgress: progress._avg.progress || 0,
    };
  }

  async getDashboard(userId: string, userRole: UserRole) {
    switch (userRole) {
      case 'ADMIN':
        return this.getAdminDashboard();
      case 'COACH':
        return this.getCoachDashboard(userId);
      case 'APPRENANT':
        return this.getApprenantDashboard(userId);
      default:
        return {};
    }
  }
}
