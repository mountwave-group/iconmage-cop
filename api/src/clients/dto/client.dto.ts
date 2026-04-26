import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Tier, ClientStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator'
import { PartialType } from '@nestjs/swagger'

export class CreateClientDto {
  @ApiProperty({
    description: 'Legal or trading name of the client.',
    example: 'Maison de Lumière',
  })
  @IsString()
  @Length(2, 200)
  name!: string

  @ApiProperty({
    description: 'ISO country name where the client is headquartered.',
    example: 'France',
  })
  @IsString()
  @Length(2, 100)
  country!: string

  @ApiProperty({
    description: 'Service tier determining pricing and SLA.',
    enum: Tier,
    example: Tier.VIP,
  })
  @IsEnum(Tier)
  tier!: Tier

  @ApiPropertyOptional({
    description: 'Lifecycle status of the client relationship.',
    enum: ClientStatus,
    example: ClientStatus.LEAD,
  })
  @IsOptional()
  @IsEnum(ClientStatus)
  status?: ClientStatus

  @ApiProperty({
    description: 'Full name of the primary point of contact at the client.',
    example: 'Isabelle Fontaine',
  })
  @IsString()
  @Length(2, 200)
  primaryContact!: string

  @ApiPropertyOptional({
    description: 'Job title of the primary contact.',
    example: 'Chief Marketing Officer',
  })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  contactTitle?: string

  @ApiPropertyOptional({
    description: 'ISO 4217 three-letter currency code for invoicing.',
    example: 'EUR',
    minLength: 3,
    maxLength: 3,
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string

  @ApiPropertyOptional({
    description: 'Internal notes visible to OWNER and PM_LEAD only.',
    example: 'Referred by Monaco chamber. Prefers WhatsApp comms.',
  })
  @IsOptional()
  @IsString()
  notes?: string

  @ApiPropertyOptional({
    description: 'UUID of the Project Manager assigned to this client.',
    format: 'uuid',
    example: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f90',
  })
  @IsOptional()
  @IsString()
  assignedPmId?: string
}

export class UpdateClientDto extends PartialType(CreateClientDto) {}

export class ListClientsQueryDto {
  @ApiPropertyOptional({ enum: ClientStatus, description: 'Filter by lifecycle status.' })
  @IsOptional()
  @IsEnum(ClientStatus)
  status?: ClientStatus

  @ApiPropertyOptional({ enum: Tier, description: 'Filter by service tier.' })
  @IsOptional()
  @IsEnum(Tier)
  tier?: Tier

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
