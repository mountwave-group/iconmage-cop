import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { ClientsService } from './clients.service'
import { CreateClientDto, ListClientsQueryDto, UpdateClientDto } from './dto/client.dto'
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator'
import { Roles } from '../common/decorators/roles.decorator'

@ApiTags('clients')
@ApiBearerAuth()
@Controller('clients')
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  @Get()
  @Roles(Role.OWNER, Role.PM_LEAD, Role.PM, Role.PERFORMER)
  @ApiOperation({
    summary: 'List clients',
    description:
      'Returns a paginated list of clients. OWNER and PM_LEAD see all; PM sees only their assigned clients; PERFORMER sees clients reachable through project membership.',
  })
  @ApiResponse({ status: 200, description: 'Array of client objects.' })
  @ApiResponse({ status: 401, description: 'Missing or expired access token.' })
  @ApiResponse({ status: 403, description: 'Insufficient role.' })
  list(@CurrentUser() user: AuthUser, @Query() query: ListClientsQueryDto) {
    return this.service.list(user, query)
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.PM_LEAD, Role.PM, Role.PERFORMER)
  @ApiOperation({
    summary: 'Get a client',
    description:
      'Returns full details of a single client. Access is scoped by role — see list endpoint for visibility rules.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Client UUID.' })
  @ApiResponse({ status: 200, description: 'Client object.' })
  @ApiResponse({ status: 403, description: 'Client is not visible to the caller.' })
  @ApiResponse({ status: 404, description: 'Client not found.' })
  findOne(@CurrentUser() user: AuthUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne(user, id)
  }

  @Post()
  @Roles(Role.OWNER, Role.PM_LEAD)
  @ApiOperation({
    summary: 'Create a client',
    description:
      'Creates a new client record and writes an audit log entry. Restricted to OWNER and PM_LEAD.',
  })
  @ApiBody({
    type: CreateClientDto,
    examples: {
      vip: {
        summary: 'New VIP client',
        value: {
          name: 'Maison de Lumière',
          country: 'France',
          tier: 'VIP',
          primaryContact: 'Isabelle Fontaine',
          contactTitle: 'Chief Marketing Officer',
          currency: 'EUR',
          notes: 'Referred by Monaco chamber.',
        },
      },
      corporate: {
        summary: 'New Corporate client',
        value: {
          name: 'NovaTech Solutions',
          country: 'United Kingdom',
          tier: 'CORPORATE',
          primaryContact: 'James Harrington',
          currency: 'GBP',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Newly created client object.' })
  @ApiResponse({ status: 400, description: 'Validation error — check request body.' })
  @ApiResponse({ status: 403, description: 'Insufficient role.' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateClientDto) {
    return this.service.create(user, dto)
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.PM_LEAD)
  @ApiOperation({
    summary: 'Update a client',
    description:
      'Partial update of any client field. All fields are optional; only supplied fields are modified.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Client UUID.' })
  @ApiBody({
    type: UpdateClientDto,
    examples: {
      promoteToActive: {
        summary: 'Promote lead to active',
        value: { status: 'ACTIVE' },
      },
      updateContact: {
        summary: 'Update primary contact',
        value: { primaryContact: 'Sophie Laurent', contactTitle: 'Director of Communications' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Updated client object.' })
  @ApiResponse({ status: 404, description: 'Client not found.' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateClientDto,
  ) {
    return this.service.update(user, id, dto)
  }

  @Delete(':id')
  @Roles(Role.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Archive a client',
    description:
      'Soft-deletes the client by setting status to ARCHIVED. No data is destroyed. Restricted to OWNER.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Client UUID.' })
  @ApiResponse({ status: 200, description: 'Archived client object.' })
  @ApiResponse({ status: 403, description: 'Only OWNER can archive clients.' })
  @ApiResponse({ status: 404, description: 'Client not found.' })
  archive(@CurrentUser() user: AuthUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.archive(user, id)
  }
}
