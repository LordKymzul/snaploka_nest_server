import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class EventService {

  private readonly baseUrl: string;
  constructor(
    private readonly dbapp: DbappService,
    private readonly userRepository: UserRepository,
    private readonly eventRepository: EventRepository,
    private readonly config: Config,
  ) {
    this.baseUrl = this.config.getBaseUrl();
  }

  async create(createEventDto: CreateEventDto, user_id: string): Promise<EventEntity> {
    const {
      name,
      description,
      type,
      start_date,
      end_date,
      metadata,
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

    const createdEvent = await this.dbapp.$queryRaw<any[]>`
      INSERT INTO events (
        name,
        description,
        type,
        start_date,
        end_date,
        metadata,
        user_id
      )
      VALUES (
        ${name},
        ${description ?? null},
        ${type},
        ${startDate},
        ${endDate},
        ${metadataValue}::jsonb,
        ${user_internal_id}
      )
      RETURNING
        guid as id
    `;

    if (!createdEvent || createdEvent.length === 0) {
      throw new BadRequestException('Failed to create event');
    }

    return EventEntity.fromDBApplication(createdEvent[0]);
  }

  async findAll(queryEventDto: QueryEventDto, user_id?: string): Promise<{
    total: number;
    events: EventEntity[];
    page: number;
    limit: number;
  }> {
    const { keyword, type, status, page, limit } = queryEventDto;

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
        e.updated_at
      FROM events e
      INNER JOIN users u ON u.id = e.user_id
      ${whereClause}
      ORDER BY e.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(take, skip);

    const countQuery = `
      SELECT COUNT(*)::int as total
      FROM events e
      INNER JOIN users u ON u.id = e.user_id
      ${whereClause}
    `;

    const countParams = queryParams.slice(0, -2);

    const [totalResult, events] = await Promise.all([
      this.dbapp.$queryRawUnsafe<any[]>(countQuery, ...countParams),
      this.dbapp.$queryRawUnsafe<any[]>(query, ...queryParams),
    ]);

    const total = totalResult[0]?.total || 0;

    return {
      total,
      events: events.map((event) => EventEntity.fromDBApplication(event)),
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
    return this.eventRepository.findOneByGuid(id);
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<EventEntity> {
    const {
      name,
      description,
      type,
      status,
      start_date,
      end_date,
      metadata,
    } = updateEventDto;

    await this.eventRepository.findOneByGuid(id);

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
      },
    });

    return this.eventRepository.findOneByGuid(id);
  }

  async remove(id: string): Promise<EventEntity> {
    const existing = await this.dbapp.event.findUnique({
      where: { guid: id },
      select: { id: true, guid: true },
    });

    if (!existing) {
      throw new NotFoundException('Event not found');
    }

    await this.dbapp.event.delete({
      where: { guid: id },
    });

    return EventEntity.fromDBApplication({
      id: existing.guid,
    });
  }


  async getEventQrCode(id: string): Promise<Buffer> {
    const eventInternalId = await this.eventRepository.findInternalIdByGuid(id);
    if (!eventInternalId) {
      throw new NotFoundException('Event not found');
    }
    const targetUrl = `${this.baseUrl}/event-media/event/${id}`;
    const qrBuffer = await QRCode.toBuffer(targetUrl, {
      type: 'png',
      width: 600,
      margin: 2,
    });
    return qrBuffer;
  }
}
