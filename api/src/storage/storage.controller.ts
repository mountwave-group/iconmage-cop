import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
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
  presign(@CurrentUser() user: AuthUser, @Body() dto: PresignUploadDto) {
    return this.service.presignUpload(user, dto)
  }

  @Get(':id/download')
  @Roles(Role.OWNER, Role.PM_LEAD, Role.PM, Role.PERFORMER, Role.CLIENT)
  download(@CurrentUser() user: AuthUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.download(user, id)
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.PM_LEAD, Role.PM, Role.PERFORMER)
  remove(@CurrentUser() user: AuthUser, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.remove(user, id)
  }
}
