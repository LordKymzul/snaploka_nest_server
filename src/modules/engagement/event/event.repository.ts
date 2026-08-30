import { Injectable, NotFoundException } from '@nestjs/common';
import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { EventEntity } from './entities/event.entity';

@Injectable()
export class EventRepository {
  constructor(private readonly dbapp: DbappService) { }


  async findInternalIdByGuid(guid: string): Promise<number> {
    const results = await this.dbapp.$queryRaw<Array<{ id: number }>>`
      SELECT e.id FROM events e WHERE e.guid = ${guid}
      LIMIT 1
    `;
    if (!results || results.length === 0) {
      throw new NotFoundException('Event not found');
    }

    return results[0].id;
  }

  async findOneByGuid(guid: string): Promise<EventEntity> {
    const results = await this.dbapp.$queryRaw<any[]>`
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
      WHERE e.guid = ${guid}
      LIMIT 1
    `;

    if (!results || results.length === 0) {
      throw new NotFoundException('Event not found');
    }

    return EventEntity.fromDBApplication(results[0]);
  }
}
