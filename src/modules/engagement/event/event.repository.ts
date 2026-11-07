import { Injectable, NotFoundException } from '@nestjs/common';
import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { EventEntity } from './entities/event.entity';
import { EventGuestEntity } from 'src/modules/guest/entities/event-guest.entity';
import { EventBankAccountEntity } from '../event_bank_account/entities/event_bank_account.entity';
import { EventBankAccountGuestEntity } from 'src/modules/guest/entities/event-bank-account-guest.entity';

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
        e.updated_at,
        e.access_mode,
        e.thumbnail_storage_key,
        e.thumbnail_mime_type,
        e.thumbnail_file_size,
        eba.guid as bank_account_id,
        eba.bank_name as bank_account_bank_name,
        eba.account_number as bank_account_account_number,
        eba.account_holder_name as bank_account_account_holder_name,
        eba.qr_image_storage_key as bank_account_qr_image_storage_key
      FROM events e
      INNER JOIN users u ON u.id = e.user_id
      LEFT JOIN event_bank_accounts eba ON eba.event_id = e.id
      WHERE e.guid = ${guid}
      LIMIT 1
    `;

    if (!results || results.length === 0) {
      throw new NotFoundException('Event not found');
    }

    const bankAccount = results[0].bank_account_id ? EventBankAccountEntity.fromDBApplication({
      id: results[0].bank_account_id,
      bank_name: results[0].bank_account_bank_name,
      account_number: results[0].bank_account_account_number,
      account_holder_name: results[0].bank_account_account_holder_name,
      qr_image_storage_key: results[0].bank_account_qr_image_storage_key,
      metadata: results[0].bank_account_metadata,
      created_at: results[0].bank_account_created_at,
      updated_at: results[0].bank_account_updated_at,
    }) : null;

    return EventEntity.fromDBApplication({
      ...results[0],
      bank_account: bankAccount,
    });
  }

  async findOneByGuidForGuest(guid: string): Promise<EventGuestEntity> {
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
        eba.guid as bank_account_id,
        eba.bank_name as bank_account_bank_name,
        eba.account_number as bank_account_account_number,
        eba.account_holder_name as bank_account_account_holder_name,
        eba.qr_image_storage_key as bank_account_qr_image_storage_key
      FROM events e
      LEFT JOIN event_bank_accounts eba ON eba.event_id = e.id
      WHERE e.guid = ${guid}
      LIMIT 1
    `;

    if (!results || results.length === 0) {
      throw new NotFoundException('Event not found');
    }
    const bankAccount = results[0].bank_account_id ? EventBankAccountGuestEntity.fromDBApplication({
      id: results[0].bank_account_id,
      bank_name: results[0].bank_account_bank_name,
      account_number: results[0].bank_account_account_number,
      account_holder_name: results[0].bank_account_account_holder_name,
      qr_image_storage_key: results[0].bank_account_qr_image_storage_key,
    }) : null;

    return EventGuestEntity.fromDBApplication({
      ...results[0],
      bank_account: bankAccount,
    });
  }

  async getStorageKeyByEventGuid(guid: string): Promise<string> {
    const results = await this.dbapp.$queryRaw<any[]>`
      SELECT e.thumbnail_storage_key FROM events e WHERE e.guid = ${guid}
      LIMIT 1
    `;

    if (!results || results.length === 0) {
      throw new NotFoundException('Event not found');
    }
    return results[0].thumbnail_storage_key;
  }

  async getMediaCountByEventGuid(guid: string): Promise<{
    image_count: number;
    video_count: number;
    audio_count: number;
    note_count: number;
  }> {
    const results = await this.dbapp.$queryRaw<
      Array<{
        image_count: number;
        video_count: number;
        audio_count: number;
        note_count: number;
      }>
    >`
      SELECT
        count(em.id) FILTER (WHERE em.mime_type LIKE 'image/%')::int AS image_count,
        count(em.id) FILTER (WHERE em.mime_type LIKE 'video/%')::int AS video_count,
        count(em.id) FILTER (WHERE em.mime_type LIKE 'audio/%')::int AS audio_count,
        (
          SELECT count(en.id)::int
          FROM event_notes en
          WHERE en.event_id = e.id
        ) AS note_count
      FROM events e
      LEFT JOIN event_media em ON em.event_id = e.id
      WHERE e.guid = ${guid}
      GROUP BY e.id
      LIMIT 1
    `;

    if (!results || results.length === 0) {
      throw new NotFoundException('Event not found');
    }

    return results[0];
  }
}
