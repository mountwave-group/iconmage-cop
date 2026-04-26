import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { AuthService } from './auth.service'
import { LoginDto, RefreshDto } from './dto/auth.dto'
import { Public } from '../common/decorators/public.decorator'
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate',
    description:
      'Exchange email and password for a short-lived access token (15 min) and a rotating refresh token (7 days). Rate-limited to 10 requests per minute.',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      owner: {
        summary: 'Owner login',
        value: { email: 'varvara@iconimage.group', password: 'Owner!Passw0rd' },
      },
      pm: {
        summary: 'Project Manager login',
        value: { email: 'nakamura@iconimage.group', password: 'Pm!Passw0rd' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Returns `{ accessToken, refreshToken, user }`.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password)
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Issue a new access token and rotate the refresh token. The previous refresh token is immediately invalidated.',
  })
  @ApiBody({
    type: RefreshDto,
    examples: {
      example: {
        summary: 'Refresh with token from login response',
        value: { refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI...' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Returns a new `{ accessToken, refreshToken }` pair.' })
  @ApiResponse({ status: 401, description: 'Refresh token is invalid or expired.' })
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken)
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({
    summary: 'Current user profile',
    description:
      "Returns the authenticated user's id, email, role, and display name. Requires a valid Bearer access token.",
  })
  @ApiResponse({ status: 200, description: 'Returns the authenticated user object.' })
  @ApiResponse({ status: 401, description: 'Missing or expired access token.' })
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.id)
  }

  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Sign out',
    description:
      'Clears the refresh token hash on the server. Subsequent refresh attempts with the old token will fail.',
  })
  @ApiResponse({ status: 204, description: 'Successfully signed out — no body returned.' })
  @ApiResponse({ status: 401, description: 'Missing or expired access token.' })
  async logout(@CurrentUser() user: AuthUser) {
    await this.auth.logout(user.id)
  }
}
