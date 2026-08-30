export class AuthProviderEntity {
    id: string;
    name: string;
    description?: string;
    is_active: boolean;
    metadata: Record<string, any>;
    created_at: Date;
    updated_at: Date;

    static fromDBApplication(authProvider: any): AuthProviderEntity {
        return {
            id: authProvider.guid ?? authProvider.id,
            name: authProvider.name,
            description: authProvider.description,
            is_active: authProvider.is_active,
            metadata: authProvider.metadata ?? {},
            created_at: authProvider.created_at,
            updated_at: authProvider.updated_at,
        };
    }
}
