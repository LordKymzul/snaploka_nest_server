import { EVENT_ATTACHMENT_STATUS } from "src/core/util/constant";
import { EventEntity } from "../../event/entities/event.entity";


export class EventPostAttachmentEntity {
    id: string;
    mime_type: string;
    storage_key: string;
    file_size_bytes: number;
    status: EVENT_ATTACHMENT_STATUS;
    metadata?: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    post_id: string;
    upload_url?: string;
    post?: EventPostEntity;


    static fromDBApplication(eventPostAttachment: any): EventPostAttachmentEntity {
        return {
            id: eventPostAttachment.guid ?? eventPostAttachment.id,
            mime_type: eventPostAttachment.mime_type,
            storage_key: eventPostAttachment.storage_key,
            file_size_bytes: eventPostAttachment.file_size_bytes,
            status: eventPostAttachment.status,
            metadata: eventPostAttachment.metadata ?? {},
            created_at: eventPostAttachment.created_at,
            updated_at: eventPostAttachment.updated_at,
            post_id: eventPostAttachment.event_post_id,
            post: eventPostAttachment.post ? EventPostEntity.fromDBApplication(eventPostAttachment.post) : undefined,
            upload_url: eventPostAttachment.upload_url,
        };
    }
}

export class EventPostEntity {
    id: string;
    guest_name?: string;
    content?: string;
    metadata?: Record<string, any>;
    event_id: string;
    created_at: Date;
    updated_at: Date;
    event?: EventEntity;

    attachments?: EventPostAttachmentEntity[];

    static fromDBApplication(eventPost: any): EventPostEntity {
        return {
            id: eventPost.guid ?? eventPost.id,
            guest_name: eventPost.guest_name,
            content: eventPost.content,
            metadata: eventPost.metadata ?? {},
            event_id: eventPost.event_id,
            created_at: eventPost.created_at,
            updated_at: eventPost.updated_at,
            event: eventPost.event ? EventEntity.fromDBApplication(eventPost.event) : undefined,
            attachments: eventPost.attachments ? eventPost.attachments.map(EventPostAttachmentEntity.fromDBApplication) : undefined,
        };
    }
}


