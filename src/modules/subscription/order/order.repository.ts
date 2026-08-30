import { Injectable, NotFoundException } from '@nestjs/common';
import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { OrderEntity } from './entities/order.entity';

@Injectable()
export class OrderRepository {
  constructor(private readonly dbapp: DbappService) { }


  async findOneByGuid(guid: string): Promise<OrderEntity> {
    const results = await this.dbapp.$queryRaw<any[]>`
      SELECT
        o.guid as id,
        u.guid as user_id,
        ep.guid as package_id,
        e.guid as event_id,
        o.package_name,
        o.amount,
        o.currency,
        o.max_media_allowed,
        o.max_storage_bytes,
        o.status,
        o.payment_provider,
        o.provider_order_id,
        o.provider_payment_id,
        o.payment_url,
        o.metadata,
        o.paid_at,
        o.created_at,
        o.updated_at
      FROM orders o
      INNER JOIN users u ON u.id = o.user_id
      LEFT JOIN event_packages ep ON ep.id = o.package_id
      LEFT JOIN events e ON e.id = o.event_id
      WHERE o.guid = ${guid}
      LIMIT 1
    `;

    if (!results || results.length === 0) {
      throw new NotFoundException('Order not found');
    }

    return OrderEntity.fromDBApplication(results[0]);
  }

  async findOneByEventId(eventId: number): Promise<OrderEntity | null> {
    const results = await this.dbapp.$queryRaw<any[]>`
      SELECT
        o.guid as id,
        u.guid as user_id,
        ep.guid as package_id,
        e.guid as event_id,
        o.package_name,
        o.amount,
        o.currency,
        o.max_media_allowed,
        o.max_storage_bytes,
        o.status,
        o.payment_provider,
        o.provider_order_id,
        o.provider_payment_id,
        o.payment_url,
        o.metadata,
        o.paid_at,
        o.created_at,
        o.updated_at
      FROM orders o
      INNER JOIN users u ON u.id = o.user_id
      LEFT JOIN event_packages ep ON ep.id = o.package_id
      LEFT JOIN events e ON e.id = o.event_id
      WHERE o.event_id = ${eventId}
      LIMIT 1
    `;

    if (!results || results.length === 0) {
      return null;
    }

    return OrderEntity.fromDBApplication(results[0]);
  }

  async findInternalIdByGuid(guid: string): Promise<number> {
    const results = await this.dbapp.$queryRaw<Array<{ id: number }>>`
      SELECT o.id
      FROM orders o
      WHERE o.guid = ${guid}
      LIMIT 1
    `;

    if (!results || results.length === 0) {
      throw new NotFoundException('Order not found');
    }

    return results[0].id;
  }

  async findInternalIdByEventId(eventId: number): Promise<number | null> {
    const results = await this.dbapp.$queryRaw<Array<{ id: number }>>`
      SELECT o.id
      FROM orders o
      WHERE o.event_id = ${eventId}
      LIMIT 1
    `;
    if (!results || results.length === 0) {
      return null;
    }

    return results[0].id;
  }

  async findGuidByEventId(eventId: number): Promise<string | null> {
    const results = await this.dbapp.$queryRaw<Array<{ guid: string }>>`
      SELECT o.guid
      FROM orders o
      WHERE o.event_id = ${eventId}
      LIMIT 1
    `;
    if (!results || results.length === 0) {
      return null;
    }
    return results[0].guid;
  }
}
