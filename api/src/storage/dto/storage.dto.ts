import { FileVisibility } from '@prisma/client'
import {
  IsEnum,
  IsInt,
  IsMimeType,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'image/png',
  'image/jpeg',
  'video/mp4',
] as const

export class PresignUploadDto {
  @IsString()
  @Length(1, 255)
  filename!: string

  @IsMimeType()
  contentType!: string

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1_073_741_824)
  sizeBytes!: number

  @IsOptional()
  @IsUUID()
  clientId?: string

  @IsOptional()
  @IsUUID()
  projectId?: string

  @IsOptional()
  @IsEnum(FileVisibility)
  visibility?: FileVisibility
}
