import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { FileObject, FileVisibility, Role } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import { PrismaService } from '../prisma/prisma.module'
import { AuditService } from '../audit/audit.service'
import { AuthUser } from '../common/decorators/current-user.decorator'
import { EnvConfig } from '../config/env.validation'
import { ALLOWED_MIME_TYPES, PresignUploadDto } from './dto/storage.dto'

@Injectable()
export class StorageService implements OnModuleInit {
  private s3!: S3Client
  private bucket!: string
  private maxBytes!: number
  private ttlSeconds!: number

  constructor(
    private readonly config: ConfigService<EnvConfig, true>,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  onModuleInit(): void {
    const endpoint = this.config.get('S3_ENDPOINT', { infer: true })
    const accessKeyId = this.config.get('AWS_ACCESS_KEY_ID', { infer: true })
    const secretAccessKey = this.config.get('AWS_SECRET_ACCESS_KEY', { infer: true })
    this.s3 = new S3Client({
      region: this.config.get('S3_REGION', { infer: true }),
      endpoint: endpoint || undefined,
      forcePathStyle: this.config.get('S3_FORCE_PATH_STYLE', { infer: true }),
      credentials:
        accessKeyId && secretAccessKey
          ? { accessKeyId, secretAccessKey }
          : undefined,
    })
    this.bucket = this.config.get('S3_BUCKET', { infer: true })
    this.maxBytes = this.config.get('STORAGE_MAX_BYTES', { infer: true })
    this.ttlSeconds = this.config.get('STORAGE_PRESIGN_TTL_SECONDS', { infer: true })
  }

  async presignUpload(actor: AuthUser, dto: PresignUploadDto) {
    if (dto.sizeBytes > this.maxBytes) {
      throw new BadRequestException(`File exceeds max size of ${this.maxBytes} bytes`)
    }
    if (!ALLOWED_MIME_TYPES.includes(dto.contentType as typeof ALLOWED_MIME_TYPES[number])) {
      throw new BadRequestException(`MIME type ${dto.contentType} is not permitted`)
    }

    const key = this.buildKey(actor, dto)
    const visibility = dto.visibility ?? this.defaultVisibility(actor)

    const fileObject = await this.prisma.$transaction(async (tx) => {
      const created = await tx.fileObject.create({
        data: {
          bucket: this.bucket,
          storageKey: key,
          filename: dto.filename,
          contentType: dto.contentType,
          sizeBytes: BigInt(dto.sizeBytes),
          visibility,
          ownerUserId: actor.id,
          clientId: dto.clientId ?? null,
          projectId: dto.projectId ?? null,
        },
      })
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'file.presign',
          entityType: 'FileObject',
          entityId: created.id,
          diff: { key, contentType: dto.contentType, sizeBytes: dto.sizeBytes },
        },
        tx,
      )
      return created
    })

    const uploadUrl = await getSignedUrl(
      this.s3,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: dto.contentType,
        ContentLength: dto.sizeBytes,
      }),
      { expiresIn: this.ttlSeconds },
    )

    return {
      fileObjectId: fileObject.id,
      key,
      bucket: this.bucket,
      uploadUrl,
      expiresIn: this.ttlSeconds,
    }
  }

  async download(actor: AuthUser, fileObjectId: string) {
    const file = await this.prisma.fileObject.findUnique({ where: { id: fileObjectId } })
    if (!file) throw new NotFoundException('File not found')
    this.assertCanRead(actor, file)

    const url = await getSignedUrl(
      this.s3,
      new GetObjectCommand({ Bucket: file.bucket, Key: file.storageKey }),
      { expiresIn: this.ttlSeconds },
    )
    return { url, expiresIn: this.ttlSeconds, filename: file.filename, contentType: file.contentType }
  }

  async remove(actor: AuthUser, fileObjectId: string) {
    const file = await this.prisma.fileObject.findUnique({ where: { id: fileObjectId } })
    if (!file) throw new NotFoundException('File not found')
    if (actor.role !== Role.OWNER && file.ownerUserId !== actor.id) {
      throw new ForbiddenException('Only OWNER or file owner may delete this file')
    }

    await this.s3.send(new DeleteObjectCommand({ Bucket: file.bucket, Key: file.storageKey }))

    await this.prisma.$transaction(async (tx) => {
      await tx.fileObject.delete({ where: { id: fileObjectId } })
      await this.audit.write(
        {
          actorUserId: actor.id,
          action: 'file.delete',
          entityType: 'FileObject',
          entityId: fileObjectId,
          diff: { deleted: { key: file.storageKey, bucket: file.bucket } },
        },
        tx,
      )
    })
    return { id: fileObjectId }
  }

  private buildKey(actor: AuthUser, dto: PresignUploadDto): string {
    const scope = dto.projectId
      ? `projects/${dto.projectId}`
      : dto.clientId
        ? `clients/${dto.clientId}`
        : `users/${actor.id}`
    const safeName = dto.filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    return `${scope}/${new Date().getUTCFullYear()}/${randomUUID()}-${safeName}`
  }

  private defaultVisibility(actor: AuthUser): FileVisibility {
    switch (actor.role) {
      case Role.OWNER:
        return FileVisibility.OWNER
      case Role.PM_LEAD:
      case Role.PM:
        return FileVisibility.PM
      case Role.PERFORMER:
        return FileVisibility.PERFORMER
      case Role.CLIENT:
        return FileVisibility.CLIENT
      default:
        return FileVisibility.OWNER
    }
  }

  private assertCanRead(actor: AuthUser, file: FileObject): void {
    if (actor.role === Role.OWNER) return
    if (file.ownerUserId === actor.id) return

    const rank: Record<FileVisibility, number> = {
      OWNER: 4,
      PM: 3,
      PERFORMER: 2,
      CLIENT: 1,
    }
    const actorRank: Record<Role, number> = {
      OWNER: 4,
      PM_LEAD: 3,
      PM: 3,
      PERFORMER: 2,
      CLIENT: 1,
    }
    if (actorRank[actor.role] < rank[file.visibility]) {
      throw new ForbiddenException('Insufficient privilege to view this file')
    }
  }
}
