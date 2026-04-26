import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { StorageService } from './storage.service'
import { PresignUploadDto } from './dto/storage.dto'
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator'
import { Roles } from '../common/decorators/roles.decorator'

@ApiTags('storage')
@ApiBearerAuth()
@Controller('storage')
export class StorageController {
  constructor(private readonly service: StorageService) {}

  @Post('presign-upload')
  @Roles(Role.OWNER, Role.PM_LEAD, Role.PM, Role.PERFORMER)
  @ApiOperation({
    summary: 'Request a presigned S3 upload URL',
    description:
      'Returns a time-limited presigned PUT URL and the storage record id. The client uploads the file directly to S3 — the API process never touches the file bytes. Attach the returned `id` to the client or project record after upload.',
  })
  @ApiBody({
    type: PresignUploadDto,
    examples: {
      pdf: {
        summary: 'Upload a brand guidelines PDF',
        value: {
          filename: 'brand-book-v3.pdf',
          contentType: 'application/pdf',
          sizeBytes: 2048000,
          projectId: 'b2c3d4e5-f6a7-8901-bcde-f01234567891',
          visibility: 'INTERNAL',
        },
      },
      image: {
        summary: 'Upload a logo PNG',
        value: {
          filename: 'logo-primary.png',
          contentType: 'image/png',
          sizeBytes: 512000,
          clientId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          visibility: 'CLIENT_VISIBLE',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Returns `{ id, uploadUrl, expiresAt }`.' })
  @ApiResponse({ status: 400, description: 'Unsupported MIME type or file too large.' })
  presign(@CurrentUser() user: AuthUser, @Body() dto: PresignUploadDto) {
    return this.service.presignUpload(user, dto)
  }

  @Get(':id/download')
  @Roles(Role.OWNER, Role.PM_LEAD, Role.PM, Role.PERFORMER, Role.CLIENT)
  @ApiOperation({
    summary: 'Get a presigned download URL',
    description:
      'Returns a short-lived presigned GET URL for the stored file. CLIENT-role users are blocked from INTERNAL files. The URL expires in 15 minutes.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Storage record UUID.' })
  @ApiResponse({ status: 200, description: 'Returns `{ downloadUrl, expiresAt }`.' })
  @ApiResponse({ status: 403, description: 'File is not visible to the caller.' })
  @ApiResponse({ status: 404, description: 'Storage record not found.' })
  download(@CurrentUser() user: AuthUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.download(user, id)
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.PM_LEAD, Role.PM, Role.PERFORMER)
  @ApiOperation({
    summary: 'Delete a stored file',
    description:
      'Removes the S3 object and the storage record. OWNER can delete any file; other roles can only delete files they uploaded.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Storage record UUID.' })
  @ApiResponse({ status: 200, description: 'Deleted storage record.' })
  @ApiResponse({ status: 403, description: 'Not the file owner.' })
  @ApiResponse({ status: 404, description: 'Storage record not found.' })
  remove(@CurrentUser() user: AuthUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.remove(user, id)
  }
}
