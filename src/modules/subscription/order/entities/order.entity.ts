import { ORDER_PAYMENT_PROVIDER, ORDER_STATUS } from 'src/core/util/constant';
import { EventEntity } from 'src/modules/engagement/event/entities/event.entity';
import { EventPackageEntity } from '../../event_package/entities/event_package.entity';
import { UserEntity } from 'src/modules/identity/user/entities/user.entity';

export class OrderEntity {
    id: string;
    user_id: string;
    package_id?: string;
    event_id?: string;
    package_name?: string;
    amount: number;
    currency: string;
    max_media_allowed: number;
    max_storage_bytes: number;
    status: ORDER_STATUS;
    payment_provider: ORDER_PAYMENT_PROVIDER;
    provider_order_id?: string;
    provider_payment_id?: string;
    payment_url?: string;
    metadata?: Record<string, any>;
    paid_at?: Date;
    created_at: Date;
    updated_at: Date;

    event?: EventEntity | null;
    package?: EventPackageEntity | null;
    user?: UserEntity | null;

    static fromDBApplication(order: any): OrderEntity {
        const toNumberIfBigInt = (value: any) => typeof value === 'bigint' ? Number(value) : value;

        return {
            id: order.guid ?? order.id,
            user_id: order.user_guid ?? order.user_id,
            package_id: order.package_guid ?? order.package_id,
            event_id: order.event_guid ?? order.event_id,
            package_name: order.package_name,
            amount: toNumberIfBigInt(order.amount),
            currency: order.currency,
            max_media_allowed: toNumberIfBigInt(order.max_media_allowed),
            max_storage_bytes: toNumberIfBigInt(order.max_storage_bytes),
            status: order.status,
            payment_provider: order.payment_provider,
            provider_order_id: order.provider_order_id,
            provider_payment_id: order.provider_payment_id,
            payment_url: order.payment_url,
            metadata: order.metadata ?? {},
            paid_at: order.paid_at,
            created_at: order.created_at,
            updated_at: order.updated_at,
            event: order.event ? EventEntity.fromDBApplication(order.event) : null,
            package: order.package ? EventPackageEntity.fromDBApplication(order.package) : null,
            user: order.user ? UserEntity.fromDBApplication(order.user) : null,
        };
    }
}
