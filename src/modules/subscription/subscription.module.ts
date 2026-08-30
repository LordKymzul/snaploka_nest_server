import { Module } from '@nestjs/common';
import { EventPackageModule } from './event_package/event_package.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [EventPackageModule, OrderModule, PaymentModule]
})
export class SubscriptionModule {}
