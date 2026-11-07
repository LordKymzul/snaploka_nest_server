export class EventPackageSimpleEntity {
    id: string
    name: string
    description?: string
    price: number
    currency: string
    max_media_count: number
    max_media_size: number
    metadata: Record<string, any>


    static fromDBApplication(eventPackage: any): EventPackageSimpleEntity {
        const toNumberIfBigInt = (value: any) => typeof value === 'bigint' ? Number(value) : value;
        return {
            id: eventPackage.guid ?? eventPackage.id,
            name: eventPackage.name,
            description: eventPackage.description,
            price: toNumberIfBigInt(eventPackage.price),
            currency: eventPackage.currency,
            max_media_count: toNumberIfBigInt(eventPackage.max_media_count),
            max_media_size: toNumberIfBigInt(eventPackage.max_media_size),
            metadata: eventPackage.metadata ?? {},
        };
    }
}