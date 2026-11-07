import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateEventMediaDto } from './dto/create-event_media.dto';
import { UpdateEventMediaDto } from './dto/update-event_media.dto';
import { QueryEventMediaDto } from './dto/query-event_media.dto';
import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { EventRepository } from '../event/event.repository';
import { EventMediaEntity } from './entities/event_media.entity';
import { EventMediaRepository } from './event_media.repository';
import { EVENT_MEDIA_STATUS, EVENT_MEDIA_TYPE, EVENT_STATUS, PAGINATION_LIMIT, PAGINATION_PAGE } from 'src/core/util/constant';
import { EventMediaStorageService } from './event_media_storage.service';
import { PresignedUrlRequestDto } from './dto/presigned-url-request.dto';
import { PresignedUrlResponseDto } from './dto/presigned-url-response.dto';

@Injectable()
export class EventMediaService {

  private readonly logger = new Logger(EventMediaService.name);

  constructor(
    private readonly dbapp: DbappService,
    private readonly eventRepository: EventRepository,
    private readonly eventMediaRepository: EventMediaRepository,
    private readonly eventMediaStorageService: EventMediaStorageService,
  ) { }

  async create(createEventMediaDto: CreateEventMediaDto): Promise<EventMediaEntity> {
    const {
      guest_name,
      status,
      mime_type,
      storage_key,
      thumbnail_key,
      file_size_bytes,
      metadata,
      event_id,
    } = createEventMediaDto;

    const event = await this.eventRepository.findOneByGuid(event_id);
    const eventInternalId = await this.eventRepository.findInternalIdByGuid(event_id);

    if (event.status !== EVENT_STATUS.ACTIVE) {
      throw new BadRequestException('Event is not active, please contact the administrator');
    }

    const totalMediaCount = event.current_media_count + 1;
    const totalStorageBytes = BigInt(event.current_storage_bytes ?? 0) + BigInt(file_size_bytes);

    if (event.max_media_allowed && event.current_media_count >= event.max_media_allowed) {
      throw new BadRequestException('Event has reached the maximum number of media allowed');
    }

    if (event.max_storage_bytes && totalStorageBytes > BigInt(event.max_storage_bytes)) {
      throw new BadRequestException('Storage quota exceeded for this event');
    }

    const metadataValue = metadata ? JSON.stringify(metadata) : null;

    return this.dbapp.$transaction(async (tx) => {
      const createdEventMedia = await tx.$queryRaw<any[]>`
        INSERT INTO event_media (
          guest_name,
          status,
          mime_type,
          storage_key,
          thumbnail_key,
          file_size_bytes,
          metadata,
          event_id
        )
        VALUES (
          ${guest_name ?? 'Anonymous Guest'},
          ${status},
          ${mime_type},
          ${storage_key},
          ${thumbnail_key ?? null},
          ${file_size_bytes},
          ${metadataValue}::jsonb,
          ${eventInternalId}
        )
        RETURNING
          guid as id
      `;

      if (!createdEventMedia || createdEventMedia.length === 0) {
        throw new BadRequestException('Failed to create event media');
      }

      await tx.$queryRaw`
        UPDATE events SET
          current_media_count = ${totalMediaCount},
          current_storage_bytes = ${totalStorageBytes}::bigint,
          updated_at = NOW()
        WHERE id = ${eventInternalId}
      `;

      return EventMediaEntity.fromDBApplication(createdEventMedia[0]);
    });
  }

