import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { ProjectStatus, ServiceCategory, Role, TaskStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator'

export class CreateProjectDto {
  @ApiProperty({
    description: 'UUID of the client this project belongs to.',
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID()
  clientId!: string

  @ApiProperty({
    description: 'Broad service category for roadmap generation.',
    enum: ServiceCategory,
    example: ServiceCategory.BRANDING,
  })
  @IsEnum(ServiceCategory)
  serviceCategory!: ServiceCategory

  @ApiProperty({
    description: 'Specific service name shown to the team (e.g. "Brand Book", "SEO Audit").',
    example: 'Brand Book & Corporate Identity',
  })
  @IsString()
  @Length(2, 200)
  serviceName!: string

  @ApiPropertyOptional({
    description: 'Current stage in the project lifecycle.',
    enum: ProjectStatus,
    example: ProjectStatus.IN_MOTION,
  })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus

  @ApiPropertyOptional({
    description: 'Current stage number (1-based).',
    minimum: 1,
    maximum: 50,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  stageCurrent?: number

  @ApiPropertyOptional({
    description: 'Total number of stages in the roadmap.',
    minimum: 1,
    maximum: 50,
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  stageTotal?: number

  @ApiPropertyOptional({
    description: 'Project deadline in ISO 8601 format.',
    example: '2026-09-30T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  dueAt?: string

  @ApiPropertyOptional({
    description: 'Approved budget in minor currency units (e.g. cents).',
    minimum: 0,
    example: 850000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  budgetCents?: number

  @ApiPropertyOptional({
    description: 'ISO 4217 three-letter currency code for the project budget.',
    example: 'EUR',
    minLength: 3,
    maxLength: 3,
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string

  @ApiPropertyOptional({
    description: 'UUID of the Project Manager responsible for this project.',
    format: 'uuid',
    example: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
  })
  @IsOptional()
  @IsUUID()
  pmId?: string
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class ListProjectsQueryDto {
  @ApiPropertyOptional({ enum: ProjectStatus, description: 'Filter by project lifecycle status.' })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Filter projects belonging to a specific client.',
  })
  @IsOptional()
  @IsUUID()
  clientId?: string

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 25,
    description: 'Number of records to return.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number = 25

  @ApiPropertyOptional({
    minimum: 0,
    default: 0,
    description: 'Number of records to skip (for pagination).',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number = 0
}

export class CreateTaskDto {
  @ApiProperty({
    description: 'Short descriptive title of the task.',
    example: 'Develop primary logo concepts',
  })
  @IsString()
  @Length(2, 200)
  title!: string

  @ApiProperty({
    description: 'Role responsible for executing this task.',
    enum: Role,
    example: Role.PERFORMER,
  })
  @IsEnum(Role)
  assigneeRole!: Role

  @ApiPropertyOptional({
    description: 'Initial task status.',
    enum: TaskStatus,
    example: TaskStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus

  @ApiPropertyOptional({
    description: 'Task deadline in ISO 8601 format.',
    example: '2026-07-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  dueAt?: string

  @ApiPropertyOptional({
    description: 'KPI or success metric tied to this task.',
    example: '3 logo options delivered for client review',
  })
  @IsOptional()
  @IsString()
  @Length(0, 120)
  kpi?: string
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
