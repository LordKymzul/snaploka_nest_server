import { Injectable } from "@nestjs/common";
import { DbappService } from "src/core/database/dbapp/dbapp.service";

@Injectable()
export class LoginAttemptRepository {
    constructor(private readonly dbappService: DbappService) { }

    async findInternalIdByGuid(guid: string): Promise<number | null> {
        const loginAttempts = await this.dbappService.$queryRaw<Array<{ id: number }>>`
            SELECT la.id
            FROM login_attempts la
            WHERE la.guid = ${guid}
            LIMIT 1
        `;
        return loginAttempts.length > 0 ? loginAttempts[0].id : null;
    }
}

