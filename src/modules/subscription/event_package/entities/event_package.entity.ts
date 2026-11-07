export class EventPackageEntity {
    id: string
    name: string
    description?: string
    price: number
    currency: string
    max_media_count: number
    max_media_size: number
    is_active: boolean
    metadata: Record<string, any>
    created_at: Date
    updated_at: Date
    deleted_at?: Date

    static fromDBApplication(eventPackage: any): EventPackageEntity {
        const toNumberIfBigInt = (value: any) => typeof value === 'bigint' ? Number(value) : value;

        return {
            id: eventPackage.guid ?? eventPackage.id,
            name: eventPackage.name,
            description: eventPackage.description,
            price: toNumberIfBigInt(eventPackage.price),
            currency: eventPackage.currency,
            max_media_count: toNumberIfBigInt(eventPackage.max_media_count),
            max_media_size: toNumberIfBigInt(eventPackage.max_media_size),
            is_active: eventPackage.is_active,
            metadata: eventPackage.metadata ?? {},
            created_at: eventPackage.created_at,
            updated_at: eventPackage.updated_at,
            deleted_at: eventPackage.deleted_at,
        };
    }

   
}
