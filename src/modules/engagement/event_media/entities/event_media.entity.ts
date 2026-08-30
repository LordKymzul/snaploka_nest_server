import { EVENT_MEDIA_STATUS } from 'src/core/util/constant';

export class EventMediaEntity {
    id: string;
    guest_name: string;
    status: EVENT_MEDIA_STATUS;
    mime_type: string;
    storage_key: string;
    thumbnail_key?: string;
    file_size_bytes: number;
    metadata?: Record<string, any>;
    event_id: string;
    created_at: Date;
    updated_at: Date;
    url?: string;

    static fromDBApplication(data: any): EventMediaEntity {
        const toNumberIfBigInt = (value: any) => typeof value === 'bigint' ? Number(value) : value;

        return {
            id: data.guid ?? data.id,
            guest_name: data.guest_name,
            status: data.status,
            mime_type: data.mime_type,
            storage_key: data.storage_key,
            thumbnail_key: data.thumbnail_key,
            file_size_bytes: toNumberIfBigInt(data.file_size_bytes),
            metadata: data.metadata ?? {},
            event_id: data.event_guid ?? data.event_id,
            created_at: data.created_at,
            updated_at: data.updated_at,
            url: data.url,
        };
    }
}
