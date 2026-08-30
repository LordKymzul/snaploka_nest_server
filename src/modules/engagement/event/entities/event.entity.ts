import { EVENT_STATUS, EVENT_TYPE } from 'src/core/util/constant';

export class EventEntity {
    id: string;
    name: string;
    description?: string;
    status: EVENT_STATUS;
    type: EVENT_TYPE;
    start_date: Date;
    end_date: Date;
    max_media_allowed?: number;
    max_storage_bytes?: number;
    current_media_count: number;
    current_storage_bytes: number;
    user_id: string;
    metadata?: Record<string, any>;
    created_at: Date;
    updated_at: Date;

    static fromDBApplication(event: any): EventEntity {
        const toNumberIfBigInt = (value: any) => typeof value === 'bigint' ? Number(value) : value;

        return {
            id: event.guid ?? event.id,
            name: event.name,
            description: event.description,
            status: event.status,
            type: event.type,
            start_date: event.start_date,
            end_date: event.end_date,
            max_media_allowed: toNumberIfBigInt(event.max_media_allowed),
            max_storage_bytes: toNumberIfBigInt(event.max_storage_bytes),
            current_media_count: toNumberIfBigInt(event.current_media_count),
            current_storage_bytes: toNumberIfBigInt(event.current_storage_bytes),
            user_id: event.user_guid ?? event.user_id,
            metadata: event.metadata ?? {},
            created_at: event.created_at,
            updated_at: event.updated_at,
        };
    }
}
