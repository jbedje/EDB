import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { User, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(role?: UserRole, status?: UserStatus) {
    return this.prisma.user.findMany({
      where: {
        ...(role && { role }),
        ...(status && { status }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        avatar: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        avatar: true,
        bio: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return user;
  }

  async update(id: string, updateData: any) {
    const user = await this.findOne(id);

    // Si l'email est modifié, vérifier qu'il n'est pas déjà utilisé
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (existingUser) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
    }

    // Si le mot de passe est modifié, le hasher
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        avatar: true,
        bio: true,
        updatedAt: true,
      },
    });
  }

  async updateStatus(id: string, status: UserStatus) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Utilisateur supprimé avec succès' };
  }

  async getCoaches() {
    return this.prisma.user.findMany({
      where: {
        role: 'COACH',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
      },
    });
  }

  async getUserStats(userId: string) {
    const user = await this.findOne(userId);

    if (user.role === 'APPRENANT') {
      const [cohortsCount, activeCoaching, subscriptions] = await Promise.all([
        this.prisma.cohortMember.count({
          where: { userId },
        }),
        this.prisma.coachingSession.findFirst({
          where: {
            userId,
            status: 'ACTIVE',
          },
        }),
        this.prisma.subscription.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ]);

      return {
        cohortsCount,
        hasActiveCoaching: !!activeCoaching,
        activeCoaching,
        subscriptions,
      };
    }

    if (user.role === 'COACH') {
      const [activeSessionsCount, totalStudents] = await Promise.all([
        this.prisma.coachingSession.count({
          where: {
            coachId: userId,
            status: 'ACTIVE',
          },
        }),
        this.prisma.coachingSession.count({
          where: { coachId: userId },
        }),
      ]);

      return {
        activeSessionsCount,
        totalStudents,
      };
    }

    return {};
  }
}
