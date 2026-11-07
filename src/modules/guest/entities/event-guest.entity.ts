import { EVENT_STATUS, EVENT_TYPE } from "src/core/util/constant";
import { toNumberIfBigInt } from "src/core/util/helper";
import { EventEntity } from "src/modules/engagement/event/entities/event.entity";
import { EventBankAccountGuestEntity } from "./event-bank-account-guest.entity";

export class EventGuestEntity {
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
    thumbnail_url?: string;

    current_image_count: number;
    current_video_count: number;
    current_audio_count: number;
    current_note_count: number;

    bank_account?: EventBankAccountGuestEntity;


    static fromDBApplication(data: any): EventGuestEntity {
        return {
            id: data.id,
            name: data.name,
            description: data.description,
            status: data.status,
            type: data.type,
            start_date: data.start_date,
            end_date: data.end_date,
            max_media_allowed: toNumberIfBigInt(data.max_media_allowed),
            max_storage_bytes: toNumberIfBigInt(data.max_storage_bytes),
            current_media_count: toNumberIfBigInt(data.current_media_count),
            current_storage_bytes: toNumberIfBigInt(data.current_storage_bytes),
            thumbnail_url: data.thumbnail_url,
            current_image_count: data.current_image_count,
            current_video_count: data.current_video_count,
            current_audio_count: data.current_audio_count,
            current_note_count: data.current_note_count,
            bank_account: data.bank_account ? EventBankAccountGuestEntity.fromDBApplication(data.bank_account) : undefined,
        };
    }

}

