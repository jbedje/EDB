import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getOverviewStats() {
    const [
      totalUsers,
      totalCohorts,
      totalSubscriptions,
      totalRevenue,
      activeCoaching,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.cohort.count(),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.prisma.coachingSession.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      totalUsers,
      totalCohorts,
      totalSubscriptions,
      totalRevenue: totalRevenue._sum.amount || 0,
      activeCoaching,
    };
  }

  async getUsersReport() {
    const [byRole, byStatus, recentUsers] = await Promise.all([
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      this.prisma.user.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    return { byRole, byStatus, recentUsers };
  }

  async getRevenueReport(startDate?: Date, endDate?: Date) {
    const payments = await this.prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        ...(startDate && endDate && {
          paidAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      },
      include: {
        subscription: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { paidAt: 'desc' },
    });

    const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      payments,
      total,
      count: payments.length,
    };
  }

  async getCohortsReport() {
    const cohorts = await this.prisma.cohort.findMany({
      include: {
        _count: {
          select: {
            members: true,
            sessions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return cohorts;
  }
}