  async findAll(queryEventMediaDto: QueryEventMediaDto): Promise<{
    total: number;
    eventMedia: EventMediaEntity[];
    page: number;
    limit: number;
  }> {
    const { event_id, status, page, limit, type } = queryEventMediaDto;

    const pageNum = Number(page || PAGINATION_PAGE);
    const limitNum = Number(limit || PAGINATION_LIMIT);
    const skip = (pageNum - PAGINATION_PAGE) * limitNum;
    const take = limitNum;

    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (event_id) {
      whereConditions.push(`e.guid = $${paramIndex}`);
      queryParams.push(event_id);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`em.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (type) {
      const mimeTypeMap: Record<string, string> = {
        [EVENT_MEDIA_TYPE.IMAGE]: 'image/%',
        [EVENT_MEDIA_TYPE.VIDEO]: 'video/%',
        [EVENT_MEDIA_TYPE.AUDIO]: 'audio/%',
        [EVENT_MEDIA_TYPE.FILE]: 'application/%'
      };
      const mimeTypePattern = mimeTypeMap[type];
      if (mimeTypePattern) {
        whereConditions.push(`em.mime_type LIKE $${paramIndex}`);
        queryParams.push(mimeTypePattern);
        paramIndex++;
      }
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const query = `
      SELECT
        em.guid as id,
        em.guest_name,
        em.status,
        em.mime_type,
        em.storage_key,
        em.thumbnail_key,
        em.file_size_bytes,
        em.metadata,
        e.guid as event_id,
        em.created_at,
        em.updated_at
      FROM event_media em
      INNER JOIN events e ON e.id = em.event_id
      ${whereClause}
      ORDER BY em.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(take, skip);

    const countQuery = `
      SELECT COUNT(*)::int as total
      FROM event_media em
      INNER JOIN events e ON e.id = em.event_id
      ${whereClause}
    `;

    const countParams = queryParams.slice(0, -2);

    const [totalResult, eventMedia] = await Promise.all([
      this.dbapp.$queryRawUnsafe<any[]>(countQuery, ...countParams),
      this.dbapp.$queryRawUnsafe<any[]>(query, ...queryParams),
    ]);

    const total = totalResult[0]?.total || 0;

    const formattedEventMedia = eventMedia.map((item) => {
      const eventMediaEntity = EventMediaEntity.fromDBApplication(item);
      eventMediaEntity.url = this.eventMediaStorageService.getMediaUrl(eventMediaEntity.storage_key);
      return eventMediaEntity;
    });

    return {
      total,
      eventMedia: formattedEventMedia,
      page: pageNum,
      limit: limitNum,
    };
  }

  async findAllByEventId(queryEventMediaDto: QueryEventMediaDto, event_id: string): Promise<{
    total: number;
    eventMedia: EventMediaEntity[];
    page: number;
    limit: number;
  }> {
    return this.findAll({ ...queryEventMediaDto, event_id });
  }

  async findOne(id: string): Promise<EventMediaEntity> {
    const eventMedia = await this.eventMediaRepository.findOneByGuid(id);
    const eventMediaEntity = EventMediaEntity.fromDBApplication(eventMedia);
    eventMediaEntity.url = this.eventMediaStorageService.getMediaUrl(eventMediaEntity.storage_key);
    return eventMediaEntity;
  }

  async update(id: string, updateEventMediaDto: UpdateEventMediaDto): Promise<EventMediaEntity> {
    const {
      guest_name,
      status,
      mime_type,
      storage_key,
      thumbnail_key,
      metadata,
    } = updateEventMediaDto;

    await this.eventMediaRepository.findOneByGuid(id);

    await this.dbapp.eventMedia.update({
      where: { guid: id },
      data: {
        ...(guest_name !== undefined && { guest_name }),
        ...(status !== undefined && { status }),
        ...(mime_type !== undefined && { mime_type }),
        ...(storage_key !== undefined && { storage_key }),
        ...(thumbnail_key !== undefined && { thumbnail_key }),
        ...(metadata !== undefined && { metadata }),
      },
    });

    return this.eventMediaRepository.findOneByGuid(id);
  }

  async remove(id: string): Promise<EventMediaEntity> {
    const existing = await this.dbapp.eventMedia.findFirst({
      where: { guid: id },
      select: { id: true, guid: true, event_id: true, file_size_bytes: true, storage_key: true },
    });

    if (!existing) {
      throw new NotFoundException('Event media not found');
    }

    await this.dbapp.$transaction(async (tx) => {
      await tx.eventMedia.delete({
        where: { guid: id },
        select: { id: true },
      });

      await tx.$queryRaw`
        UPDATE events SET
          current_media_count = GREATEST(current_media_count - 1, 0),
          current_storage_bytes = GREATEST(current_storage_bytes - ${existing.file_size_bytes}::bigint, 0),
          updated_at = NOW()
        WHERE id = ${existing.event_id}
      `;

      await this.eventMediaStorageService.deleteMedia(existing.storage_key);
    });

    return EventMediaEntity.fromDBApplication({
      id: existing.guid,
    });
  }


  async getPresignedUrl(presignedUrlRequestDto: PresignedUrlRequestDto): Promise<PresignedUrlResponseDto> {
    const {
      mime_type,
      file_size_bytes,
      event_id,
      guest_name,
    } = presignedUrlRequestDto;

    const event = await this.eventRepository.findOneByGuid(event_id);
    const eventInternalId = await this.eventRepository.findInternalIdByGuid(event_id);

    if (event.status !== EVENT_STATUS.ACTIVE) {
      throw new BadRequestException('Event is not active, please contact the administrator');
    }

    const totalStorageBytes = BigInt(event.current_storage_bytes ?? 0) + BigInt(file_size_bytes);

    if (event.max_media_allowed && event.current_media_count >= event.max_media_allowed) {
      throw new BadRequestException('Event has reached the maximum number of media allowed');
    }

    if (event.max_storage_bytes && totalStorageBytes > BigInt(event.max_storage_bytes)) {
      throw new BadRequestException('Storage quota exceeded for this event');
    }

    try {
      const { upload_url, storage_key } = await this.eventMediaStorageService.generateUploadPresignedUrl(event_id, mime_type, file_size_bytes);
      const metadataValue = {
        upload_url: upload_url,
        storage_key: storage_key,
        mime_type: mime_type,
        file_size_bytes: file_size_bytes
      };

      const createdEventMedia = await this.dbapp.$queryRaw<any[]>`
        INSERT INTO event_media (
          guest_name,
          status,
          mime_type,
          storage_key,
          thumbnail_key,
          file_size_bytes,
          metadata,
          event_id
        )
        VALUES (
          ${guest_name ?? 'Anonymous Guest'},
          ${EVENT_MEDIA_STATUS.PENDING},
          ${mime_type},
          ${storage_key},
          ${null},
          ${BigInt(file_size_bytes)},
          ${metadataValue}::jsonb,
          ${eventInternalId}
        )
        RETURNING
          guid as id
      `;

      if (!createdEventMedia || createdEventMedia.length === 0) {
        throw new BadRequestException('Failed to create event media');
      }

      return {
        upload_url: upload_url,
        storage_key: storage_key,
        event_media_id: createdEventMedia[0].id,
      };
    } catch (error) {
      this.logger.error(`Failed to generate upload presigned url: ${error}`);
      throw new BadRequestException('Failed to generate upload presigned url');
    }
  }

  async confirmUpload(eventMediaId: string): Promise<EventMediaEntity> {
    const eventMedia = await this.eventMediaRepository.findOneByGuid(eventMediaId);
    const eventInternalId = await this.eventRepository.findInternalIdByGuid(eventMedia.event_id);


    if (!eventMedia) {
      throw new NotFoundException('Event media not found');
    }
    if (eventMedia.status !== EVENT_MEDIA_STATUS.PENDING) {
      throw new BadRequestException('Event media is not pending');
    }

    if (!eventInternalId) {
      throw new NotFoundException('Event not found');
    }

    return await this.dbapp.$transaction(async (tx) => {
      const updatedEventMedia = await tx.$queryRaw<any[]>`
        UPDATE event_media SET
          status = ${EVENT_MEDIA_STATUS.APPROVED},
          updated_at = NOW()
        WHERE guid = ${eventMediaId}
        RETURNING
          guid as id
      `;

      if (!updatedEventMedia || updatedEventMedia.length === 0) {
        throw new BadRequestException('Failed to update event media');
      }

      await tx.$queryRaw`
        UPDATE events SET
          current_media_count = current_media_count + 1,
          current_storage_bytes = current_storage_bytes + ${BigInt(eventMedia.file_size_bytes)}::bigint,
          updated_at = NOW()
        WHERE id = ${eventInternalId}
      `;

      return EventMediaEntity.fromDBApplication(updatedEventMedia[0]);
    });


  }

}
