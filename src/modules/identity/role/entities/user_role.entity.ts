import { UserEntity } from "../../user/entities/user.entity";
import { RoleEntity } from "./role.entity";

export class UserRoleEntity {
    id: string;
    user_id: string;
    role_id: string;
    created_at?: Date;
    updated_at?: Date;
    role_name: string;
    role?: RoleEntity;
    user?: UserEntity;

    static fromDBApplication(userRole: any): UserRoleEntity {
        return {
            id: userRole.guid,
            user_id: userRole.user_id,
            role_id: userRole.role_id,
            created_at: userRole.created_at,
            updated_at: userRole.updated_at,
            role_name: userRole.role_name,
            role: userRole.role ? RoleEntity.fromDBApplication(userRole.role) : undefined,
            user: userRole.user ? UserEntity.fromDBApplication(userRole.user) : undefined,
        };
    }
}