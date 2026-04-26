import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Role } from '@prisma/client'

export interface AuthUser {
  id: string
  email: string
  role: Role
  fullName: string
}

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthUser => {
  const request = ctx.switchToHttp().getRequest()
  return request.user as AuthUser
})
