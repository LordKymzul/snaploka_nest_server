import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';
import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { UserRepository } from 'src/modules/identity/user/user.repository';
import { EventEntity } from './entities/event.entity';
import { EventRepository } from './event.repository';
import {
  PAGINATION_LIMIT,
  PAGINATION_PAGE
} from 'src/core/util/constant';
import * as QRCode from 'qrcode';
import { Response } from 'express';
import { Config } from 'src/core/util/config';
import { EventMediaStorageService } from '../event_media/event_media_storage.service';
import { ConfirmEventThumbnailDto } from './dto/confirm-event-thumbnail.dto';
import { EventStorageService } from './event_storage.serviec';
import { EventGuestEntity } from 'src/modules/guest/entities/event-guest.entity';

@Injectable()
export class EventService {


  private readonly logger = new Logger(EventService.name);

  private readonly baseUrl: string;
  constructor(
    private readonly dbapp: DbappService,
    private readonly userRepository: UserRepository,
    private readonly eventRepository: EventRepository,
    private readonly config: Config,
    private readonly eventStorageService: EventStorageService,
  ) {
    this.baseUrl = this.config.getBaseUrl();
  }

  async create(createEventDto: CreateEventDto, user_id: string) {
    const {
      name,
      description,
      type,
      start_date,
      end_date,
      metadata,
      access_mode,
      thumbnail_mime_type,
      thumbnail_file_size,
    } = createEventDto;


    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid start_date or end_date');
    }

    if (endDate <= startDate) {
      throw new BadRequestException('end_date must be after start_date');
    }

    const user_internal_id = await this.userRepository.findInternalIdByGuid(user_id);
    const metadataValue = metadata ? JSON.stringify(metadata) : null;

    const tempGuid = crypto.randomUUID();
    let uploadUrl: string | null = null;
    let storageKey: string | null = null;

    if (thumbnail_mime_type && thumbnail_file_size) {
      const presignedData = await this.eventStorageService.generateUploadPresignedUrl(
        tempGuid,
        thumbnail_mime_type,
        thumbnail_file_size,
      );
      uploadUrl = presignedData.upload_url;
      storageKey = presignedData.storage_key;
    }


    const createdEvent = await this.dbapp.$queryRaw<any[]>`
    INSERT INTO events (
      guid,
      name,
      description,
      type,
      start_date,
      end_date,
      metadata,
      user_id,
      access_mode,
      thumbnail_storage_key,
      thumbnail_mime_type,
      thumbnail_file_size
    )
    VALUES (
      ${tempGuid},
      ${name},
      ${description ?? null},
      ${type},
      ${startDate},
      ${endDate},
      ${metadataValue}::jsonb,
      ${user_internal_id},
      ${access_mode ?? 'READ_WRITE'},
      ${storageKey},
      ${thumbnail_mime_type ?? null},
      ${thumbnail_file_size ? BigInt(thumbnail_file_size) : null}
    )
    RETURNING guid as id
  `;

    if (!createdEvent || createdEvent.length === 0) {
      throw new BadRequestException('Failed to create event');
    }

