import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { RoleEntity } from './entities/role.entity';
import { PAGINATION_LIMIT, PAGINATION_PAGE } from 'src/core/util/constant';
import { RoleRepository } from './role.repository';

@Injectable()
export class RoleService {
  constructor(private readonly dbapp: DbappService, private readonly roleRepository: RoleRepository) { }

  async create(createRoleDto: CreateRoleDto): Promise<RoleEntity> {
    const { name, description, is_active, metadata } = createRoleDto;

    const existingRole = await this.roleRepository.findInternalIdByName(name);
    if (existingRole) {
      throw new ConflictException('Role already exists with this name');
    }

    const metadataValue = metadata ? JSON.stringify(metadata) : null;

    const createdRoles = await this.dbapp.$queryRaw<any[]>`
      INSERT INTO roles (
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

    if (!createdRoles || createdRoles.length === 0) {
      throw new BadRequestException('Failed to create role');
    }

    return RoleEntity.fromDBApplication(createdRoles[0]);
  }

  async findAll(queryRoleDto: QueryRoleDto): Promise<{
    total: number;
    roles: RoleEntity[];
    page: number;
    limit: number;
  }> {
    const { name, is_active, page, limit } = queryRoleDto;

    const pageNum = Number(page || PAGINATION_PAGE);
    const limitNum = Number(limit || PAGINATION_LIMIT);
    const skip = (pageNum - PAGINATION_PAGE) * limitNum;
    const take = limitNum;

    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (name) {
      whereConditions.push(`LOWER(r.name) LIKE LOWER(CONCAT('%', $${paramIndex}, '%'))`);
      queryParams.push(name);
      paramIndex++;
    }

    if (is_active !== undefined) {
      whereConditions.push(`r.is_active = $${paramIndex}`);
      queryParams.push(is_active === 'true');
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const query = `
      SELECT
        r.guid as id,
        r.name,
        r.description,
        r.is_active,
        r.metadata,
        r.created_at,
        r.updated_at
      FROM roles r
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(take, skip);

    const countQuery = `
      SELECT COUNT(*)::int as total
      FROM roles r
      ${whereClause}
    `;

    const countParams = queryParams.slice(0, -2);

    const [totalResult, roles] = await Promise.all([
      this.dbapp.$queryRawUnsafe<any[]>(countQuery, ...countParams),
      this.dbapp.$queryRawUnsafe<any[]>(query, ...queryParams),
    ]);

    const total = totalResult[0]?.total || 0;

    return {
      total,
      roles: roles.map((role) => RoleEntity.fromDBApplication(role)),
      page: pageNum,
      limit: limitNum,
    };
  }

  async findOne(id: string): Promise<RoleEntity> {
    const role = await this.roleRepository.findOneByGuid(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleEntity> {
    const { name, description, is_active, metadata } = updateRoleDto;

    const existingRole = await this.dbapp.role.findUnique({
      where: { guid: id },
      select: { id: true, name: true },
    });

    if (!existingRole) {
      throw new NotFoundException('Role not found');
    }

    if (name && name !== existingRole.name) {
      const nameConflict = await this.dbapp.role.findUnique({
        where: { name },
        select: { id: true },
      });

      if (nameConflict) {
        throw new ConflictException('Role already exists with this name');
      }
    }

    const role = await this.dbapp.role.update({
      where: { guid: id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(is_active !== undefined && { is_active }),
        ...(metadata !== undefined && { metadata }),
      },
    });

    return RoleEntity.fromDBApplication(role);
  }

  async remove(id: string): Promise<RoleEntity> {
    const existingRole = await this.dbapp.role.findUnique({
      where: { guid: id },
      select: { id: true },
    });

    if (!existingRole) {
      throw new NotFoundException('Role not found');
    }

    const role = await this.dbapp.role.delete({
      where: { guid: id },
    });

    return RoleEntity.fromDBApplication(role);
  }
}
