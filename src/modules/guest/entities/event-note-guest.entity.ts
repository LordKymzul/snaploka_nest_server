import { EVENT_NOTE_STATUS } from "src/core/util/constant";


export class EventNoteGuestEntity { 
    id: string;
    guest_name?: string;
    title?: string;
    content: string;
    status: EVENT_NOTE_STATUS;
    event_id: string;
    created_at: Date;
    updated_at: Date;

    static fromDBApplication(data: any): EventNoteGuestEntity {
        return {
            id: data.guid ?? data.id,
            guest_name: data.guest_name,
            title: data.title,
            content: data.content,
            status: data.status,
            event_id: data.event_guid ?? data.event_id,
            created_at: data.created_at,
            updated_at: data.updated_at,
        };
    }
}