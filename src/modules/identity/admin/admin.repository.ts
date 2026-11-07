import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { DbappService } from "src/core/database/dbapp/dbapp.service";
import { AdminEntity } from "./entities/admin.entity";

@Injectable()
export class AdminRepository {
    constructor(private readonly dbappService: DbappService) { }

    async findByUserId(user_id: number): Promise<number | null> {
        const admins = await this.dbappService.$queryRaw<Array<{ id: number }>>`
            SELECT a.id
            FROM admins a
            WHERE a.user_id = ${user_id}
            LIMIT 1
    `;
        return admins.length > 0 ? admins[0].id : null;
    }

    async findInternalIdByGuid(guid: string): Promise<number | null> {
        const admins = await this.dbappService.$queryRaw<Array<{ id: number }>>`
            SELECT a.id
            FROM admins a
            WHERE a.guid = ${guid}
            LIMIT 1
        `;
        return admins.length > 0 ? admins[0].id : null;
    }



    async findByEmail(email: string): Promise<AdminEntity | null> {
        const admins = await this.dbappService.$queryRaw<any[]>`
      SELECT
        a.guid as id,
        a.is_active,
        a.metadata,
        a.created_at,
        a.updated_at,
        a.deleted_at
      FROM admins a
      INNER JOIN users u ON a.user_id = u.id
      WHERE u.email = ${email}
      LIMIT 1
    `;
        if (!admins || admins.length === 0) {
            return null;
        }

        return AdminEntity.fromDBApplication(admins[0]);
    }

}