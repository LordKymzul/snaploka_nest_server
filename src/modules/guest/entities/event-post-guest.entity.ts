import { EVENT_ATTACHMENT_STATUS } from "src/core/util/constant";

export class EventPostAttachmentGuestEntity {
    id: string;
    mime_type: string;
    file_size_bytes: number;
    upload_url: string;
    status: EVENT_ATTACHMENT_STATUS;
    post_id: string;

    static fromDBApplication(eventPostAttachment: any): EventPostAttachmentGuestEntity {
        return {
            id: eventPostAttachment.guid ?? eventPostAttachment.id,
            mime_type: eventPostAttachment.mime_type,
            file_size_bytes: eventPostAttachment.file_size_bytes,
            upload_url: eventPostAttachment.upload_url,
            status: eventPostAttachment.status,
            post_id: eventPostAttachment.event_post_id,
        };
    }
}

export class EventPostGuestEntity {
    id: string;
    event_id: string;
    guest_name: string;
    content: string;
    attachments: EventPostAttachmentGuestEntity[];

    static fromDBApplication(eventPost: any): EventPostGuestEntity {
        return {
            id: eventPost.guid ?? eventPost.id,
            event_id: eventPost.event_id,
            guest_name: eventPost.guest_name,
            content: eventPost.content,
            attachments: eventPost.attachments ? eventPost.attachments.map(EventPostAttachmentGuestEntity.fromDBApplication) : undefined,
        };
    }
}


