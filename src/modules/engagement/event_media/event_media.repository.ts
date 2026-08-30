import { Injectable, NotFoundException } from '@nestjs/common';
import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { EventMediaEntity } from './entities/event_media.entity';

@Injectable()
export class EventMediaRepository {
  constructor(private readonly dbapp: DbappService) { }

  async findOneByGuid(guid: string): Promise<EventMediaEntity> {
    const results = await this.dbapp.$queryRaw<any[]>`
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
      INNER JOIN event e ON e.id = em.event_id
      WHERE em.guid = ${guid}
      LIMIT 1
    `;

    if (!results || results.length === 0) {
      throw new NotFoundException('Event media not found');
    }

    return EventMediaEntity.fromDBApplication(results[0]);
  }
}
