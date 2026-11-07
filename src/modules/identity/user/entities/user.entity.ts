import { AuthProviderEntity } from "../../auth_provider/entities/auth_provider.entity";
import { RoleEntity } from "../../role/entities/role.entity";

export class UserEntity {
    id: string;
    email: string;
    password?: string;
    name?: string;
    is_active: boolean;
    metadata: Record<string, any>;
    last_signed_at?: Date;
    created_at: Date;
    updated_at: Date;

    roles: RoleEntity[];
    auth_providers: AuthProviderEntity[];
    internal_id: number;

    static fromDBApplication(dbApp: any): UserEntity {
        return {
            id: dbApp.guid ?? dbApp.id,
            email: dbApp.email,
            password: dbApp.password ?? undefined,
            name: dbApp.name,
            is_active: dbApp.is_active,
            metadata: dbApp.metadata ?? {},
            last_signed_at: dbApp.last_signed_at,
            created_at: dbApp.created_at,
            updated_at: dbApp.updated_at,
            roles: dbApp.roles ? dbApp.roles.map((r: any) => RoleEntity.fromDBApplication(r)) : [],
            auth_providers: dbApp.auth_providers ? dbApp.auth_providers.map((ap: any) => AuthProviderEntity.fromDBApplication(ap)) : [],
            internal_id: dbApp.internal_id,
        };
    }
}
