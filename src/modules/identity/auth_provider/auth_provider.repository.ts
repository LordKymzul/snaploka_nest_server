import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { AuthProviderEntity } from './entities/auth_provider.entity';
import { Injectable, NotFoundException } from '@nestjs/common';

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
}
