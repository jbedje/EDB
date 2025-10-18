import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CohortStatus, FormationType } from '@prisma/client';

@Injectable()
export class CohortsService {
  constructor(private prisma: PrismaService) {}

  async create(createData: any) {
    const { startDate, endDate, maxStudents, ...rest } = createData;

    if (endDate && new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestException('La date de fin doit être après la date de début');
    }

    const cohort = await this.prisma.cohort.create({
      data: {
        ...rest,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        maxStudents,
        status: 'DRAFT',
      },
    });

    return cohort;
  }

  async findAll(status?: CohortStatus, type?: FormationType) {
    return this.prisma.cohort.findMany({
      where: {
        ...(status && { status }),
        ...(type && { type }),
      },
      include: {
        members: {
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
          },
        },
        _count: {
          select: {
            members: true,
            sessions: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id },
      include: {
        members: {
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
          },
        },
        sessions: {
          include: {
            coach: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!cohort) {
      throw new NotFoundException('Cohorte introuvable');
    }

    return cohort;
  }

  async update(id: string, updateData: any) {
    await this.findOne(id);

    const { startDate, endDate, ...rest } = updateData;

    return this.prisma.cohort.update({
      where: { id },
      data: {
        ...rest,
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id);

    await this.prisma.cohort.delete({
      where: { id },
    });

    return { message: 'Cohorte supprimée avec succès' };
  }

  async addMember(cohortId: string, userId: string) {
    const cohort = await this.findOne(cohortId);

    // Vérifier si l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // Vérifier si l'utilisateur est déjà membre
    const existingMember = await this.prisma.cohortMember.findUnique({
      where: {
        cohortId_userId: {
          cohortId,
          userId,
        },
      },
    });

    if (existingMember) {
      throw new BadRequestException('L\'utilisateur est déjà membre de cette cohorte');
    }

    // Vérifier le nombre maximum de participants
    if (cohort.maxStudents) {
      const currentMembersCount = await this.prisma.cohortMember.count({
        where: { cohortId },
      });

      if (currentMembersCount >= cohort.maxStudents) {
        throw new BadRequestException('La cohorte est complète');
      }
    }

    const member = await this.prisma.cohortMember.create({
      data: {
        cohortId,
        userId,
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
      },
    });

    // Créer automatiquement une session de coaching gratuit de 3 mois
    const coachingStartDate = new Date();
    const coachingEndDate = new Date();
    coachingEndDate.setMonth(coachingEndDate.getMonth() + 3);

    await this.prisma.coachingSession.create({
      data: {
        userId,
        cohortId,
        startDate: coachingStartDate,
        endDate: coachingEndDate,
        isFree: true,
        status: 'ACTIVE',
      },
    });

    return member;
  }

  async removeMember(cohortId: string, userId: string) {
    await this.findOne(cohortId);

    const member = await this.prisma.cohortMember.findUnique({
      where: {
        cohortId_userId: {
          cohortId,
          userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Membre introuvable dans cette cohorte');
    }

    await this.prisma.cohortMember.delete({
      where: {
        cohortId_userId: {
          cohortId,
          userId,
        },
      },
    });

    return { message: 'Membre retiré de la cohorte avec succès' };
  }

  async updateMemberProgress(cohortId: string, userId: string, progress: number) {
    const member = await this.prisma.cohortMember.findUnique({
      where: {
        cohortId_userId: {
          cohortId,
          userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Membre introuvable dans cette cohorte');
    }

    return this.prisma.cohortMember.update({
      where: {
        cohortId_userId: {
          cohortId,
          userId,
        },
      },
      data: {
        progress: Math.min(Math.max(progress, 0), 100), // Entre 0 et 100
      },
    });
  }

  async getStats() {
    const [total, active, completed, draft] = await Promise.all([
      this.prisma.cohort.count(),
      this.prisma.cohort.count({ where: { status: 'ACTIVE' } }),
      this.prisma.cohort.count({ where: { status: 'COMPLETED' } }),
      this.prisma.cohort.count({ where: { status: 'DRAFT' } }),
    ]);

    return {
      total,
      active,
      completed,
      draft,
    };
  }
}
