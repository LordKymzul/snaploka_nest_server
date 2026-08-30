import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthProviderDto } from './dto/create-auth_provider.dto';
import { UpdateAuthProviderDto } from './dto/update-auth_provider.dto';
import { QueryAuthProviderDto } from './dto/query-auth_provider.dto';
import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { AuthProviderEntity } from './entities/auth_provider.entity';
import { PAGINATION_LIMIT, PAGINATION_PAGE } from 'src/core/util/constant';
import { AuthProviderRepository } from './auth_provider.repository';

@Injectable()
export class AuthProviderService {
  constructor(
    private readonly dbapp: DbappService,
    private readonly authProviderRepository: AuthProviderRepository,
  ) { }

  async create(createAuthProviderDto: CreateAuthProviderDto): Promise<AuthProviderEntity> {
    const { name, description, is_active, metadata } = createAuthProviderDto;

    const existingAuthProviders = await this.dbapp.$queryRaw<Array<{ id: number }>>`
      SELECT id FROM auth_provider
      WHERE name = ${name}
      LIMIT 1
    `;

    if (existingAuthProviders.length > 0) {
      throw new ConflictException('Auth provider already exists with this name');
    }

    const metadataValue = metadata ? JSON.stringify(metadata) : null;

    const createdAuthProviders = await this.dbapp.$queryRaw<any[]>`
      INSERT INTO auth_providers (
        name,
        description,
        is_active,
        metadata
      )
      VALUES (
        ${name},
        ${description ?? null},
        ${is_active ?? true},
        ${metadataValue}::jsonb
      )
      RETURNING
        guid as id,
        name,
        description,
        is_active,
        metadata,
        created_at,
        updated_at
    `;

    if (!createdAuthProviders || createdAuthProviders.length === 0) {
      throw new BadRequestException('Failed to create auth provider');
    }

    return AuthProviderEntity.fromDBApplication(createdAuthProviders[0]);
  }

  async findAll(queryAuthProviderDto: QueryAuthProviderDto): Promise<{
    total: number;
    authProviders: AuthProviderEntity[];
    page: number;
    limit: number;
  }> {
    const { name, is_active, page, limit } = queryAuthProviderDto;

    const pageNum = Number(page || PAGINATION_PAGE);
    const limitNum = Number(limit || PAGINATION_LIMIT);
    const skip = (pageNum - PAGINATION_PAGE) * limitNum;
    const take = limitNum;

    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (name) {
      whereConditions.push(`LOWER(ap.name) LIKE LOWER(CONCAT('%', $${paramIndex}, '%'))`);
      queryParams.push(name);
      paramIndex++;
    }

    if (is_active !== undefined) {
      whereConditions.push(`ap.is_active = $${paramIndex}`);
      queryParams.push(is_active === 'true');
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const query = `
      SELECT
        ap.guid as id,
        ap.name,
        ap.description,
        ap.is_active,
        ap.metadata,
        ap.created_at,
        ap.updated_at
      FROM auth_providers ap
      ${whereClause}
      ORDER BY ap.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(take, skip);

    const countQuery = `
      SELECT COUNT(*)::int as total
      FROM auth_providers ap
      ${whereClause}
    `;

    const countParams = queryParams.slice(0, -2);

    const [totalResult, authProviders] = await Promise.all([
      this.dbapp.$queryRawUnsafe<any[]>(countQuery, ...countParams),
      this.dbapp.$queryRawUnsafe<any[]>(query, ...queryParams),
    ]);

    const total = totalResult[0]?.total || 0;

    return {
      total,
      authProviders: authProviders.map((authProvider) =>
        AuthProviderEntity.fromDBApplication(authProvider),
      ),
      page: pageNum,
      limit: limitNum,
    };
  }

  async findOne(id: string): Promise<AuthProviderEntity> {
    const authProvider = await this.authProviderRepository.findOneByGuid(id);
    if (!authProvider) {
      throw new NotFoundException('Auth provider not found');
    }

    return authProvider;
  }

  async update(id: string, updateAuthProviderDto: UpdateAuthProviderDto): Promise<AuthProviderEntity> {
    const { name, description, is_active, metadata } = updateAuthProviderDto;

    const existingAuthProvider = await this.dbapp.authProvider.findUnique({
      where: { guid: id },
      select: { id: true, name: true },
    });

    if (!existingAuthProvider) {
      throw new NotFoundException('Auth provider not found');
    }

    if (name && name !== existingAuthProvider.name) {
      const nameConflict = await this.dbapp.authProvider.findUnique({
        where: { name },
        select: { id: true },
      });

      if (nameConflict) {
        throw new ConflictException('Auth provider already exists with this name');
      }
    }

    const authProvider = await this.dbapp.authProvider.update({
      where: { guid: id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(is_active !== undefined && { is_active }),
        ...(metadata !== undefined && { metadata }),
      },
    });

    return AuthProviderEntity.fromDBApplication(authProvider);
  }

  async remove(id: string): Promise<AuthProviderEntity> {
    const existingAuthProvider = await this.dbapp.authProvider.findUnique({
      where: { guid: id },
      select: { id: true },
    });

    if (!existingAuthProvider) {
      throw new NotFoundException('Auth provider not found');
    }

    const authProvider = await this.dbapp.authProvider.delete({
      where: { guid: id },
    });

    return AuthProviderEntity.fromDBApplication(authProvider);
  }
}
