import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { UserRepository } from 'src/modules/identity/user/user.repository';
import { EventPackageRepository } from '../event_package/event_package.repository';
import { EventRepository } from 'src/modules/engagement/event/event.repository';
import { OrderEntity } from './entities/order.entity';
import { OrderRepository } from './order.repository';
import { EVENT_STATUS, ORDER_STATUS, PAGINATION_LIMIT, PAGINATION_PAGE } from 'src/core/util/constant';
import { EventPackageEntity } from '../event_package/entities/event_package.entity';

@Injectable()
export class OrderService {

  private readonly logger = new Logger
    (OrderService.name);

  constructor(
    private readonly dbapp: DbappService,
    private readonly userRepository: UserRepository,
    private readonly eventPackageRepository: EventPackageRepository,
    private readonly eventRepository: EventRepository,
    private readonly orderRepository: OrderRepository,
  ) { }

  async create(createOrderDto: CreateOrderDto, user_id: string): Promise<OrderEntity> {
    const {
      package_id,
      event_id,
      package_name,
      amount,
      currency,
      max_media_allowed,
      max_storage_bytes,
      payment_provider,
      provider_order_id,
      provider_payment_id,
      metadata,
      paid_at,
      status,
    } = createOrderDto;

    if (status === ORDER_STATUS.PAID && !event_id) {
      throw new BadRequestException('Event ID is required when status is paid');
    }

    const userInternalId = await this.userRepository.findInternalIdByGuid(user_id);
    const existingPackage = await this.eventPackageRepository.findOneByGuid(package_id);
    const packageInternalId = await this.eventPackageRepository.findInternalIdByGuid(package_id);

    let eventInternalId: number | null = null;
    if (event_id) {
      eventInternalId = await this.eventRepository.findInternalIdByGuid(event_id);
      const existingOrder = await this.orderRepository.findOneByEventId(eventInternalId);
      if (existingOrder) {
        this.logger.warn(`An order already exists for event: ${event_id}`, { existingOrder });
        if (existingOrder.status === ORDER_STATUS.PAID) {
          throw new ConflictException('An order already exists for this event and is already paid');
        }
        await this.update(existingOrder.id, {
          package_id,
          amount: existingPackage.price,
          currency: existingPackage.currency,
          max_media_allowed: existingPackage.max_media_count,
          max_storage_bytes: existingPackage.max_media_size,
          payment_provider: payment_provider,
          status: ORDER_STATUS.PENDING,
          package_name: existingPackage.name,
          metadata: {
            event_id: event_id,
            package_id: package_id,
          }
        });
        return existingOrder;
      }
    }

    const metadataValue = metadata ? JSON.stringify(metadata) : null;
    const paidAtValue = paid_at ? new Date(paid_at) : null;

    if (paidAtValue && Number.isNaN(paidAtValue.getTime())) {
      throw new BadRequestException('Invalid paid_at');
    }

    const finalStatus = status;
    const finalPaidAt =
      finalStatus === ORDER_STATUS.PAID
        ? (paidAtValue ?? new Date())
        : null;

    return this.dbapp.$transaction(async (tx) => {
      const created = await tx.$queryRaw<any[]>`
      INSERT INTO orders (
        user_id,
        package_id,
        event_id,
        package_name,
        amount,
        currency,
        max_media_allowed,
        max_storage_bytes,
        payment_provider,
        provider_order_id,
        provider_payment_id,
        metadata,
        status,
        paid_at
      )
      VALUES (
        ${userInternalId},
        ${packageInternalId},
        ${eventInternalId},
        ${package_name ?? existingPackage.name},
        ${amount},
        ${currency ?? existingPackage.currency ?? 'USD'},
        ${max_media_allowed},
        ${max_storage_bytes},
        ${payment_provider},
        ${provider_order_id ?? null},
        ${provider_payment_id ?? null},
        ${metadataValue}::jsonb,
        ${finalStatus},
        ${finalPaidAt}
      )
      RETURNING
        guid as id
    `;

      if (!created || created.length === 0) {
        throw new BadRequestException('Failed to create order');
      }

      if (status === ORDER_STATUS.PAID && eventInternalId) {
        const updatedEvent = await tx.$queryRaw<Array<{ id: number }>>`
        UPDATE events SET status = ${EVENT_STATUS.ACTIVE}, updated_at = now() WHERE id = ${eventInternalId}
        RETURNING id
      `;
        if (!updatedEvent || updatedEvent.length === 0) {
          throw new BadRequestException('Failed to update event');
        }
      }
      return OrderEntity.fromDBApplication(created[0]);
    });
  }

