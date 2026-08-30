import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { QueryRoleDto } from './dto/query-role.dto';
import { RoleEntity } from './entities/role.entity';
import { Injectable, NotFoundException } from '@nestjs/common';

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
}