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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
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
  @ApiOperation({
    summary: 'List projects',
    description:
      'Returns a paginated list of projects scoped by role. OWNER/PM_LEAD see all; PM sees owned projects; PERFORMER sees projects they are a member of.',
  })
  @ApiResponse({ status: 200, description: 'Array of project objects.' })
  @ApiResponse({ status: 401, description: 'Missing or expired access token.' })
  list(@CurrentUser() user: AuthUser, @Query() query: ListProjectsQueryDto) {
    return this.service.list(user, query)
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.PM_LEAD, Role.PM, Role.PERFORMER)
  @ApiOperation({
    summary: 'Get a project',
    description: 'Returns full details of a single project. 403 is returned if the caller has no visibility.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Project UUID.' })
  @ApiResponse({ status: 200, description: 'Project object.' })
  @ApiResponse({ status: 403, description: 'Project is not visible to the caller.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  findOne(@CurrentUser() user: AuthUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne(user, id)
  }

  @Get(':id/roadmap')
  @Roles(Role.OWNER, Role.PM_LEAD, Role.PM, Role.PERFORMER)
  @ApiOperation({
    summary: 'Get project roadmap',
    description:
      'Returns the project with its full ordered task list — stage numbers, KPIs, deadlines, and assignee roles.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Project UUID.' })
  @ApiResponse({ status: 200, description: 'Project object including ordered tasks array.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  roadmap(@CurrentUser() user: AuthUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.roadmap(user, id)
  }

  @Post()
  @Roles(Role.OWNER, Role.PM_LEAD, Role.PM)
  @ApiOperation({
    summary: 'Create a project',
    description:
      'Creates a new project linked to a client and writes an audit log entry. Service category drives roadmap generation.',
  })
  @ApiBody({
    type: CreateProjectDto,
    examples: {
      branding: {
        summary: 'Brand Book project',
        value: {
          clientId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          serviceCategory: 'BRANDING',
          serviceName: 'Brand Book & Corporate Identity',
          stageTotal: 5,
          dueAt: '2026-09-30T00:00:00.000Z',
          budgetCents: 850000,
          currency: 'EUR',
        },
      },
      seo: {
        summary: 'SEO Audit project',
        value: {
          clientId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          serviceCategory: 'DIGITAL',
          serviceName: 'SEO Audit & Strategy',
          stageTotal: 3,
          currency: 'USD',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Newly created project object.' })
  @ApiResponse({ status: 400, description: 'Validation error — check request body.' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateProjectDto) {
    return this.service.create(user, dto)
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.PM_LEAD, Role.PM)
  @ApiOperation({
    summary: 'Update a project',
    description:
      'Partial update. PM can only update projects they own. Advancing `stageCurrent` or changing `status` writes an audit entry.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Project UUID.' })
  @ApiBody({
    type: UpdateProjectDto,
    examples: {
      advance: {
        summary: 'Advance to next stage',
        value: { stageCurrent: 2 },
      },
      deliver: {
        summary: 'Mark project as delivered',
        value: { status: 'DELIVERED', stageCurrent: 5 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Updated project object.' })
  @ApiResponse({ status: 403, description: 'PM can only update their own projects.' })
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
  @ApiOperation({
    summary: 'Delete a project',
    description: 'Hard-deletes a project and its tasks. Restricted to OWNER. Cannot be undone.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Project UUID.' })
  @ApiResponse({ status: 200, description: 'Deleted project object.' })
  @ApiResponse({ status: 403, description: 'Only OWNER can delete projects.' })
  remove(@CurrentUser() user: AuthUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.remove(user, id)
  }

  @Post(':id/tasks')
  @Roles(Role.OWNER, Role.PM_LEAD, Role.PM)
  @ApiOperation({
    summary: 'Add a task to a project',
    description: 'Appends a task to the project roadmap. Tasks define assignee role, deadline, and a measurable KPI.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Project UUID.' })
  @ApiBody({
    type: CreateTaskDto,
    examples: {
      designTask: {
        summary: 'Logo design task',
        value: {
          title: 'Develop primary logo concepts',
          assigneeRole: 'PERFORMER',
          dueAt: '2026-07-15T00:00:00.000Z',
          kpi: '3 logo options delivered for client review',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Newly created task object.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  addTask(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.service.addTask(user, id, dto)
  }

  @Patch(':id/tasks/:taskId')
  @Roles(Role.OWNER, Role.PM_LEAD, Role.PM)
  @ApiOperation({
    summary: 'Update a task',
    description: 'Partial update of a task — advance status, change KPI, or reassign role.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Project UUID.' })
  @ApiParam({ name: 'taskId', type: 'string', format: 'uuid', description: 'Task UUID.' })
  @ApiBody({
    type: UpdateTaskDto,
    examples: {
      complete: {
        summary: 'Mark task as complete',
        value: { status: 'COMPLETE' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Updated task object.' })
  @ApiResponse({ status: 404, description: 'Task or project not found.' })
  updateTask(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.service.updateTask(user, id, taskId, dto)
  }
}