    return {
      id: createdEvent[0].id,
      ...(uploadUrl && { upload_url: uploadUrl, storage_key: storageKey }),
    };
  }

  async findAll(queryEventDto: QueryEventDto, user_id?: string): Promise<{
    total: number;
    events: EventEntity[];
    page: number;
    limit: number;
  }> {
    const { keyword, type, status, page, limit, with_order } = queryEventDto;

    const pageNum = Number(page || PAGINATION_PAGE);
    const limitNum = Number(limit || PAGINATION_LIMIT);
    const skip = (pageNum - PAGINATION_PAGE) * limitNum;
    const take = limitNum;

    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (user_id) {
      whereConditions.push(`u.guid = $${paramIndex}`);
      queryParams.push(user_id);
      paramIndex++;
    }

    if (keyword) {
      whereConditions.push(`LOWER(e.name) LIKE LOWER(CONCAT('%', $${paramIndex}, '%'))`);
      queryParams.push(keyword);
      paramIndex++;
    }

    if (type) {
      whereConditions.push(`e.type = $${paramIndex}`);
      queryParams.push(type);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`e.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';


    const conditionalFields: string[] = [];

    if (with_order) {
      conditionalFields.push(`
        CASE WHEN o.id IS NOT NULL THEN json_build_object(
          'id', o.guid,
          'payment_provider', o.payment_provider,
          'provider_order_id', o.provider_order_id,
          'provider_payment_id', o.provider_payment_id,
          'payment_url', o.payment_url
        ) ELSE NULL END as order
      `);
    }

    const optionalFields = conditionalFields.length > 0
      ? `, ${conditionalFields.join(', ')}`
      : '';


    const query = `
      SELECT
        e.guid as id,
        e.name,
        e.description,
        e.status,
        e.type,
        e.start_date,
        e.end_date,
        e.max_media_allowed,
        e.max_storage_bytes,
        e.current_media_count,
        e.current_storage_bytes,
        u.guid as user_id,
        e.metadata,
        e.created_at,
        e.updated_at,
        e.access_mode,
        e.thumbnail_storage_key,
        e.thumbnail_mime_type,
        e.thumbnail_file_size
        ${optionalFields}
      FROM events e
      INNER JOIN users u ON u.id = e.user_id
      LEFT JOIN orders o ON o.event_id = e.id
      ${whereClause}
      ORDER BY e.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(take, skip);

    const countQuery = `
      SELECT COUNT(*)::int as total
      FROM events e
      INNER JOIN users u ON u.id = e.user_id
      LEFT JOIN orders o ON o.event_id = e.id
      ${whereClause}
    `;

    const countParams = queryParams.slice(0, -2);

    const [totalResult, events] = await Promise.all([
      this.dbapp.$queryRawUnsafe<any[]>(countQuery, ...countParams),
      this.dbapp.$queryRawUnsafe<any[]>(query, ...queryParams),
    ]);

    const total = totalResult[0]?.total || 0;

    let formattedEvents = events.map((event) => {
      const eventEntity = EventEntity.fromDBApplication(event);
      if (eventEntity.thumbnail_storage_key) {
        eventEntity.thumbnail_url = this.eventStorageService.getMediaUrl(eventEntity.thumbnail_storage_key);
      }
      return eventEntity;
    });



    return {
      total,
      events: formattedEvents,
      page: pageNum,
      limit: limitNum,
    };
  }

  async findAllByUser(queryEventDto: QueryEventDto, user_id: string): Promise<{
    total: number;
    events: EventEntity[];
    page: number;
    limit: number;
  }> {
    return this.findAll(queryEventDto, user_id);
  }

  async findOne(id: string): Promise<EventEntity> {
    const event = await this.eventRepository.findOneByGuid(id);
    const eventEntity = EventEntity.fromDBApplication(event);
    if (eventEntity.thumbnail_storage_key) {
      eventEntity.thumbnail_url = this.eventStorageService.getMediaUrl(eventEntity.thumbnail_storage_key);
    }
    return eventEntity;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const {
      name,
      description,
      type,
      status,
      start_date,
      end_date,
      metadata,
      thumbnail_mime_type,
      thumbnail_file_size,
    } = updateEventDto;

    this.logger.debug(`Update Event DTO: ${JSON.stringify(updateEventDto)}`);

    const existingEvent = await this.eventRepository.findOneByGuid(id);
    if (!existingEvent) {
      throw new NotFoundException('Event not found');
    }

    const startDate = start_date !== undefined ? new Date(start_date) : undefined;
    const endDate = end_date !== undefined ? new Date(end_date) : undefined;

    if (startDate && Number.isNaN(startDate.getTime())) {
      throw new BadRequestException('Invalid start_date');
    }

    if (endDate && Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid end_date');
    }

    if (startDate && endDate && endDate <= startDate) {
      throw new BadRequestException('end_date must be after start_date');
    }

  let uploadUrl: string | null = null;
  let storageKey: string | null = null;

  if (thumbnail_mime_type && thumbnail_file_size) {
    try {
      const presignedData = await this.eventStorageService.generateUploadPresignedUrl(
        id,
        thumbnail_mime_type,
        thumbnail_file_size,
      );
      uploadUrl = presignedData.upload_url;
      storageKey = presignedData.storage_key;
      if (uploadUrl && storageKey && existingEvent.thumbnail_storage_key) {
        try {
          await this.eventStorageService.deleteMedia(existingEvent.thumbnail_storage_key);
        } catch (error) {
          this.logger.error(`Failed to delete existing thumbnail media: ${error}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to generate upload presigned url: ${error}`);
      throw new BadRequestException('Failed to generate upload presigned url');
    }
  }

    await this.dbapp.event.update({
      where: { guid: id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(status !== undefined && { status }),
        ...(startDate !== undefined && { start_date: startDate }),
        ...(endDate !== undefined && { end_date: endDate }),
        ...(metadata !== undefined && { metadata }),
        ...(storageKey !== null && { thumbnail_storage_key: storageKey }),
        ...(thumbnail_mime_type !== undefined && { thumbnail_mime_type }),
        ...(thumbnail_file_size !== undefined && { thumbnail_file_size: BigInt(thumbnail_file_size) }),
      },
    });

    return {
      id,
      ...(uploadUrl && { upload_url: uploadUrl, storage_key: storageKey }),
    };
  }

  async remove(id: string): Promise<EventEntity> {
    return await this.dbapp.$transaction(async (tx) => {
      const existing = await tx.event.findUnique({
        where: { guid: id },
        select: { id: true, guid: true, thumbnail_storage_key: true },
      });

      if (!existing) {
        throw new NotFoundException('Event not found');
      }

      await tx.event.delete({
        where: { guid: id },
        select: { thumbnail_storage_key: true },
      });

      if (existing.thumbnail_storage_key) {
        try {
          await this.eventStorageService.deleteMedia(existing.thumbnail_storage_key);
        } catch (error) {
          this.logger.error(`Failed to delete thumbnail media: ${error}`);
          throw new BadRequestException('Failed to delete thumbnail media');
        }
      }

      return EventEntity.fromDBApplication({
        id: existing.guid,
      });
    });
  }


  async getEventQrCode(id: string): Promise<string> {
    const eventInternalId = await this.eventRepository.findInternalIdByGuid(id);
    if (!eventInternalId) {
      throw new NotFoundException('Event not found');
    }
    const targetUrl = `${this.baseUrl}/event-media/event/${id}`;

    return QRCode.toString(targetUrl, { type: 'svg', margin: 2 });
  }

  async confirmThumbnailUpload(id: string, confirmEventThumbnailDto: ConfirmEventThumbnailDto) {
    const { previous_storage_key } = confirmEventThumbnailDto;
    const eventInternalId = await this.eventRepository.findInternalIdByGuid(id);
    if (!eventInternalId) {
      throw new NotFoundException('Event not found');
    }
    await this.eventStorageService.deleteMedia(previous_storage_key);
    await this.dbapp.$queryRaw`
      UPDATE events SET
      thumbnail_storage_key = ${previous_storage_key}
    `;
  }


  async findOneByGuidForGuest(guid: string): Promise<EventGuestEntity> {
    const event = await this.eventRepository.findOneByGuidForGuest(guid);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    const storageKey = await this.eventRepository.getStorageKeyByEventGuid(guid);
    if (storageKey) {
      event.thumbnail_url = this.eventStorageService.getMediaUrl(storageKey);
    }
    const mediaCount = await this.eventRepository.getMediaCountByEventGuid(guid);
    return EventGuestEntity.fromDBApplication({
      ...event,
      current_image_count: mediaCount.image_count,
      current_video_count: mediaCount.video_count,
      current_audio_count: mediaCount.audio_count,
      current_note_count: mediaCount.note_count,
    });
  }
}
