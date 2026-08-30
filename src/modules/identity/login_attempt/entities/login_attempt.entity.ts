import { UserEntity } from "../../user/entities/user.entity";

export class LoginAttemptEntity {
    id: string;
    email_attempted: string;
    user_id?: string;
    is_success: boolean;
    failure_reason?: string;
    ip_address: string;
    user_agent?: string;
    metadata?: Record<string, any>;
    created_at: Date;
    user?: UserEntity;

    static fromDBApplication(loginAttempt: any): LoginAttemptEntity {
        return {
            id: loginAttempt.guid ?? loginAttempt.id,
            email_attempted: loginAttempt.email_attempted,
            user_id: loginAttempt.user_id ?? loginAttempt.user?.guid ?? loginAttempt.user_guid,
            is_success: loginAttempt.is_success,
            failure_reason: loginAttempt.failure_reason,
            ip_address: loginAttempt.ip_address,
            user_agent: loginAttempt.user_agent,
            metadata: loginAttempt.metadata,
            created_at: loginAttempt.created_at,
            user: loginAttempt.user ? UserEntity.fromDBApplication({
                id: loginAttempt.user.guid ?? loginAttempt.user.id,
                name: loginAttempt.user.name,
                email: loginAttempt.user.email,
                created_at: loginAttempt.user.created_at,
                updated_at: loginAttempt.user.updated_at,
            }) : undefined,
        };
    }
}
