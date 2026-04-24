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
import { ProjectsService } from './projects.service'
import {
  CreateProjectDto,
  CreateTaskDto,
  ListProjectsQueryDto,
  UpdateProjectDto,
  UpdateTaskDto,
} from './dto/project.dto'
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator'
import { Roles } from '../common/decorators/roles.decorator'

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  @Get()
  @Roles(Role.OWNER, Role.PM_LEAD, Role.PM, Role.PERFORMER)
  list(@CurrentUser() user: AuthUser, @Query() query: ListProjectsQueryDto) {
    return this.service.list(user, query)
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.PM_LEAD, Role.PM, Role.PERFORMER)
  findOne(@CurrentUser() user: AuthUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne(user, id)
  }

  @Get(':id/roadmap')
  @Roles(Role.OWNER, Role.PM_LEAD, Role.PM, Role.PERFORMER)
  roadmap(@CurrentUser() user: AuthUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.roadmap(user, id)
  }

  @Post()
  @Roles(Role.OWNER, Role.PM_LEAD, Role.PM)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateProjectDto) {
    return this.service.create(user, dto)
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.PM_LEAD, Role.PM)
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.service.update(user, id, dto)
  }

  @Delete(':id')
  @Roles(Role.OWNER)
  @HttpCode(HttpStatus.OK)
  remove(@CurrentUser() user: AuthUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.remove(user, id)
  }

  @Post(':id/tasks')
  @Roles(Role.OWNER, Role.PM_LEAD, Role.PM)
  addTask(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.service.addTask(user, id, dto)
  }

  @Patch(':id/tasks/:taskId')
  @Roles(Role.OWNER, Role.PM_LEAD, Role.PM)
  updateTask(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.service.updateTask(user, id, taskId, dto)
  }
}
