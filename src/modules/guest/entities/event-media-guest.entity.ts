
import { EVENT_MEDIA_STATUS } from "src/core/util/constant";

export class EventMediaGuestEntity {
    id: string;
    guest_name: string;
    status: EVENT_MEDIA_STATUS;
    mime_type: string;
    event_id: string;
    created_at: Date;
    updated_at: Date;
    url?: string;

    static fromDBApplication(data: any): EventMediaGuestEntity {
        return {
            id: data.id,
            guest_name: data.guest_name,
            status: data.status,
            mime_type: data.mime_type,
            event_id: data.event_guid ?? data.event_id,
            created_at: data.created_at,
            updated_at: data.updated_at,
            url: data.url,
        };
    }
}