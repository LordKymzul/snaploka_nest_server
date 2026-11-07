import { EVENT_BANK_ACCOUNT_TYPE } from "src/core/util/constant";
import { EventEntity } from "../../event/entities/event.entity";

export class EventBankAccountEntity {
    id: string;
    bank_name: string;
    account_number: string;
    account_holder_name: string;
    qr_image_storage_key: string;
    is_active: boolean;
    metadata: Record<string, any>;
    event_id: string;
    type: EVENT_BANK_ACCOUNT_TYPE;
    created_at: Date;
    updated_at: Date;
    event?: EventEntity;
    qr_image_url?: string;

    static fromDBApplication(data: any): EventBankAccountEntity {
        return {
            id: data.guid ?? data.id,
            bank_name: data.bank_name,
            account_number: data.account_number,
            account_holder_name: data.account_holder_name,
            qr_image_storage_key: data.qr_image_storage_key,
            is_active: data.is_active,
            metadata: data.metadata,
            event_id: data.event_guid ?? data.event_id,
            type: data.type as EVENT_BANK_ACCOUNT_TYPE,
            created_at: data.created_at,
            updated_at: data.updated_at,
            event: data.event ? EventEntity.fromDBApplication(data.event) : undefined,
            qr_image_url: data.qr_image_url ?? null,
        };
    }


}




