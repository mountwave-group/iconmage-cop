import { ApiPropertyOptional } from '@nestjs/swagger'
import { Tier, ClientStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator'
import { PartialType } from '@nestjs/swagger'

export class CreateClientDto {
  @IsString()
  @Length(2, 200)
  name!: string

  @IsString()
  @Length(2, 100)
  country!: string

  @IsEnum(Tier)
  tier!: Tier

  @IsOptional()
  @IsEnum(ClientStatus)
  status?: ClientStatus

  @IsString()
  @Length(2, 200)
  primaryContact!: string

  @IsOptional()
  @IsString()
  @Length(0, 200)
  contactTitle?: string

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsString()
  assignedPmId?: string
}

export class UpdateClientDto extends PartialType(CreateClientDto) {}

export class ListClientsQueryDto {
  @ApiPropertyOptional({ enum: ClientStatus })
  @IsOptional()
  @IsEnum(ClientStatus)
  status?: ClientStatus

  @ApiPropertyOptional({ enum: Tier })
  @IsOptional()
  @IsEnum(Tier)
  tier?: Tier

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
