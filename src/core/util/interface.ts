import { Request } from 'express';
import { AuthProviderEntity } from 'src/modules/identity/auth_provider/entities/auth_provider.entity';
import { RoleEntity } from 'src/modules/identity/role/entities/role.entity';



export interface UserPayload {
    id: string;
    email: string;
    created_at: Date;
    updated_at: Date;
    roles: RoleEntity[];
    auth_providers: AuthProviderEntity[];
}

export interface RequestWithUser extends Request {
    user: UserPayload;
}