  async findAll(queryOrderDto: QueryOrderDto, user_id?: string): Promise<{
    total: number;
    orders: OrderEntity[];
    page: number;
    limit: number;
  }> {
    const { status, payment_provider, keyword, page, limit } = queryOrderDto;

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

    if (status) {
      whereConditions.push(`o.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (payment_provider) {
      whereConditions.push(`o.payment_provider = $${paramIndex}`);
      queryParams.push(payment_provider);
      paramIndex++;
    }

    if (keyword) {
      whereConditions.push(`LOWER(o.package_name) LIKE LOWER(CONCAT('%', $${paramIndex}, '%'))`);
      queryParams.push(keyword);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const query = `
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
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(take, skip);

    const countQuery = `
      SELECT COUNT(*)::int as total
      FROM orders o
      INNER JOIN users u ON u.id = o.user_id
      LEFT JOIN event_packages ep ON ep.id = o.package_id
      LEFT JOIN events e ON e.id = o.event_id
      ${whereClause}
    `;

    const countParams = queryParams.slice(0, -2);

    const [totalResult, orders] = await Promise.all([
      this.dbapp.$queryRawUnsafe<any[]>(countQuery, ...countParams),
      this.dbapp.$queryRawUnsafe<any[]>(query, ...queryParams),
    ]);

    const total = totalResult[0]?.total || 0;

    return {
      total,
      orders: orders.map((order) => OrderEntity.fromDBApplication(order)),
      page: pageNum,
      limit: limitNum,
    };
  }

  async findAllByUser(queryOrderDto: QueryOrderDto, user_id: string): Promise<{
    total: number;
    orders: OrderEntity[];
    page: number;
    limit: number;
  }> {
    return this.findAll(queryOrderDto, user_id);
  }

  async findOne(id: string): Promise<OrderEntity> {
    return this.orderRepository.findOneByGuid(id);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderEntity> {
    const {
      package_name,
      amount,
      currency,
      max_media_allowed,
      max_storage_bytes,
      status,
      payment_provider,
      provider_order_id,
      provider_payment_id,
      metadata,
      paid_at,
      payment_url,
      package_id,
    } = updateOrderDto;

    await this.orderRepository.findOneByGuid(id);

    const paidAtValue = paid_at !== undefined
      ? (paid_at ? new Date(paid_at) : null)
      : undefined;

    if (paidAtValue && Number.isNaN(paidAtValue.getTime())) {
      throw new BadRequestException('Invalid paid_at');
    }

    let packageInternalId: number | null = null;
    let existingPackage: EventPackageEntity | null = null;
    if (package_id !== undefined) {
      packageInternalId = await this.eventPackageRepository.findInternalIdByGuid(package_id);
      if (!packageInternalId) {
        throw new BadRequestException('Invalid package ID');
      }
      existingPackage = await this.eventPackageRepository.findOneByGuid(package_id);
    }

    await this.dbapp.order.update({
      where: { guid: id },
      data: {
        ...(package_id !== undefined && { package_id: packageInternalId }),
        ...(package_name !== undefined && { package_name: package_name ?? existingPackage?.name }),
        ...(amount !== undefined && { amount }),
        ...(currency !== undefined && { currency: currency ?? existingPackage?.currency }),
        ...(max_media_allowed !== undefined && { max_media_allowed }),
        ...(max_storage_bytes !== undefined && { max_storage_bytes }),
        ...(status !== undefined && { status }),
        ...(payment_provider !== undefined && { payment_provider }),
        ...(provider_order_id !== undefined && { provider_order_id }),
        ...(provider_payment_id !== undefined && { provider_payment_id }),
        ...(metadata !== undefined && { metadata }),
        ...(paidAtValue !== undefined && { paid_at: paidAtValue }),
        ...(payment_url !== undefined && { payment_url }),
      },
    });

    return this.orderRepository.findOneByGuid(id);
  }

  async remove(id: string): Promise<OrderEntity> {
    const existing = await this.dbapp.order.findUnique({
      where: { guid: id },
      select: { id: true, guid: true },
    });

    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    await this.dbapp.order.delete({
      where: { guid: id },
    });

    return OrderEntity.fromDBApplication({
      id: existing.guid,
    });
  }

  async markAsPaid(
    id: string,
    event_id: string,
    provider_payment_id?: string,
  ): Promise<OrderEntity> {
    await this.dbapp.$transaction(async (tx) => {
      const paid = await tx.$queryRaw<Array<{ id: string }>>`
        WITH paid_order AS (
          UPDATE orders o
          SET
            status = ${ORDER_STATUS.PAID},
            paid_at = COALESCE(o.paid_at, now()),
            provider_payment_id = COALESCE(${provider_payment_id ?? null}, o.provider_payment_id),
            updated_at = now()
          FROM events e
          WHERE o.guid = ${id}
            AND e.guid = ${event_id}
            AND o.event_id = e.id
            AND o.status = ${ORDER_STATUS.PENDING}
          RETURNING o.guid, o.event_id, o.max_media_allowed, o.max_storage_bytes
        ),
        activated_event AS (
          UPDATE events e
          SET
            status = ${EVENT_STATUS.ACTIVE},
            max_media_allowed = po.max_media_allowed,
            max_storage_bytes = po.max_storage_bytes,
            updated_at = now()
          FROM paid_order po
          WHERE e.id = po.event_id
          RETURNING e.id
        )
        SELECT guid as id FROM paid_order
      `;

      if (paid.length > 0) {
        return;
      }
    });

    return this.orderRepository.findOneByGuid(id);
  }
}
