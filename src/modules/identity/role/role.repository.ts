import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { QueryRoleDto } from './dto/query-role.dto';
import { RoleEntity } from './entities/role.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserRoleEntity } from './entities/user_role.entity';

@Injectable()
export class RoleRepository {
  constructor(private readonly dbapp: DbappService) { }


  async findInternalIdByName(name: string): Promise<number> {
    const roles = await this.dbapp.$queryRaw<Array<{ id: number }>>`
      SELECT id FROM roles WHERE name = ${name} LIMIT 1
    `;
    if (!roles || roles.length === 0) {
      throw new NotFoundException('Role not found');
    }
    return roles[0].id;
  }

  async findOneByGuid(guid: string): Promise<RoleEntity> {
    const roles = await this.dbapp.$queryRaw<any[]>`
      SELECT
        r.guid as id,
        r.name,
        r.description,
        r.is_active,
        r.metadata,
        r.created_at,
        r.updated_at
      FROM roles r
      WHERE r.guid = ${guid}
      LIMIT 1
    `;

    if (!roles || roles.length === 0) {
      throw new NotFoundException('Role not found');
    }

    return RoleEntity.fromDBApplication(roles[0]);
  }

  async findAllWithUserByUserInternalIds(userIds: number[]): Promise<UserRoleEntity[]> {
    if (!userIds || userIds.length === 0) {
      return [];
    }
    const roleRows = await this.dbapp.$queryRaw<any[]>`
      SELECT
        ur.guid as id,
        r.name,
        r.guid as role_guid,
        u.guid as user_guid
      FROM user_roles ur
      INNER JOIN roles r ON ur.role_id = r.id
      INNER JOIN users u ON ur.user_id = u.id
      WHERE ur.user_id IN (${Prisma.join(userIds)})
    `;
    return roleRows.map(row => ({
      id: row.id,
      user_id: row.user_guid,
      role_id: row.role_guid,
      role_name: row.name,
    }));

  }
}

