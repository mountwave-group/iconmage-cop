import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Role } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.module'
import { AuthUser } from '../common/decorators/current-user.decorator'
import { EnvConfig } from '../config/env.validation'

interface JwtAccessPayload {
  sub: string
  email: string
  role: Role
  name: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService<EnvConfig, true>,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_ACCESS_SECRET', { infer: true }),
    })
  }

  async validate(payload: JwtAccessPayload): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user || !user.active) throw new UnauthorizedException('User no longer active')
    return { id: user.id, email: user.email, role: user.role, fullName: user.fullName }
  }
}
