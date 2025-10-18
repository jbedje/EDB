import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CoachingStatus } from '@prisma/client';

@Injectable()
export class CoachingService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string, coachId?: string, status?: CoachingStatus) {
    return this.prisma.coachingSession.findMany({
      where: {
        ...(userId && { userId }),
        ...(coachId && { coachId }),
        ...(status && { status }),
      },
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
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        cohort: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const session = await this.prisma.coachingSession.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            bio: true,
          },
        },
        cohort: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Session de coaching introuvable');
    }

    return session;
  }

  async assignCoach(sessionId: string, coachId: string) {
    const session = await this.findOne(sessionId);

    // Vérifier que le coach existe
    const coach = await this.prisma.user.findUnique({
      where: { id: coachId },
    });

    if (!coach || coach.role !== 'COACH') {
      throw new NotFoundException('Coach introuvable');
    }

    return this.prisma.coachingSession.update({
      where: { id: sessionId },
      data: { coachId },
    });
  }

  async updateFeedback(sessionId: string, feedback: string, isCoach: boolean) {
    await this.findOne(sessionId);

    return this.prisma.coachingSession.update({
      where: { id: sessionId },
      data: isCoach
        ? { feedbackFromCoach: feedback }
        : { feedbackFromUser: feedback },
    });
  }

  async updateStatus(sessionId: string, status: CoachingStatus) {
    await this.findOne(sessionId);

    return this.prisma.coachingSession.update({
      where: { id: sessionId },
      data: { status },
    });
  }

  async checkExpiringSessions() {
    const now = new Date();
    const reminderDays = [7, 14, 30];

    const expiringSessions = await this.prisma.coachingSession.findMany({
      where: {
        status: 'ACTIVE',
        isFree: true,
        endDate: {
          gte: now,
          lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        user: true,
      },
    });

    return expiringSessions;
  }
}
