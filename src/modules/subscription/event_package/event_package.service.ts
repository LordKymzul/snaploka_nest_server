import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventPackageDto } from './dto/create-event_package.dto';
import { UpdateEventPackageDto } from './dto/update-event_package.dto';
import { QueryEventPackageDto } from './dto/query-event_package.dto';
import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { EventPackageEntity } from './entities/event_package.entity';
import { PAGINATION_LIMIT, PAGINATION_PAGE } from 'src/core/util/constant';
import { EventPackageRepository } from './event_package.repository';

@Injectable()
export class EventPackageService {
  constructor(
    private readonly dbapp: DbappService,
    private readonly eventPackageRepository: EventPackageRepository,
  ) { }

  async create(createEventPackageDto: CreateEventPackageDto): Promise<EventPackageEntity> {
    const { name, description, price, currency, max_media_count, max_media_size, is_active, metadata } = createEventPackageDto;

    const existing = await this.eventPackageRepository.findInternalIdByName(name);
    if (existing) {
      throw new ConflictException('Event package already exists with this name');
    }

    const metadataValue = metadata ? JSON.stringify(metadata) : null;

    const created = await this.dbapp.$queryRaw<any[]>`
      INSERT INTO event_packages (
        name,
        description,
        price,
        currency,
        max_media_count,
        max_media_size,
        is_active,
        metadata
      )
      VALUES (
        ${name},
        ${description ?? null},
        ${price},
        ${currency ?? 'USD'},
        ${max_media_count},
        ${max_media_size},
        ${is_active ?? true},
        ${metadataValue}::jsonb
      )
      RETURNING
        guid as id
    `;

    if (!created || created.length === 0) {
      throw new BadRequestException('Failed to create event package');
    }

    return EventPackageEntity.fromDBApplication(created[0]);
  }

  async findAll(queryEventPackageDto: QueryEventPackageDto): Promise<{
    total: number;
    eventPackages: EventPackageEntity[];
    page: number;
    limit: number;
  }> {
    const { keyword, page, limit, is_active } = queryEventPackageDto;

    const pageNum = Number(page || PAGINATION_PAGE);
    const limitNum = Number(limit || PAGINATION_LIMIT);
    const skip = (pageNum - PAGINATION_PAGE) * limitNum;
    const take = limitNum;

    const whereConditions: string[] = ['ep.deleted_at IS NULL'];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (keyword) {
      whereConditions.push(`LOWER(ep.name) LIKE LOWER(CONCAT('%', $${paramIndex}, '%'))`);
      queryParams.push(keyword);
      paramIndex++;
    }

    if (is_active !== undefined) {
      whereConditions.push(`ep.is_active = $${paramIndex}`);
      queryParams.push(is_active === 'true');
      paramIndex++;
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const query = `
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
      ${whereClause}
      ORDER BY ep.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(take, skip);

    const countQuery = `
      SELECT COUNT(*)::int as total
      FROM event_packages ep
      ${whereClause}
    `;

    const countParams = queryParams.slice(0, -2);

    const [totalResult, eventPackages] = await Promise.all([
      this.dbapp.$queryRawUnsafe<any[]>(countQuery, ...countParams),
      this.dbapp.$queryRawUnsafe<any[]>(query, ...queryParams),
    ]);

    const total = totalResult[0]?.total || 0;

    return {
      total,
      eventPackages: eventPackages.map((ep) =>
        EventPackageEntity.fromDBApplication(ep),
      ),
      page: pageNum,
      limit: limitNum,
    };
  }

  async findOne(id: string): Promise<EventPackageEntity> {
    return this.eventPackageRepository.findOneByGuid(id);
  }

  async update(id: string, updateEventPackageDto: UpdateEventPackageDto): Promise<EventPackageEntity> {
    const { name, description, price, currency, max_media_count, max_media_size, is_active, metadata } = updateEventPackageDto;

    const existing = await this.eventPackageRepository.findOneByGuid(id);

    if (name && name !== existing.name) {
      const nameConflict = await this.eventPackageRepository.findInternalIdByName(name);
      if (nameConflict) {
        throw new ConflictException('Event package already exists with this name');
      }
    }

    const eventPackage = await this.dbapp.eventPackage.update({
      where: { guid: id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(currency !== undefined && { currency }),
        ...(max_media_count !== undefined && { max_media_count }),
        ...(max_media_size !== undefined && { max_media_size }),
        ...(is_active !== undefined && { is_active }),
        ...(metadata !== undefined && { metadata }),
      },
    });

    return EventPackageEntity.fromDBApplication(eventPackage);
  }

  async remove(id: string): Promise<EventPackageEntity> {
    const existing = await this.dbapp.eventPackage.findUnique({
      where: { guid: id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Event package not found');
    }

    const eventPackage = await this.dbapp.eventPackage.update({
      where: { guid: id },
      data: {
        deleted_at: new Date(),
        is_active: false,
      },
    });

    return EventPackageEntity.fromDBApplication({
      id: eventPackage.guid,
    });
  }
}
