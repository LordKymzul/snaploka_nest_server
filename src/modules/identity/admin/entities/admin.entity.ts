export class Admin {
    id: string;
    user_id: number;
    is_active: boolean;
    metadata: Record<string, any>;
    created_at: Date;
    updated_at: Date;

    static fromDBApplication(data: any): Admin {
        return {
            id: data.id,
            user_id: data.user_id,
            is_active: data.is_active,
            metadata: data.metadata,
            created_at: data.created_at,
            updated_at: data.updated_at,
        };
    }
}
