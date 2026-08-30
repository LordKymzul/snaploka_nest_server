export class RoleEntity {
    id: string;
    name: string;
    description?: string;
    is_active: boolean;
    metadata: Record<string, any>;
    created_at: Date;
    updated_at: Date;

    static fromDBApplication(role: any): RoleEntity {
        return {
            id: role.guid ?? role.id,
            name: role.name,
            description: role.description,
            is_active: role.is_active,
            metadata: role.metadata ?? {},
            created_at: role.created_at,
            updated_at: role.updated_at,
        };
    }
}
