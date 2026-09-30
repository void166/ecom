import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService, private readonly config: ConfigService) {}

  async register(dto: RegisterDto) {
    const tenant = await this.prisma.tenant.findFirst({ orderBy: { createdAt: 'asc' } });
    if (!tenant) throw new ConflictException('Store is not initialized');
    const email = dto.email.trim().toLowerCase();
    if (await this.prisma.user.findUnique({ where: { tenantId_email: { tenantId: tenant.id, email } } })) throw new ConflictException('An account with this email already exists');
    const customerRole = await this.prisma.role.findUnique({ where: { name: 'customer' } });
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({ data: { tenantId: tenant.id, email, passwordHash, firstName: dto.firstName, lastName: dto.lastName, ...(customerRole ? { roles: { create: { roleId: customerRole.id } } } : {}) } });
      await tx.customer.upsert({
        where: { tenantId_email: { tenantId: tenant.id, email } },
        create: { tenantId: tenant.id, userId: created.id, email, firstName: dto.firstName, lastName: dto.lastName, tags: [] },
        update: { userId: created.id, firstName: dto.firstName, lastName: dto.lastName },
      });
      return created;
    });
    return this.issueTokens(user.id);
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({ where: { email }, include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } }, customer: true } });
    if (!user || user.status !== 'ACTIVE' || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException('Invalid email or password');
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    return this.issueTokens(user.id);
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string };
    try { payload = await this.jwt.verifyAsync(refreshToken, { secret: this.requiredSecret('JWT_REFRESH_SECRET') }); }
    catch { throw new UnauthorizedException('Invalid or expired refresh token'); }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user?.refreshTokenHash || user.refreshTokenHash !== this.hashToken(refreshToken)) throw new UnauthorizedException('Refresh token has been revoked');
    return this.issueTokens(user.id);
  }

  async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: null } });
    return { success: true };
  }

  private async issueTokens(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, include: { customer: true, roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } } });
    const permissions = [...new Set(user.roles.flatMap(({ role }) => role.permissions.map(({ permission }) => permission.key)))];
    const payload = { sub: user.id, tenantId: user.tenantId, email: user.email, permissions, ...(user.customer ? { customerId: user.customer.id } : {}) };
    const accessToken = await this.jwt.signAsync(payload, { secret: this.requiredSecret('JWT_ACCESS_SECRET'), expiresIn: (this.config.get('JWT_ACCESS_TTL') ?? '15m') as never });
    const refreshToken = await this.jwt.signAsync({ sub: user.id }, { secret: this.requiredSecret('JWT_REFRESH_SECRET'), expiresIn: (this.config.get('JWT_REFRESH_TTL') ?? '7d') as never });
    await this.prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash: this.hashToken(refreshToken) } });
    return { accessToken, refreshToken, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, permissions } };
  }

  private hashToken(token: string) { return createHash('sha256').update(token).digest('hex'); }
  private requiredSecret(key: string) { const secret = this.config.get<string>(key); if (!secret || secret.length < 32) throw new Error(`${key} must contain at least 32 characters`); return secret; }
}
