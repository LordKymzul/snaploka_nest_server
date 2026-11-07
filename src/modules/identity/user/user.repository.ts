import { Injectable, NotFoundException } from '@nestjs/common';
import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(private readonly dbappService: DbappService) { }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const users = await this.dbappService.$queryRaw<any[]>`
      SELECT
        u.guid as id,
        u.email,
        u.name,
        u.is_active,
        u.metadata,
        u.last_signed_at,
        u.created_at,
        u.updated_at,
        u.id as internal_id
      FROM users u
      WHERE u.email = ${email}
      LIMIT 1
    `;

    if (!users || users.length === 0) {
      return null;
    }

    return UserEntity.fromDBApplication(users[0]);
  }

  async findByGuid(guid: string): Promise<UserEntity> {
    const users = await this.dbappService.$queryRaw<any[]>`
      SELECT
        u.guid as id,
        u.email,
        u.name,
        u.is_active,
        u.metadata,
        u.last_signed_at,
        u.created_at,
        u.updated_at,
        u.id as internal_id
      FROM users u
      WHERE u.guid = ${guid}
      LIMIT 1
    `;

    if (!users || users.length === 0) {
      throw new NotFoundException('User not found');
    }

    return UserEntity.fromDBApplication(users[0]);
  }

  async findInternalIdByGuid(guid: string): Promise<number> {
    const users = await this.dbappService.$queryRaw<Array<{ id: number }>>`
      SELECT u.id
      FROM users u
      WHERE u.guid = ${guid}
      LIMIT 1
    `;

    if (!users || users.length === 0) {
      throw new NotFoundException('User not found');
    }

    return users[0].id;
  }
}
