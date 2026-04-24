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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
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
  list(@CurrentUser() user: AuthUser, @Query() query: ListClientsQueryDto) {
    return this.service.list(user, query)
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.PM_LEAD, Role.PM, Role.PERFORMER)
  findOne(@CurrentUser() user: AuthUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne(user, id)
  }

  @Post()
  @Roles(Role.OWNER, Role.PM_LEAD)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateClientDto) {
    return this.service.create(user, dto)
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.PM_LEAD)
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
  archive(@CurrentUser() user: AuthUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.archive(user, id)
  }
}
