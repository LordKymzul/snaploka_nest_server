import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventNoteDto } from './dto/create-event_note.dto';
import { UpdateEventNoteDto } from './dto/update-event_note.dto';
import { QueryEventNoteDto } from './dto/query-event_note.dto';
import { EventNoteRepository } from './event_note.repository';
import { EventNoteEntity } from './entities/event_note.entity';
import { EventRepository } from '../event/event.repository';
import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { EVENT_STATUS, PAGINATION_LIMIT, PAGINATION_PAGE } from 'src/core/util/constant';

@Injectable()
export class EventNoteService {
  constructor(
    private readonly dbapp: DbappService,
    private readonly eventNoteRepository: EventNoteRepository,
    private readonly eventRepository: EventRepository,
  ) { }

  async create(createEventNoteDto: CreateEventNoteDto): Promise<EventNoteEntity> {
    const {
      guest_name,
      title,
      content,
      event_id,
    } = createEventNoteDto;

    const event = await this.eventRepository.findOneByGuid(event_id);
    const eventInternalId = await this.eventRepository.findInternalIdByGuid(event_id);

    if (event.status !== EVENT_STATUS.ACTIVE) {
      throw new BadRequestException('Event is not active, please contact the administrator');
    }

    const createdEventNote = await this.dbapp.$queryRaw<any[]>`
      INSERT INTO event_notes (
        guest_name,
        title,
        content,
        event_id
      )
      VALUES (
        ${guest_name ?? 'Anonymous Guest'},
        ${title ?? null},
        ${content},
        ${eventInternalId}
      )
      RETURNING guid as id
    `;

    if (!createdEventNote || createdEventNote.length === 0) {
      throw new BadRequestException('Failed to create event note');
    }

    return this.eventNoteRepository.findOneByGuid(createdEventNote[0].id);
  }

  async findAll(queryEventNoteDto: QueryEventNoteDto): Promise<{
    total: number;
    eventNotes: EventNoteEntity[];
    page: number;
    limit: number;
  }> {
    const { event_id, status, page, limit, with_event } = queryEventNoteDto;
    const includeEvent = with_event === 'true';

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
      whereConditions.push(`en.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const eventSelect = includeEvent
      ? `,
        e.guid as event_guid,
        e.name as event_name,
        e.description as event_description,
        e.status as event_status,
        e.type as event_type,
        e.start_date as event_start_date,
        e.end_date as event_end_date,
        e.max_media_allowed as event_max_media_allowed,
        e.max_storage_bytes as event_max_storage_bytes,
        e.current_media_count as event_current_media_count,
        e.current_storage_bytes as event_current_storage_bytes,
        e.metadata as event_metadata,
        e.created_at as event_created_at,
        e.updated_at as event_updated_at,
        e.access_mode as event_access_mode,
        e.thumbnail_storage_key as event_thumbnail_storage_key,
        e.thumbnail_mime_type as event_thumbnail_mime_type,
        e.thumbnail_file_size as event_thumbnail_file_size,
        u.guid as event_user_id
      `
      : '';

    const userJoin = includeEvent
      ? 'INNER JOIN users u ON u.id = e.user_id'
      : '';

    const query = `
      SELECT
        en.guid as id,
        en.guest_name,
        en.title,
        en.content,
        en.status,
        e.guid as event_id,
        en.created_at,
        en.updated_at
        ${eventSelect}
      FROM event_notes en
      INNER JOIN events e ON e.id = en.event_id
      ${userJoin}
      ${whereClause}
      ORDER BY en.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(take, skip);

    const countQuery = `
      SELECT COUNT(*)::int as total
      FROM event_notes en
      INNER JOIN events e ON e.id = en.event_id
      ${whereClause}
    `;

    const countParams = queryParams.slice(0, -2);

    const [totalResult, eventNotes] = await Promise.all([
      this.dbapp.$queryRawUnsafe<any[]>(countQuery, ...countParams),
      this.dbapp.$queryRawUnsafe<any[]>(query, ...queryParams),
    ]);

    const total = totalResult[0]?.total || 0;

    return {
      total,
      eventNotes: eventNotes.map((row) => this.eventNoteRepository.mapToEntity(row, includeEvent)),
      page: pageNum,
      limit: limitNum,
    };
  }

  async findAllByEventId(queryEventNoteDto: QueryEventNoteDto, event_id: string): Promise<{
    total: number;
    eventNotes: EventNoteEntity[];
    page: number;
    limit: number;
  }> {
    return this.findAll({ ...queryEventNoteDto, event_id });
  }

  async findOne(id: string, withEvent = false): Promise<EventNoteEntity> {
    return this.eventNoteRepository.findOneByGuid(id, withEvent);
  }

  async update(id: string, updateEventNoteDto: UpdateEventNoteDto): Promise<EventNoteEntity> {
    const {
      guest_name,
      title,
      content,
      status,
      event_id,
    } = updateEventNoteDto;

    await this.eventNoteRepository.findOneByGuid(id);

    let eventInternalId: number | undefined;
    if (event_id !== undefined) {
      eventInternalId = await this.eventRepository.findInternalIdByGuid(event_id);
    }

    await this.dbapp.eventNote.update({
      where: { guid: id },
      data: {
        ...(guest_name !== undefined && { guest_name }),
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(status !== undefined && { status }),
        ...(eventInternalId !== undefined && { event_id: eventInternalId }),
      },
    });

    return this.eventNoteRepository.findOneByGuid(id);
  }

  async remove(id: string): Promise<EventNoteEntity> {
    const existing = await this.dbapp.eventNote.findFirst({
      where: { guid: id },
      select: { guid: true },
    });

    if (!existing) {
      throw new NotFoundException('Event note not found');
    }

    await this.dbapp.eventNote.delete({
      where: { guid: id },
    });

    return EventNoteEntity.fromDBApplication({
      id: existing.guid,
    });
  }
}
