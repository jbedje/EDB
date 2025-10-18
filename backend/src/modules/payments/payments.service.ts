import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { CinetPayService } from './providers/cinetpay.service';
import { OrangeMoneyService } from './providers/orange-money.service';
import { WaveService } from './providers/wave.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private cinetPay: CinetPayService,
    private orangeMoney: OrangeMoneyService,
    private wave: WaveService,
  ) {}

  async initiate(userId: string, subscriptionId: string, amount: number, method: PaymentMethod) {
    // Créer le paiement
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        subscriptionId,
        amount,
        method,
        status: 'PENDING',
      },
    });

    // Initier le paiement selon la méthode choisie
    let paymentUrl: string;

    switch (method) {
      case 'CINETPAY':
        paymentUrl = await this.cinetPay.initiatePayment(payment.id, amount);
        break;
      case 'ORANGE_MONEY':
        paymentUrl = await this.orangeMoney.initiatePayment(payment.id, amount);
        break;
      case 'WAVE':
        paymentUrl = await this.wave.initiatePayment(payment.id, amount);
        break;
      default:
        throw new BadRequestException('Méthode de paiement non supportée');
    }

    return {
      paymentId: payment.id,
      paymentUrl,
      amount,
      method,
    };
  }

  async handleCallback(paymentId: string, providerReference: string, status: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { subscription: true },
    });

    if (!payment) {
      throw new NotFoundException('Paiement introuvable');
    }

    const paymentStatus: PaymentStatus = status === 'success' ? 'COMPLETED' : 'FAILED';

    // Mettre à jour le paiement
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: paymentStatus,
        providerReference,
        paidAt: paymentStatus === 'COMPLETED' ? new Date() : null,
      },
    });

    // Si paiement réussi, activer l'abonnement
    if (paymentStatus === 'COMPLETED' && payment.subscriptionId) {
      await this.prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: { status: 'ACTIVE' },
      });
    }

    return { success: paymentStatus === 'COMPLETED' };
  }

  async findAll(userId?: string, status?: PaymentStatus) {
    return this.prisma.payment.findMany({
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
          },
        },
        subscription: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        user: true,
        subscription: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Paiement introuvable');
    }

    return payment;
  }

  async getStats() {
    const [total, completed, pending, failed] = await Promise.all([
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.payment.count({ where: { status: 'PENDING' } }),
      this.prisma.payment.count({ where: { status: 'FAILED' } }),
    ]);

    return {
      totalRevenue: completed._sum.amount || 0,
      totalPayments: total._count,
      completedPayments: completed._count,
      pendingPayments: pending,
      failedPayments: failed,
    };
  }
}
