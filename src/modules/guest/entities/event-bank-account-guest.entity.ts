import { EVENT_BANK_ACCOUNT_TYPE } from "src/core/util/constant";

export class EventBankAccountGuestEntity {
    id: string;
    bank_name: string;
    account_number: string;
    account_holder_name: string;
    qr_image_url: string;
    type: EVENT_BANK_ACCOUNT_TYPE;


    static fromDBApplication(data: any): EventBankAccountGuestEntity {
        return {
            id: data.id,
            bank_name: data.bank_name,
            account_number: data.account_number,
            account_holder_name: data.account_holder_name,
            qr_image_url: data.qr_image_url ?? null,
            type: data.type as EVENT_BANK_ACCOUNT_TYPE

        };
    }
}