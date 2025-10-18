import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/prisma/prisma.service';
import { RedisService } from '@/common/redis/redis.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto';
import { User, UserStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Vérifier si l'email existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        role: registerDto.role || 'APPRENANT',
        status: 'PENDING', // En attente de vérification email
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // TODO: Envoyer email de vérification

    // Créer log d'audit
    await this.createAuditLog(user.id, 'REGISTER', 'User', user.id);

    return {
      message: 'Inscription réussie. Veuillez vérifier votre email.',
      user,
    };
  }

  async login(loginDto: LoginDto) {
    // Valider l'utilisateur
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier si le compte est verrouillé
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Compte temporairement verrouillé. Réessayez dans ${minutesLeft} minute(s)`,
      );
    }

    // Réinitialiser les tentatives de connexion
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Générer les tokens
    const tokens = await this.generateTokens(user);

    // Sauvegarder le refresh token
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    // Créer log d'audit
    await this.createAuditLog(user.id, 'LOGIN', 'User', user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
      },
      ...tokens,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Incrémenter tentative (même si user n'existe pas, pour éviter le brute force)
      return null;
    }

    // Vérifier si le compte est actif
    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Compte suspendu');
    }

    if (user.status === 'INACTIVE') {
      throw new UnauthorizedException('Compte inactif');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Incrémenter les tentatives de connexion
      await this.incrementLoginAttempts(user.id);
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  async incrementLoginAttempts(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { loginAttempts: true },
    });

    const newAttempts = (user?.loginAttempts || 0) + 1;
    const maxAttempts = this.configService.get<number>(
      'security.maxLoginAttempts',
      5,
    );

    const updateData: any = {
      loginAttempts: newAttempts,
    };

    // Verrouiller le compte si trop de tentatives
    if (newAttempts >= maxAttempts) {
      const lockoutMinutes = this.configService.get<number>(
        'security.lockoutDurationMinutes',
        15,
      );
      updateData.lockedUntil = new Date(Date.now() + lockoutMinutes * 60000);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async saveRefreshToken(userId: string, refreshToken: string) {
    const expiresIn = this.configService.get<string>('jwt.refreshExpiresIn');
    const expiresInDays = parseInt(expiresIn.replace('d', ''));
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });
  }

  async refreshTokens(refreshToken: string) {
    try {
      // Vérifier le token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      // Vérifier si le token existe en base
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Token invalide');
      }

      if (storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Token expiré');
      }

      // Générer de nouveaux tokens
      const tokens = await this.generateTokens(storedToken.user);

      // Supprimer l'ancien refresh token
      await this.prisma.refreshToken.delete({
        where: { token: refreshToken },
      });

      // Sauvegarder le nouveau refresh token
      await this.saveRefreshToken(storedToken.user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }

  async logout(userId: string, refreshToken: string) {
    // Supprimer le refresh token
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: refreshToken,
      },
    });

    // Créer log d'audit
    await this.createAuditLog(userId, 'LOGOUT', 'User', userId);

    return { message: 'Déconnexion réussie' };
  }

  async createAuditLog(
    userId: string,
    action: string,
    entity: string,
    entityId: string,
    changes?: any,
  ) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        changes,
      },
    });
  }
}
