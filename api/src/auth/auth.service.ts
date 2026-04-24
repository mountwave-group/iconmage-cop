import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Role, User } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.module'
import { EnvConfig } from '../config/env.validation'
import { AuthUser } from '../common/decorators/current-user.decorator'

interface AccessPayload {
  sub: string
  email: string
  role: Role
  name: string
}

interface RefreshPayload {
  sub: string
  tokenType: 'refresh'
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<EnvConfig, true>,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user || !user.active) throw new UnauthorizedException('Invalid credentials')
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) throw new UnauthorizedException('Invalid credentials')
    return this.issueTokens(user)
  }

  async refresh(refreshToken: string) {
    let payload: RefreshPayload
    try {
      payload = await this.jwt.verifyAsync<RefreshPayload>(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET', { infer: true }),
      })
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
    if (payload.tokenType !== 'refresh') throw new UnauthorizedException('Invalid refresh token')

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user || !user.active || !user.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token revoked')
    }
    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash)
    if (!matches) throw new UnauthorizedException('Refresh token revoked')

    return this.issueTokens(user)
  }

  async me(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } })
    return { id: user.id, email: user.email, role: user.role, fullName: user.fullName }
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    })
  }

  private async issueTokens(user: User) {
    const accessPayload: AccessPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.fullName,
    }

    const accessToken = await this.jwt.signAsync(accessPayload, {
      secret: this.config.get('JWT_ACCESS_SECRET', { infer: true }),
      expiresIn: this.config.get('JWT_ACCESS_TTL', { infer: true }),
    })

    const refreshPayload: RefreshPayload = { sub: user.id, tokenType: 'refresh' }
    const refreshToken = await this.jwt.signAsync(refreshPayload, {
      secret: this.config.get('JWT_REFRESH_SECRET', { infer: true }),
      expiresIn: this.config.get('JWT_REFRESH_TTL', { infer: true }),
    })

    const rounds = this.config.get('BCRYPT_ROUNDS', { infer: true })
    const refreshTokenHash = await bcrypt.hash(refreshToken, rounds)
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    })

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    }
  }
}
