import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventService } from '../engagement/event/event.service';
import { EventGuestEntity } from './entities/event-guest.entity';
import { QueryEventMediaGuestDto } from './dto/query-event-media-guest.dto';
import { EventMediaGuestEntity } from './entities/event-media-guest.entity';
import { EVENT_MEDIA_TYPE, PAGINATION_LIMIT, PAGINATION_PAGE } from 'src/core/util/constant';
import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { EventMediaStorageService } from '../engagement/event_media/event_media_storage.service';
import { EventMediaEntity } from '../engagement/event_media/entities/event_media.entity';
import { EventMediaRepository } from '../engagement/event_media/event_media.repository';
import { QueryEventNoteGuestDto } from './dto/query-event-note-guest.dto';
import { EventNoteGuestEntity } from './entities/event-note-guest.entity';
import { EventNoteRepository } from '../engagement/event_note/event_note.repository';
import { EventNoteService } from '../engagement/event_note/event_note.service';
import { CreateEventNoteDto } from '../engagement/event_note/dto/create-event_note.dto';
import { EventBankAccountService } from '../engagement/event_bank_account/event_bank_account.service';
import { QueryEventBankAccountDto } from '../engagement/event_bank_account/dto/query-event_bank_account.dto';
import { EventBankAccountGuestEntity } from './entities/event-bank-account-guest.entity';
import { EventBankAccountStorageService } from '../engagement/event_bank_account/event_bank_account_storage.service';
import { QueryEventPostGuestDto } from './dto/query-event-post-quest.dto';
import { EventPostGuestEntity } from './entities/event-post-guest.entity';
import { EventPostService } from '../engagement/event_post/event_post.service';
import { CreateEventPostGuestDto } from './dto/create-event-post-guest.dto';

@Injectable()
export class GuestService {

    constructor(
        private readonly eventService: EventService,
        private readonly dbapp: DbappService,
        private readonly eventMediaStorageService: EventMediaStorageService,
        private readonly eventMediaRepository: EventMediaRepository,
        private readonly eventNoteRepository: EventNoteRepository,
        private readonly eventNoteService: EventNoteService,
        private readonly eventBankAccountService: EventBankAccountService,
        private readonly eventPostService: EventPostService,
    ) { }

    async getEventById(id: string): Promise<EventGuestEntity> {
        return this.eventService.findOneByGuidForGuest(id);
    }

    async findAllEventMedia(queryEventMediaDto: QueryEventMediaGuestDto): Promise<{
        total: number;
        eventMedia: EventMediaGuestEntity[];
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

        const formattedEventMediaGuest = formattedEventMedia.map((item) => EventMediaGuestEntity.fromDBApplication(item));

        return {
            total,
            eventMedia: formattedEventMediaGuest,
            page: pageNum,
            limit: limitNum,
        };
    }

    async findOneEventMedia(id: string): Promise<EventMediaGuestEntity> {
        const eventMedia = await this.eventMediaRepository.findOneByGuidForGuest(id);
        if (!eventMedia) {
            throw new NotFoundException('Event media not found');
        }

        const storageKey = await this.eventMediaRepository.getStorageKeyByEventMediaGuid(id);
        if (!storageKey) {
            throw new NotFoundException('Storage key not found');
        }

        const eventMediaEntity = EventMediaEntity.fromDBApplication(eventMedia);
        eventMediaEntity.url = this.eventMediaStorageService.getMediaUrl(storageKey);
        return EventMediaGuestEntity.fromDBApplication({
            ...eventMediaEntity,
            url: eventMediaEntity.url,
        });
    }

    async findAllEventNotes(queryEventNoteDto: QueryEventNoteGuestDto): Promise<{
        total: number;
        eventNotes: EventNoteGuestEntity[];
        page: number;
        limit: number;
    }> {
        const { event_id, status, page, limit, with_event } = queryEventNoteDto;

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
      FROM event_notes en
      INNER JOIN events e ON e.id = en.event_id
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
            eventNotes: eventNotes.map((row) => EventNoteGuestEntity.fromDBApplication(row)),
            page: pageNum,
            limit: limitNum,
        };
    }

    async findOneEventNote(id: string): Promise<EventNoteGuestEntity> {
        const eventNote = await this.eventNoteRepository.findOneByGuidForGuest(id);
        if (!eventNote) {
            throw new NotFoundException('Event note not found');
        }
        return EventNoteGuestEntity.fromDBApplication(eventNote);
    }

    async createEventNote(createEventNoteDto: CreateEventNoteDto): Promise<EventNoteGuestEntity> {
        const eventNote = await this.eventNoteService.create(createEventNoteDto);
        return EventNoteGuestEntity.fromDBApplication(eventNote);
    }

    async findAllEventBankAccounts(queryEventBankAccountDto: QueryEventBankAccountDto): Promise<{
        total: number;
        bankAccounts: EventBankAccountGuestEntity[];
        page: number;
        limit: number;
    }> {
        if (!queryEventBankAccountDto.event_id) {
            throw new BadRequestException('Event ID is required');
        }
        const result = await this.eventBankAccountService.findAllByEventId(queryEventBankAccountDto, queryEventBankAccountDto.event_id);
        for (const item of result.bankAccounts) {
            console.log(item);
        }
        const formattedBankAccounts = result.bankAccounts.map((item) => EventBankAccountGuestEntity.fromDBApplication(item));
        return {
            total: result.total,
            bankAccounts: formattedBankAccounts,
            page: result.page,
            limit: result.limit,
        };
    }

    async findAllEventPosts(queryEventPostDto: QueryEventPostGuestDto): Promise<{
        total: number;
        eventPosts: EventPostGuestEntity[];
        page: number;
        limit: number;
    }> {
        const { event_id } = queryEventPostDto;
        if (!event_id) {
            throw new BadRequestException('Event ID is required');
        }
        const result = await this.eventPostService.findAllByEventId(queryEventPostDto, event_id);
        return {
            total: result.total,
            eventPosts: result.eventPosts.map((item) => EventPostGuestEntity.fromDBApplication(item)),
            page: result.page,
            limit: result.limit,
        };
    }

    async createEventPost(createEventPostDto: CreateEventPostGuestDto) {
        return this.eventPostService.create(createEventPostDto);
    }

    async confirmUploadEventPost(id: string) {
        return this.eventPostService.confirmUpload(id);
    }
}
