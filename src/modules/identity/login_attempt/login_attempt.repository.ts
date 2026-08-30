import { Injectable } from "@nestjs/common";
import { DbappService } from "src/core/database/dbapp/dbapp.service";

@Injectable()
export class LoginAttemptRepository {
    constructor(private readonly dbappService: DbappService) { }

    async findInternalIdByGuid(guid: string): Promise<number | null> {
        const loginAttempt = await this.dbappService.$queryRawUnsafe<Array<{ id: number }>>(
            `
            SELECT id FROM login_attempts
            WHERE guid = $1
            LIMIT 1
            `,
            guid,
        );
        return loginAttempt.length > 0 ? loginAttempt[0].id : null;
    }
}

