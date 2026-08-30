import { Injectable } from "@nestjs/common";
import { DbappService } from "src/core/database/dbapp/dbapp.service";

@Injectable()
export class AdminRepository {
    constructor(private readonly dbappService: DbappService) { }

    async findByUserId(user_id: number): Promise<number | null> {
        const admin = await this.dbappService.$queryRawUnsafe<Array<{ id: number }>>(
            `
            SELECT id FROM admins
            WHERE user_id = $1
            LIMIT 1
            `,
            user_id,
        );
        return admin.length > 0 ? admin[0].id : null;
    }

    async findInternalIdByGuid(guid: string): Promise<number | null> {
        const admin = await this.dbappService.$queryRawUnsafe<Array<{ id: number }>>(
            `
            SELECT id FROM admins
            WHERE guid = $1
            LIMIT 1
            `,
            guid,
        );
        return admin.length > 0 ? admin[0].id : null;
    }
}