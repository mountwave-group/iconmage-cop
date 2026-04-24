import { ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import {
  ProjectStatus,
  ServiceCategory,
  Role,
  TaskStatus,
} from '@prisma/client'
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
  @IsUUID()
  clientId!: string

  @IsEnum(ServiceCategory)
  serviceCategory!: ServiceCategory

  @IsString()
  @Length(2, 200)
  serviceName!: string

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  stageCurrent?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  stageTotal?: number

  @IsOptional()
  @IsISO8601()
  dueAt?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  budgetCents?: number

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string

  @IsOptional()
  @IsUUID()
  pmId?: string
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class ListProjectsQueryDto {
  @ApiPropertyOptional({ enum: ProjectStatus })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  clientId?: string

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number = 25

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number = 0
}

export class CreateTaskDto {
  @IsString()
  @Length(2, 200)
  title!: string

  @IsEnum(Role)
  assigneeRole!: Role

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus

  @IsOptional()
  @IsISO8601()
  dueAt?: string

  @IsOptional()
  @IsString()
  @Length(0, 120)
  kpi?: string
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
