import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
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
  @ApiProperty({
    description: 'Original filename including extension. Used as the S3 object key suffix.',
    example: 'brand-book-v3.pdf',
  })
  @IsString()
  @Length(1, 255)
  filename!: string

  @ApiProperty({
    description: 'MIME type of the file. Must be one of: PDF, DOCX, ZIP, PNG, JPEG, MP4.',
    example: 'application/pdf',
  })
  @IsMimeType()
  contentType!: string

  @ApiProperty({
    description: 'File size in bytes. Maximum 1 GB.',
    minimum: 1,
    maximum: 1_073_741_824,
    example: 2048000,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1_073_741_824)
  sizeBytes!: number

  @ApiPropertyOptional({
    description: 'UUID of the client this file is associated with.',
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsUUID()
  clientId?: string

  @ApiPropertyOptional({
    description: 'UUID of the project this file is associated with.',
    format: 'uuid',
    example: 'b2c3d4e5-f6a7-8901-bcde-f01234567891',
  })
  @IsOptional()
  @IsUUID()
  projectId?: string

  @ApiPropertyOptional({
    description: 'Visibility scope. INTERNAL hides the file from CLIENT-role users.',
    enum: FileVisibility,
    example: 'INTERNAL',
  })
  @IsOptional()
  @IsEnum(FileVisibility)
  visibility?: FileVisibility
}
