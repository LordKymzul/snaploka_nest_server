import { Injectable, NotFoundException } from '@nestjs/common';
import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { EventNoteEntity } from './entities/event_note.entity';
import { EventNoteGuestEntity } from 'src/modules/guest/entities/event-note-guest.entity';

@Injectable()
export class EventNoteRepository {
  constructor(private readonly dbapp: DbappService) { }

  async findOneByGuid(guid: string, withEvent = false): Promise<EventNoteEntity> {
    const results = await this.dbapp.$queryRawUnsafe<any[]>(
      `
      SELECT
        en.guid as id,
        en.guest_name,
        en.title,
        en.content,
        en.status,
        e.guid as event_id,
        en.created_at,
        en.updated_at
        ${withEvent ? `,
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
        ` : ''}
      FROM event_notes en
      INNER JOIN events e ON e.id = en.event_id
      ${withEvent ? 'INNER JOIN users u ON u.id = e.user_id' : ''}
      WHERE en.guid = $1
      LIMIT 1
      `,
      guid,
    );

    if (!results || results.length === 0) {
      throw new NotFoundException('Event note not found');
    }

    return this.mapToEntity(results[0], withEvent);
  }

  async findOneByGuidForGuest(guid: string): Promise<EventNoteGuestEntity> {
    const results = await this.dbapp.$queryRawUnsafe<any[]>(
      `
      SELECT
        en.guid as id,
        en.guest_name,
        en.title,
        en.content,
        en.status,
        en.event_id,
        en.created_at,
        en.updated_at
      FROM event_notes en
      WHERE en.guid = $1
      LIMIT 1
      `,
      guid,
    );

    if (!results || results.length === 0) {
      throw new NotFoundException('Event note not found');
    }

    return EventNoteGuestEntity.fromDBApplication(results[0]);
  }

  mapToEntity(row: any, withEvent = false): EventNoteEntity {
    return EventNoteEntity.fromDBApplication({
      id: row.id,
      guest_name: row.guest_name,
      title: row.title,
      content: row.content,
      status: row.status,
      event_id: row.event_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      ...(withEvent && {
        event: {
          guid: row.event_guid ?? row.event_id,
          name: row.event_name,
          description: row.event_description,
          status: row.event_status,
          type: row.event_type,
          start_date: row.event_start_date,
          end_date: row.event_end_date,
          max_media_allowed: row.event_max_media_allowed,
          max_storage_bytes: row.event_max_storage_bytes,
          current_media_count: row.event_current_media_count,
          current_storage_bytes: row.event_current_storage_bytes,
          metadata: row.event_metadata,
          created_at: row.event_created_at,
          updated_at: row.event_updated_at,
          access_mode: row.event_access_mode,
          thumbnail_storage_key: row.event_thumbnail_storage_key,
          thumbnail_mime_type: row.event_thumbnail_mime_type,
          thumbnail_file_size: row.event_thumbnail_file_size,
          user_id: row.event_user_id,
        },
      }),
    });
  }
}
