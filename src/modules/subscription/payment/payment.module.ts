import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Config } from 'src/core/util/config';
import { OrderModule } from '../order/order.module';
import { EventPackageModule } from '../event_package/event_package.module';
import { EventModule } from 'src/modules/engagement/event/event.module';
import { JwtProtectedMiddleware } from 'src/core/shared/middleware/jwt-protected-middleware';
import { DbappModule } from 'src/core/database/dbapp/dbapp.module';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [
    StripeModule,
    DbappModule
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService, Config

  ],
})
export class PaymentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtProtectedMiddleware).forRoutes(PaymentController);
  }
}
