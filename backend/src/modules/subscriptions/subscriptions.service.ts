import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { SubscriptionType, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, type: SubscriptionType, price: number, adminUserId?: string) {
    const startDate = new Date();
    const endDate = new Date();

    // Calculer la date de fin selon le type
    switch (type) {
      case 'MONTHLY':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'QUARTERLY':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'YEARLY':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    // Si créé par un admin, statut ACTIVE par défaut, sinon PENDING_PAYMENT
    const status = adminUserId ? 'ACTIVE' : 'PENDING_PAYMENT';

    return this.prisma.subscription.create({
      data: {
        userId,
        type,
        price,
        startDate,
        endDate,
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async findAll(userId?: string, status?: SubscriptionStatus) {
    return this.prisma.subscription.findMany({
      where: {
        ...(userId && { userId }),
        ...(status && { status }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            phone: true,
          },
        },
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Abonnement introuvable');
    }

    return subscription;
  }

  async update(id: string, status?: SubscriptionStatus, autoRenew?: boolean) {
    await this.findOne(id);

    return this.prisma.subscription.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(autoRenew !== undefined && { autoRenew }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        payments: true,
      },
    });
  }

  async cancel(id: string, reason?: string) {
    await this.findOne(id);

    return this.prisma.subscription.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: reason,
        autoRenew: false,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async activate(id: string) {
    await this.findOne(id);

    return this.prisma.subscription.update({
      where: { id },
      data: { status: 'ACTIVE' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async renew(id: string) {
    const subscription = await this.findOne(id);

    if (subscription.status === 'CANCELLED') {
      throw new BadRequestException('Impossible de renouveler un abonnement annulé');
    }

    const newEndDate = new Date(subscription.endDate);

    switch (subscription.type) {
      case 'MONTHLY':
        newEndDate.setMonth(newEndDate.getMonth() + 1);
        break;
      case 'QUARTERLY':
        newEndDate.setMonth(newEndDate.getMonth() + 3);
        break;
      case 'YEARLY':
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);
        break;
    }

    return this.prisma.subscription.update({
      where: { id },
      data: {
        endDate: newEndDate,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id);

    return this.prisma.subscription.delete({
      where: { id },
    });
  }

  async getStatistics() {
    const [total, active, expired, cancelled, pendingPayment] = await Promise.all([
      this.prisma.subscription.count(),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.subscription.count({ where: { status: 'EXPIRED' } }),
      this.prisma.subscription.count({ where: { status: 'CANCELLED' } }),
      this.prisma.subscription.count({ where: { status: 'PENDING_PAYMENT' } }),
    ]);

    const revenue = await this.prisma.subscription.aggregate({
      where: { status: 'ACTIVE' },
      _sum: { price: true },
    });

    const monthlyRevenue = await this.prisma.subscription.aggregate({
      where: {
        status: 'ACTIVE',
        type: 'MONTHLY',
      },
      _sum: { price: true },
    });

    return {
      total,
      active,
      expired,
      cancelled,
      pendingPayment,
      totalRevenue: revenue._sum.price || 0,
      monthlyRevenue: monthlyRevenue._sum.price || 0,
    };
  }

  async checkExpiring() {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: now,
          lte: in7Days,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async autoRenewSubscriptions() {
    const now = new Date();

    const expiredWithAutoRenew = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        autoRenew: true,
        endDate: {
          lte: now,
        },
      },
    });

    const renewed = [];
    for (const subscription of expiredWithAutoRenew) {
      try {
        const renewedSub = await this.renew(subscription.id);
        renewed.push(renewedSub);
      } catch (error) {
        console.error(`Erreur lors du renouvellement de l'abonnement ${subscription.id}:`, error);
      }
    }

    return renewed;
  }
}
