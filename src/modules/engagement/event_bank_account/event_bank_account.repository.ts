import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { EVENT_BANK_ACCOUNT_TYPE, PAGINATION_LIMIT, PAGINATION_PAGE } from 'src/core/util/constant';
import { QueryEventBankAccountDto } from './dto/query-event_bank_account.dto';
import { EventBankAccountEntity } from './entities/event_bank_account.entity';

@Injectable()
export class EventBankAccountRepository {
  constructor(private readonly dbapp: DbappService) { }


  async findInternalIdByEventGuid(eventGuid: string): Promise<number | null> {
    const result = await this.dbapp.$queryRaw<Array<{ id: number }>>`
      SELECT event_bank_accounts.id 
      FROM event_bank_accounts 
      JOIN events 
      ON events.id = event_bank_accounts.event_id 
      WHERE events.guid = ${eventGuid} 
      LIMIT 1
    `;

    return result?.[0]?.id ?? null;


  }

  async findInternalIdByGuid(guid: string): Promise<number | null> {
    const result = await this.dbapp.$queryRaw<Array<{ id: number }>>`
      SELECT id FROM event_bank_accounts WHERE guid = ${guid} LIMIT 1
    `;

    return result?.[0]?.id ?? null;
  }

  async create(data: {
    eventInternalId: number;
    bank_name: string;
    account_number: string;
    account_holder_name: string;
    qr_image_storage_key?: string | null;
    metadata?: Record<string, any> | null;
    type: EVENT_BANK_ACCOUNT_TYPE;
  }): Promise<string> {
    const metadataValue = data.metadata ? JSON.stringify(data.metadata) : null;

    const results = await this.dbapp.$queryRaw<Array<{ id: string }>>`
      INSERT INTO event_bank_accounts (
        event_id,
        bank_name,
        account_number,
        account_holder_name,
        qr_image_storage_key,
        metadata,
        type
      )
      VALUES (
        ${data.eventInternalId},
        ${data.bank_name},
        ${data.account_number},
        ${data.account_holder_name},
        ${data.qr_image_storage_key ?? null},
        ${metadataValue}::jsonb,
        ${data.type}
      )
      RETURNING guid as id
    `;

    if (!results || results.length === 0) {
      throw new BadRequestException('Failed to create event bank account');
    }

    return results[0].id;
  }

  async findAll(queryEventBankAccountDto: QueryEventBankAccountDto): Promise<{
    total: number;
    eventBankAccounts: EventBankAccountEntity[];
    page: number;
    limit: number;
  }> {
    const { event_id, is_active, page, limit, with_event, type } = queryEventBankAccountDto;
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

    if (is_active === 'true' || is_active === 'false') {
      whereConditions.push(`eba.is_active = $${paramIndex}`);
      queryParams.push(is_active === 'true');
      paramIndex++;
    }

    if (type) {
      whereConditions.push(`eba.type = $${paramIndex}`);
      queryParams.push(type);
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
        e.end_date as event_end_date
      `
      : '';

    const userJoin = includeEvent
      ? 'INNER JOIN users u ON u.id = e.user_id'
      : '';

    const query = `
      SELECT
        eba.guid as id,
        eba.bank_name,
        eba.account_number,
        eba.account_holder_name,
        eba.qr_image_storage_key,
        eba.is_active,
        eba.metadata,
        e.guid as event_id,
        eba.created_at,
        eba.updated_at,
        eba.type
        ${eventSelect}
      FROM event_bank_accounts eba
      INNER JOIN events e ON e.id = eba.event_id
      ${userJoin}
      ${whereClause}
      ORDER BY eba.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(take, skip);

    const countQuery = `
      SELECT COUNT(*)::int as total
      FROM event_bank_accounts eba
      INNER JOIN events e ON e.id = eba.event_id
      ${whereClause}
    `;

    const countParams = queryParams.slice(0, -2);

    const [totalResult, rows] = await Promise.all([
      this.dbapp.$queryRawUnsafe<any[]>(countQuery, ...countParams),
      this.dbapp.$queryRawUnsafe<any[]>(query, ...queryParams),
    ]);

    return {
      total: totalResult[0]?.total || 0,
      eventBankAccounts: rows.map((row) => this.mapToEntity(row, includeEvent)),
      page: pageNum,
      limit: limitNum,
    };
  }

  async findOneByGuid(guid: string, withEvent = false): Promise<EventBankAccountEntity | null> {
    const results = await this.dbapp.$queryRawUnsafe<any[]>(
      `
      SELECT
        eba.guid as id,
        eba.bank_name,
        eba.account_number,
        eba.account_holder_name,
        eba.qr_image_storage_key,
        eba.is_active,
        eba.metadata,
        e.guid as event_id,
        eba.created_at,
        eba.updated_at,
        eba.type
        ${withEvent ? `,
        e.guid as event_guid,
        e.name as event_name,
        e.description as event_description,
        e.status as event_status,
        e.type as event_type,
        e.start_date as event_start_date,
        e.end_date as event_end_date
        ` : ''}
      FROM event_bank_accounts eba
      INNER JOIN events e ON e.id = eba.event_id
      ${withEvent ? 'INNER JOIN users u ON u.id = e.user_id' : ''}
      WHERE eba.guid = $1
      LIMIT 1
      `,
      guid,
    );


    return results.length > 0 ? this.mapToEntity(results[0], withEvent) : null;
  }

  async findOneByEventIdAndType(eventId: number, type: EVENT_BANK_ACCOUNT_TYPE): Promise<EventBankAccountEntity | null> {
    const results = await this.dbapp.$queryRawUnsafe<any[]>(
      `
      SELECT
        eba.guid as id,
        eba.bank_name,
        eba.account_number,
        eba.account_holder_name,
        eba.qr_image_storage_key,
        eba.is_active,
        eba.metadata,
        eba.created_at,
        eba.updated_at,
        eba.type
      FROM event_bank_accounts eba WHERE event_id = $1 AND type = $2 LIMIT 1
      `,
      eventId,
      type,
    );
    return results.length > 0 ? this.mapToEntity(results[0], false) : null;
  }

  mapToEntity(row: any, withEvent = false): EventBankAccountEntity {
    return EventBankAccountEntity.fromDBApplication({
      id: row.id,
      bank_name: row.bank_name,
      account_number: row.account_number,
      account_holder_name: row.account_holder_name,
      qr_image_storage_key: row.qr_image_storage_key,
      is_active: row.is_active,
      metadata: row.metadata,
      event_id: row.event_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      type: row.type as EVENT_BANK_ACCOUNT_TYPE,
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
