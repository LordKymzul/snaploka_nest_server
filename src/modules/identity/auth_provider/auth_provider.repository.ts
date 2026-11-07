import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { AuthProviderEntity } from './entities/auth_provider.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserAuthProviderEntity } from './entities/user_auth_provider.entity';

@Injectable()
export class AuthProviderRepository {
  constructor(private readonly dbapp: DbappService) { }


  async findInternalIdByName(name: string): Promise<number> {
    const authProviders = await this.dbapp.$queryRaw<any[]>`
      SELECT id FROM auth_providers WHERE name = ${name} LIMIT 1
    `;
    if (!authProviders || authProviders.length === 0) {
      throw new NotFoundException('Auth provider not found');
    }

    return authProviders[0].id;
  }

  async findOneByGuid(guid: string): Promise<AuthProviderEntity> {
    const authProviders = await this.dbapp.$queryRaw<any[]>`
      SELECT
        ap.guid as id,
        ap.name,
        ap.description,
        ap.is_active,
        ap.metadata,
        ap.created_at,
        ap.updated_at
      FROM auth_providers ap
      WHERE ap.guid = ${guid}
      LIMIT 1
    `;

    if (!authProviders || authProviders.length === 0) {
      throw new NotFoundException('Auth provider not found');
    }

    return AuthProviderEntity.fromDBApplication(authProviders[0]);
  }

  async isExistsByUserInternalIdAndAuthProviderName(userId: number, authProviderName: string): Promise<boolean> {
    const authProvider = await this.dbapp.$queryRaw<any[]>`
      SELECT id FROM auth_providers WHERE name = ${authProviderName} LIMIT 1
    `;
    if (!authProvider || authProvider.length === 0) {
      return false;
    }
    const authProviderId = authProvider[0].id;

    const result = await this.dbapp.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*)::int as count FROM user_auth_providers WHERE user_id = ${userId} AND auth_provider_id = ${authProviderId}
    `;
    return (result[0]?.count ?? 0) > 0;
  }

  async findAllWithUserByUserInternalIds(userIds: number[]): Promise<UserAuthProviderEntity[]> {
    if (!userIds || userIds.length === 0) {
      return [];
    }
    const authProviderRows = await this.dbapp.$queryRaw<any[]>`
      SELECT
        uap.guid as id,
        ap.name,
        ap.guid as auth_provider_guid,
        u.guid as user_guid
      FROM user_auth_providers uap
      INNER JOIN auth_providers ap ON uap.auth_provider_id = ap.id
      INNER JOIN users u ON uap.user_id = u.id
      WHERE uap.user_id IN (${Prisma.join(userIds)})
    `;
    return authProviderRows.map(row => ({
      id: row.id,
      user_id: row.user_guid,
      auth_provider_id: row.auth_provider_guid,
      auth_provider_name: row.name,
    }));
  }
}
