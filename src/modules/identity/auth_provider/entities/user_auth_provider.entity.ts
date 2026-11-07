import { UserEntity } from "../../user/entities/user.entity";
import { AuthProviderEntity } from "./auth_provider.entity";

export class UserAuthProviderEntity {
    id: string;
    user_id: string;
    auth_provider_id: string;
    created_at?: Date;
    updated_at?: Date;
    auth_provider_name: string;
    auth_provider?: AuthProviderEntity;
    user?: UserEntity;

    static fromDBApplication(userAuthProvider: any): UserAuthProviderEntity {
        return {
            id: userAuthProvider.guid,
            user_id: userAuthProvider.user_id,
            auth_provider_id: userAuthProvider.auth_provider_id,
            created_at: userAuthProvider.created_at,
            updated_at: userAuthProvider.updated_at,
            auth_provider_name: userAuthProvider.name,
            auth_provider: userAuthProvider.auth_provider ? AuthProviderEntity.fromDBApplication(userAuthProvider.auth_provider) : undefined,
            user: userAuthProvider.user ? UserEntity.fromDBApplication(userAuthProvider.user) : undefined,
        };
    }
}

