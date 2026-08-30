import { Injectable, NotFoundException } from '@nestjs/common';
import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { EventPackageEntity } from './entities/event_package.entity';

@Injectable()
export class EventPackageRepository {
  constructor(private readonly dbapp: DbappService) { }

  async findInternalIdByName(name: string): Promise<number> {
    const results = await this.dbapp.$queryRaw<any[]>`
      SELECT id FROM event_packages WHERE name = ${name} LIMIT 1
    `;

    if (!results || results.length === 0) {
      throw new NotFoundException('Event package not found');
    }

    return results[0].id;
  }

  async findInternalIdByGuid(guid: string): Promise<number> {
    const results = await this.dbapp.$queryRaw<Array<{ id: number }>>`
      SELECT id FROM event_packages
      WHERE guid = ${guid}
        AND deleted_at IS NULL
      LIMIT 1
    `;

    if (!results || results.length === 0) {
      throw new NotFoundException('Event package not found');
    }

    return results[0].id;
  }

  async findOneByGuid(guid: string): Promise<EventPackageEntity> {
    const results = await this.dbapp.$queryRaw<any[]>`
      SELECT
        ep.guid as id,
        ep.name,
        ep.description,
        ep.price,
        ep.currency,
        ep.max_media_count,
        ep.max_media_size,
        ep.is_active,
        ep.metadata,
        ep.created_at,
        ep.updated_at,
        ep.deleted_at
      FROM event_packages ep
      WHERE ep.guid = ${guid}
        AND ep.deleted_at IS NULL
      LIMIT 1
    `;

    if (!results || results.length === 0) {
      throw new NotFoundException('Event package not found');
    }

    return EventPackageEntity.fromDBApplication(results[0]);
  }
}
